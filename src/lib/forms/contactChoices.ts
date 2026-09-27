import type { Payload } from 'payload';
import { publishedToolsWhere } from '@/collections/Tools';
import type { ContactChoices } from './contact';

/**
 * The Domain, Industry and Tool options for the contact form, read from the
 * CMS so they always match the published pages. Shared by the page (to render
 * the selects) and the server action (to check what was submitted).
 *
 * Tools use the same publish gate as /tools: an unvalidated tool must not be
 * offered anywhere (pp. 3, 166).
 */
export async function loadContactChoices(payload: Payload): Promise<ContactChoices & { ids: Record<string, number> }> {
  const [domains, industries, tools] = await Promise.all([
    payload.find({ collection: 'domains', limit: 100, depth: 0, sort: 'title', select: { slug: true, title: true } }),
    payload.find({ collection: 'industries', limit: 100, depth: 0, sort: 'title', select: { slug: true, title: true } }),
    payload.find({
      collection: 'tools',
      where: publishedToolsWhere,
      limit: 100,
      depth: 0,
      sort: 'title',
      select: { slug: true, title: true },
    }),
  ]);

  // slug -> id per collection, so the action can store real relationships.
  const ids: Record<string, number> = {};
  const toChoices = (prefix: string, docs: { id: number; slug?: string | null; title?: string | null }[]) =>
    docs
      .filter((d) => d.slug && d.title)
      .map((d) => {
        ids[`${prefix}:${d.slug}`] = d.id;
        return { slug: String(d.slug), title: String(d.title) };
      });

  return {
    domains: toChoices('domain', domains.docs),
    industries: toChoices('industry', industries.docs),
    tools: toChoices('tool', tools.docs),
    ids,
  };
}
