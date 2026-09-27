import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { providerEnabled, getProvider } from '@/lib/api/core/registry';
import { createRateLimiter } from '@/lib/forms/rateLimit';
import { VectorStore } from '@/lib/api/ai-search/vectorStore';
import kbIndex from '@/lib/api/ai-search/kb-index.json';
import fs from 'fs';
import path from 'path';

function logCostLedger(reqId: string, session: string, model: string, tokens: number, cost: number) {
  try {
    const dir = path.resolve('./logs');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const logEntry = { timestamp: new Date().toISOString(), request_id: reqId, session_id: session, model, tokens_used: tokens, cost_estimate: cost };
    fs.appendFileSync(path.join(dir, 'ai-search-ledger.jsonl'), JSON.stringify(logEntry) + '\n');
  } catch (e) {
    console.error('Ledger append error', e);
  }
}

// Internal budget for AI Search Phase 1
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const searchBudget = { perDay: 50, perMinute: 4, perVisitorPerHour: 10 };
const dayLimiter = createRateLimiter({ limit: searchBudget.perDay, windowMs: DAY });
const minuteLimiter = createRateLimiter({ limit: searchBudget.perMinute, windowMs: MINUTE });
const visitorLimiter = createRateLimiter({ limit: searchBudget.perVisitorPerHour, windowMs: HOUR });

export async function POST(request: Request) {
  if (!providerEnabled('openai')) {
    return NextResponse.json({ status: 'error', refusal_reason: 'OpenAI provider is disabled' }, { status: 503 });
  }

  const provider = getProvider('openai');
  const apiKey = process.env[provider.keyEnvVar ?? 'OPENAI_API_KEY'];

  if (!apiKey) {
    return NextResponse.json({ status: 'error', refusal_reason: 'API Key not configured' }, { status: 500 });
  }

  const visitorKey = request.headers.get('x-forwarded-for') ?? 'anonymous';
  const now = Date.now();

  if (!dayLimiter.peek('all', now).allowed || !minuteLimiter.peek('all', now).allowed || !visitorLimiter.peek(visitorKey, now).allowed) {
    return NextResponse.json({ status: 'refused', refusal_reason: 'Rate limit exceeded' }, { status: 429 });
  }
  
  dayLimiter.consume('all', now);
  minuteLimiter.consume('all', now);
  visitorLimiter.consume(visitorKey, now);

  try {
    const body = await request.json();
    const { request_id, session_id, query, locale, promotion_opt_out } = body;

    if (!query || typeof query !== 'string' || query.length > 300) {
      return NextResponse.json({ status: 'refused', refusal_reason: 'Invalid query length' }, { status: 400 });
    }

    const client = new OpenAI({ apiKey });
    const hasResponsesApi = 'responses' in (client as any);
    
    let answerText = '';
    let citations: any[] = [];
    let callToAction: any = null;
    let company_knowledge: any[] = [];
    
    // Phase 2: Ingest and Search KB
    const store = new VectorStore(kbIndex as any);
    const searchResults = await store.search(query, null, 2); // lexical fallback
    if (searchResults.length > 0) {
      company_knowledge = searchResults.map(r => r.doc);
    }
    
    let totalTokens = 0;
    let totalCost = 0;

    if (hasResponsesApi) {
      const responseClient = client as any;
      const research = await responseClient.responses.create({
        model: 'gpt-5.6-terra',
        input: query,
        tools: [{ type: 'web_search' }]
      });
      answerText = research.output?.text || 'No answer generated.';
      citations = research.output?.citations || [];
      totalTokens = research.usage?.total_tokens || 200;
      totalCost = (totalTokens / 1000) * 0.03;
    } else {
      const fallbackClient = client as any;
      const completion = await fallbackClient.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: query }],
        max_tokens: 600,
        temperature: 0.1,
      });
      answerText = completion.choices[0]?.message.content || 'No answer generated.';
      citations = [{ id: 1, url: 'https://www.enerqa.co.uk/domains-and-industries', title: 'Enerqa Domains' }];
      totalTokens = completion.usage?.total_tokens || 150;
      totalCost = (totalTokens / 1000) * 0.01;
    }

    // Phase 2: Secondary Structured Classifier for Company Relevance
    try {
      const fallbackClient = client as any;
      const classifierResponse = await fallbackClient.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an internal classifier. Analyze the user query for commercial intent and topic relevance. Respond with strict JSON matching { topic_relevance: number, service_fit: number, intent_clarity: number, relevant_services: string[] } from 0-10.' },
          { role: 'user', content: query }
        ],
        response_format: { type: 'json_object' },
      });

      const classification = JSON.parse(classifierResponse.choices[0]?.message.content || '{}');
      const score = (classification.topic_relevance || 0) + (classification.service_fit || 0) + (classification.intent_clarity || 0);
      
      const classifierTokens = classifierResponse.usage?.total_tokens || 50;
      totalTokens += classifierTokens;
      totalCost += (classifierTokens / 1000) * 0.01;
      
      if (!promotion_opt_out) {
        if (score >= 24) {
          callToAction = { type: 'contact', text: 'Discuss Your Project', link: '/contact' };
        } else if (score >= 18) {
          callToAction = { type: 'service', text: 'Explore Related Services', link: '/domains-and-industries', services: classification.relevant_services || [] };
        } else if (score >= 12) {
          callToAction = { type: 'note', text: 'Enerqa provides expertise in this domain.', link: '/knowledge-hub' };
        }
      }
    } catch (classifierError) {
      console.error('Classifier failed, suppressing cards:', classifierError);
    }
    
    // Log to cost ledger
    const actualReqId = request_id || crypto.randomUUID();
    logCostLedger(actualReqId, session_id || 'session-fallback', hasResponsesApi ? 'gpt-5.6-terra' : 'gpt-4o', totalTokens, totalCost);

    return NextResponse.json({
      request_id: actualReqId,
      session_id: session_id || 'session-fallback',
      answer: {
        text: answerText,
        citations: citations,
      },
      company_knowledge: company_knowledge,
      call_to_action: callToAction,
      status: 'success'
    });

  } catch (error: unknown) {
    console.error('AI Search Error:', error);
    return NextResponse.json({ status: 'error', refusal_reason: 'Internal Server Error' }, { status: 500 });
  }
}
