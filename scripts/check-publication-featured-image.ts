/** Check image saving and draft privacy without retaining a test publication. */
import { getPayload, type PayloadRequest } from 'payload';
import config from '../src/payload.config';
import { publicationImage } from '../src/components/publications/publicationImage';

const payload = await getPayload({ config });
const transactionID = await payload.db.beginTransaction();
if (!transactionID) throw new Error('A transaction is required for this check.');
try {
  const req = { transactionID } as PayloadRequest;
  const media = await payload.find({ collection: 'media', where: { mimeType: { contains: 'image/' } }, limit: 1, req });
  const image = media.docs[0];
  if (!image) throw new Error('An existing image is required to verify the upload relationship.');
  const draft = await payload.create({ collection: 'publications', draft: true, data: {
    title: 'Featured image verification', slug: `featured-image-check-${Date.now()}`, featuredImage: image.id,
  }, req });
  // Read through the same version query used by the dashboard, with media populated.
  const saved = await payload.find({ collection: 'publications', draft: true, depth: 1, where: { id: { equals: draft.id } }, req });
  const chosen = publicationImage(saved.docs[0]);
  if (!chosen || typeof saved.docs[0].featuredImage !== 'object' || saved.docs[0].featuredImage?.id !== image.id) throw new Error('The featured image did not survive draft saving.');
  const publicDraft = await payload.find({ collection: 'publications', overrideAccess: false, where: { id: { equals: draft.id } }, req });
  if (publicDraft.totalDocs) throw new Error('The image fixture leaked into public articles.');
  console.log(JSON.stringify({ featuredImageSavedInDraft: true, populatedImageResolved: true, draftRemainsPrivate: true }));
} finally {
  await payload.db.rollbackTransaction(transactionID);
}

// Payload retains a pooled listener in standalone scripts; the fixture is rolled back.
process.exit(0);
