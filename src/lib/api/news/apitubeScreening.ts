import { containsAny, EDITORIAL_REVIEW_VERSION, hasEditorialApproval, isNewsRoundup, type EditorialTopic, type NewsItem } from './types';
import { isStockMarketNews } from './markets';
import { NEWS_INDUSTRY_VERSION, newsIndustries } from '../../feeds/contextual';

const ANCHORS: Record<Exclude<EditorialTopic, 'markets'>, string[]> = {
  climate: ['climate change', 'climate crisis', 'climate policy', 'climate action', 'climate summit', 'climate campaign*',
    'climate finance', 'climate adaptation', 'emission', 'carbon', 'greenhouse', 'net zero', 'net-zero', 'global warming', 'decarbon*'],
  energy: ['renewab*', 'solar', 'wind power', 'wind farm', 'electricity', 'energy storage', 'hydrogen', 'nuclear', 'natural gas',
    'oil prices', 'oil market', 'oil and gas', 'power grid', 'energy transition', 'energy security', 'energy efficiency',
    'batteries', 'battery', 'electric truck', 'electric bus', 'electric vehicle', 'charging station', 'fossil fuel', 'coal', 'geothermal', 'hydropower', 'gasfield'],
  environment: ['biodiversity', 'pollut*', 'conservation', 'deforest*', 'circular economy', 'recycl*', 'waste', 'wildlife',
    'ecosystem', 'endangered', 'habitat', 'toxic chemical', 'chemical contamination', 'environmental', 'food systems',
    // Coastal development impacts can be explicit without the word "environment" in the teaser.
    'turtle nest', 'coral reef'],
  business: ['sustainable finance', 'climate finance', 'green bond', 'ESG', 'sustainable business', 'sustainability reporting',
    'carbon credit', 'green investment', 'green finance', 'adaptation finance', 'sustainable investment', 'corporate sustainability'],
};

/** Categories are evidence, not approval: the first live category request included film interviews. */
export function apiTubeTopics(item: NewsItem): EditorialTopic[] {
  if (isNewsRoundup(item.title) || /\b(weather forecast|climate summary|horoscope|political climate|climate on set)\b/i.test(item.title)) return [];
  const categories = Array.isArray(item.providerCategories) ? item.providerCategories.filter(category => category
    && typeof category.id === 'string' && typeof category.name === 'string') : [];
  const names = categories.map(category => category.name).join(' ').toLowerCase();
  if (!categories.length) return [];
  const environment = categories.some(category => category.id === 'medtop:06000000') || /environment|conservation|climate|nature|pollution|sustainability|waste/.test(names);
  // Transport categories can carry electricity, battery and fleet-transition reporting.
  const energy = environment || /energy|power|electricity|oil|gas|coal|fuel|utilities|transport|vehicle|mobility/.test(names);
  const finance = /business|finance|financial|investment|stock|securities|sustainability/.test(names);
  const text = `${item.title} ${item.summary ?? ''}`;
  const topics: EditorialTopic[] = [];
  if (environment && containsAny(text, ANCHORS.climate)) topics.push('climate');
  if (energy && containsAny(text, ANCHORS.energy)) topics.push('energy');
  // Vehicle policy can be classified as transport/business while its emissions context is explicit.
  if (!topics.includes('climate') && /transport|vehicle|mobility/.test(names)
    && containsAny(text, ['zero-emission', 'zero emission', 'electric vehicle', 'fleet electrification'])
    && containsAny(text, ['emission', 'carbon', 'air quality'])) topics.push('climate');
  if (environment && containsAny(text, ANCHORS.environment)) topics.push('environment');
  if ((finance || environment) && containsAny(text, ANCHORS.business)) topics.push('business');
  // Corporate environmental obligations are ESG coverage even without the literal acronym.
  if (!topics.includes('business') && (finance || environment)
    && containsAny(text, ['corporate', 'company', 'companies', 'business', 'bank', 'investor', 'finance', 'financial'])
    && containsAny(text, ['sustainab*', 'deforest*', 'emission', 'carbon', 'climate finance', 'environmental regulation'])) topics.push('business');
  // "Wall Street bosses" also appears in legal/scandal stories; require actual stock reporting.
  const stockSubject = /\b(stocks|equities|shares|share prices|Nasdaq|S&P\s*500|Dow Jones|NYSE|FTSE|Nikkei|Hang Seng|Sensex|Nifty|Tadawul|DAX|STOXX)\b/i.test(item.title);
  const marketMove = /\b(rise|rises|rose|fall|falls|fell|gain|gains|surge|surges|slide|slides|rally|rallies|drop|drops|jump|jumps|climb|climbs|dip|dips|flat|higher|lower|open|opens|close|closes|sell-off|selloff|record)\b/i.test(item.title);
  if (finance && stockSubject && marketMove && isStockMarketNews({ title: item.title, summary: item.summary })) topics.push('markets');
  return topics;
}

/** This records a provider-and-rules decision honestly; it never calls an AI service. */
export function screenApiTubeItem(item: NewsItem): NewsItem {
  const topics = apiTubeTopics(item);
  return { ...item, editorialReview: { version: EDITORIAL_REVIEW_VERSION, method: 'apitube-categories-and-rules-v1',
    industries: newsIndustries(item), industryVersion: NEWS_INDUSTRY_VERSION,
    decision: topics.length ? 'approved' : 'rejected', topics, title: item.title, summary: item.summary,
    reason: topics.length ? 'APITube article categories and contextual topic rules agree.' : 'Missing category evidence, unrelated context, or a mixed newspaper/weather digest.',
    reviewedAt: new Date().toISOString() } };
}

/** Revalidate saved classification evidence too, so stale or changed metadata cannot bypass screening. */
export function hasApiTubeApproval(item: NewsItem): boolean {
  const topics = apiTubeTopics(item);
  const industries = newsIndustries(item);
  const reviewedIndustries = item.editorialReview?.industries;
  return hasEditorialApproval(item) && item.editorialReview?.method === 'apitube-categories-and-rules-v1'
    && (reviewedIndustries === undefined || (item.editorialReview.industryVersion === NEWS_INDUSTRY_VERSION
      && Array.isArray(reviewedIndustries) && reviewedIndustries.length === industries.length
      && industries.every(slug => reviewedIndustries.includes(slug))))
    && topics.length > 0 && topics.length === item.editorialReview.topics.length
    && topics.every(topic => item.editorialReview!.topics.includes(topic));
}
