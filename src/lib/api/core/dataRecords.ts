import { providerEnabled } from './registry';
import { storeRecords } from './storage';
import { fail, type ConnectorResult, type DataSeries } from './types';

/** Store the data actually returned; no cached timestamp is replaced with render time. */
export async function retainSeries(result: ConnectorResult<DataSeries[]>): Promise<ConnectorResult<DataSeries[]>> {
  if (!result.ok) return result;
  if (!providerEnabled(result.providerId)) return fail(result.providerId, 'disabled', 'This source is paused pending review.');
  try {
    const stored = await storeRecords(result.data.map(s => ({ provider: s.provenance.providerId, sourceId: s.id, destination: s.provenance.sourceUrl,
      accessStatus: s.provenance.accessStatus, accessCheckedAt: s.provenance.accessCheckedAt, retrievedAt: s.provenance.retrievedAt, record: s })));
    return stored ? result : fail(result.providerId, 'unavailable', 'Source evidence could not be stored.');
  } catch {
    return fail(result.providerId, 'unavailable', 'Source evidence could not be stored.');
  }
}
