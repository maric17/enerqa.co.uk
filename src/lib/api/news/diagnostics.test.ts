import { afterEach, describe, expect, it, vi } from 'vitest';
import { fail } from '../core/types';
import { createNewsDiagnostics, logNewsDiagnostics, noteNewsProvider } from './diagnostics';

afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe('safe news diagnostics', () => {
  it('classifies database accounting failure without forwarding connection secrets', () => {
    const diagnostics = createNewsDiagnostics('all');
    noteNewsProvider(diagnostics, 'gdelt', fail('gdelt', 'unavailable', 'GDELT: shared request accounting unavailable postgres://private-password@host'));
    expect(diagnostics.providers[0].issue).toBe('request_accounting_unavailable');
    expect(JSON.stringify(diagnostics)).not.toContain('private-password');
  });

  it('keeps an HTTP status while discarding URLs, keys and provider error text', () => {
    const diagnostics = createNewsDiagnostics('all');
    noteNewsProvider(diagnostics, 'newsdata', fail('newsdata', 'unavailable', 'HTTP 401 https://newsdata.io/?apikey=secret-key'));
    expect(diagnostics.providers[0].httpStatus).toBe(401);
    expect(JSON.stringify(diagnostics)).not.toContain('secret-key');
    expect(JSON.stringify(diagnostics)).not.toContain('https://');
  });

  it('only logs in a deployed build when NEWS_DEBUG is enabled', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEWS_DEBUG', undefined);
    const log = vi.spyOn(console, 'info').mockImplementation(() => {});
    const diagnostics = createNewsDiagnostics('all');
    logNewsDiagnostics(diagnostics);
    expect(log).not.toHaveBeenCalled();
    vi.stubEnv('NEWS_DEBUG', 'true');
    logNewsDiagnostics(diagnostics);
    expect(log).toHaveBeenCalledWith('[enerqa:news]', JSON.stringify(diagnostics));
    vi.stubEnv('NEWS_DEBUG', 'false');
    logNewsDiagnostics(diagnostics);
    expect(log).toHaveBeenCalledTimes(1);
  });
});
