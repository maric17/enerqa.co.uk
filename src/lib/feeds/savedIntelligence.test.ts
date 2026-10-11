import { expect, it } from 'vitest';
import { savedResearchRow } from './savedIntelligence';
import { buildProvenance } from '@/lib/api/core/provenance';
import { RECHECK_SECONDS } from '@/lib/api/core/accessCheck';
const now = Date.now();
const checked = new Date(now - 1000).toISOString();
const row = {
  provider: 'openalex', destination: 'https://example.org/paper', access_status: 'verified_open',
  access_checked_at: checked, retrieved_at: checked, verdict: null,
  record: { id: 'paper', title: 'Energy research in Germany', summary: 'Licensed metadata abstract', authors: ['Author'],
    readUrl: 'https://example.org/paper', source: 'Journal', doi: null, publishedAt: checked, kind: 'research',
    provenance: buildProvenance('openalex', { sourceUrl: 'https://example.org/paper', accessStatus: 'verified_open', accessCheckedAt: checked }) },
};
it('reads original saved research and keeps abstract text out of public cards', () => {
  expect(savedResearchRow(row, now)).toMatchObject({ title: row.record.title, summary: null, type: 'research', coverage: { country: ['DEU'] } });
});
it('suppresses expired evidence, newer refusals and malformed shared-table records', () => {
  expect(savedResearchRow({ ...row, access_checked_at: new Date(now - RECHECK_SECONDS * 1000 - 1).toISOString() }, now)).toBeNull();
  expect(savedResearchRow({ ...row, verdict: { checkedAt: new Date(now).toISOString(), status: 'gated' } }, now)).toBeNull();
  expect(savedResearchRow({ ...row, record: { title: 'Card projection without provenance' } }, now)).toBeNull();
});
