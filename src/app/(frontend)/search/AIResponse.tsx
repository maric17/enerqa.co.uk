import React from 'react';
import { GoogleGenAI } from '@google/genai';
import { RichText } from '@payloadcms/richtext-lexical/react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function AIResponse({ query, context }: { query: string, context: { title: string, excerpt?: string, type: string, url: string }[] }) {
  if (!process.env.GEMINI_API_KEY) {
    return (
      <div className="bg-yellow-50 text-yellow-800 p-6 rounded-xl border border-yellow-200">
        <p className="font-bold mb-2">AI Search Unavailable</p>
        <p>Please configure the GEMINI_API_KEY environment variable to enable AI-powered answers.</p>
      </div>
    );
  }

  if (context.length === 0) {
    return (
      <div className="bg-gray-50 text-gray-800 p-6 rounded-xl border border-gray-200">
        <p>I cannot find any relevant information on Enerqa to answer your question. Try adjusting your search terms.</p>
      </div>
    );
  }

  const systemInstruction = `
You are an AI assistant for Enerqa, a data analytics firm.
Your task is to answer the user's query based ONLY on the provided Context Records.
STRICT RULES:
1. Never fabricate company work, credentials, or data.
2. Cite only what was actually retrieved in the Context Records.
3. If the Context Records do not contain the answer, politely state that you cannot answer based on the available information. Do not force an Enerqa result into unrelated answers.
4. Format your answer in clean Markdown.

Context Records:
${context.map((c, i) => `[Source ${i + 1}]: ${c.title} (${c.type}) - ${c.excerpt || 'No excerpt'}`).join('\n')}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: query }] }],
      config: {
        systemInstruction,
        temperature: 0.1,
      }
    });

    const answer = response.text;

    return (
      <div className="bg-blue-50 border border-blue-200 p-8 rounded-2xl">
        <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
          <span>✨ AI Answer</span>
        </h3>
        <div className="prose prose-blue max-w-none text-blue-900">
          <p className="whitespace-pre-wrap">{answer}</p>
        </div>
      </div>
    );
  } catch (error) {
    console.error("AI Generation Error:", error);
    return (
      <div className="bg-red-50 text-red-800 p-6 rounded-xl border border-red-200">
        <p className="font-bold mb-2">Error Generating Answer</p>
        <p>There was a problem communicating with the AI service. Please try again later.</p>
      </div>
    );
  }
}
