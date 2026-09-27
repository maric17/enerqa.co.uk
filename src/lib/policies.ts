import { cache } from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { POLICY_PAGES, publishedPoliciesWhere } from '@/collections/Policies';

// Approved policy rows only (p. 208 U02). cache() lets the policy page, its
// metadata and the footer share one database query per request.
export const getPublishedPolicies = cache(async () => {
  const payload = await getPayload({ config: configPromise });
  const { docs } = await payload.find({
    collection: 'policies',
    where: { and: [publishedPoliciesWhere, { slug: { in: POLICY_PAGES.map((p) => p.slug) } }] },
    limit: POLICY_PAGES.length,
    depth: 0,
  });
  return docs;
});

// The approved policies as links, in footer order, with their p. 208 titles.
export async function getPublishedPolicyLinks() {
  const docs = await getPublishedPolicies();
  return POLICY_PAGES.filter((p) => docs.some((d) => d.slug === p.slug)).map((p) => ({
    label: p.title,
    href: `/${p.slug}`,
  }));
}

// Forms link the Privacy Notice only once it is published, never to a 404
// (p. 4). A database error drops the link rather than breaking the form.
export async function getPrivacyHref(): Promise<string | undefined> {
  const links = await getPublishedPolicyLinks().catch(() => []);
  return links.find((link) => link.href === '/privacy')?.href;
}
