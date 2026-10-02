import { DATASETS } from './connectors';
import type { Dataset } from '@/payload-types';
import type { ConnectorResult, DataSeries } from '@/lib/api/core/types';

/** Never fetch an arbitrary CMS URL with server credentials. */
export function datasetConnector(dataset: Pick<Dataset, 'apiEndpoint' | 'datasetDownloadUrl'>) {
  for (const path of [dataset.apiEndpoint, dataset.datasetDownloadUrl]) {
    if (!path?.startsWith('/api/data/')) continue;
    const url = new URL(path, 'https://www.enerqa.co.uk');
    const key = url.pathname.slice('/api/data/'.length);
    if (Object.hasOwn(DATASETS, key)) return { ...DATASETS[key], params: url.searchParams };
  }
  return null;
}

export async function loadDatasetSeries(dataset: Pick<Dataset, 'apiEndpoint' | 'datasetDownloadUrl'>): Promise<ConnectorResult<DataSeries[]> | null> {
  const connector = datasetConnector(dataset);
  return connector ? connector.handler(connector.params) : null;
}
