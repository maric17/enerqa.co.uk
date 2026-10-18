/** Exercise draft access using a transaction that is always rolled back. */
import { getPayload, type PayloadRequest } from 'payload';
import config from '../src/payload.config';
const payload = await getPayload({ config });
const transactionID = await payload.db.beginTransaction();
if (!transactionID) throw new Error('A transaction is required for this check.');
try {
  const req = { transactionID } as PayloadRequest;
  const slug = `part12-draft-check-${Date.now()}`;
  const draft = await payload.create({ collection: 'publications', draft: true, data: { title: 'Unpublished verification fixture', slug }, req });
  if (draft._status !== 'draft') throw new Error('New document did not default to draft.');
  const anonymous = await payload.find({ collection: 'publications', draft: true, overrideAccess: false, where: { slug: { equals: slug } }, req });
  if (anonymous.docs.length) throw new Error('Anonymous reader can see a draft.');
  const published = await payload.find({ collection: 'publications', overrideAccess: false, limit: 100, req });
  if (published.docs.some(d => d._status !== 'published' || d.recordKind !== 'article')) throw new Error('Public results include unpublished records.');
  // The dashboard reads the latest saved versions; public rows alone are not enough.
  const dashboard = await payload.find({ collection: 'publications', draft: true, overrideAccess: true, limit: 100, req });
  if (published.docs.some(d => !dashboard.docs.some(v => v.id === d.id))) throw new Error('Published articles are missing from the dashboard version list.');
  if (!dashboard.docs.some(d => d.id === draft.id)) throw new Error('The dashboard cannot see the new draft.');
  console.log(JSON.stringify({ newRecordDefaultsToDraft: true, anonymousDraftResults: anonymous.docs.length, publicArticles: published.totalDocs, dashboardIncludesPublishedArticles: true, dashboardIncludesDraft: true }));
} finally {
  await payload.db.rollbackTransaction(transactionID);
}

// Payload retains a pooled listener connection in standalone scripts.
process.exit(0);
