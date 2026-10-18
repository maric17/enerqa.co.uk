import { describe, it, expect } from 'vitest';
import { createRateLimiter } from './rateLimit';
import { allowSubmission } from './limits';
import {
  EMPTY_CONTACT_VALUES,
  checkChoices,
  contactSchema,
  intentToEnquiryType,
  prefillFromSearchParams,
  readContactForm,
  splitName,
  type ContactChoices,
} from './contact';

const CHOICES: ContactChoices = {
  domains: [{ slug: 'energy-systems-transition', title: 'Energy Systems & Transition' }],
  industries: [{ slug: 'oil-and-gas', title: 'Oil and Gas' }],
  tools: [{ slug: 'easysolar', title: 'easySOLAR' }],
};

describe('rate limiter (p. 228 spam protection)', () => {
  it('allows `limit` attempts per window, then blocks until the window ends', () => {
    const rl = createRateLimiter({ limit: 2, windowMs: 1000 });
    expect(rl.consume('ip', 0).allowed).toBe(true);
    expect(rl.consume('ip', 10).allowed).toBe(true);
    const blocked = rl.consume('ip', 20);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBe(980);
    expect(rl.consume('ip', 1000).allowed).toBe(true);
  });

  it('counts each visitor separately', () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 1000 });
    expect(rl.consume('a', 0).allowed).toBe(true);
    expect(rl.consume('b', 0).allowed).toBe(true);
    expect(rl.consume('a', 1).allowed).toBe(false);
  });

  it('peeks without recording an attempt', () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 1000 });
    expect(rl.peek('a', 0).allowed).toBe(true);
    expect(rl.peek('a', 0).allowed).toBe(true);
    rl.consume('a', 0);
    expect(rl.peek('a', 1).allowed).toBe(false);
  });

  it('charges the site-wide ceiling only for visitors within their own limit', () => {
    const visitor = createRateLimiter({ limit: 1, windowMs: 1000 });
    const ceiling = createRateLimiter({ limit: 2, windowMs: 1000 });
    expect(allowSubmission(visitor, 'noisy', 0, ceiling)).toBe(true);
    // The noisy visitor's extra attempts are refused and do not use up the ceiling...
    expect(allowSubmission(visitor, 'noisy', 1, ceiling)).toBe(false);
    expect(allowSubmission(visitor, 'noisy', 2, ceiling)).toBe(false);
    // ...so another visitor still gets through.
    expect(allowSubmission(visitor, 'other', 3, ceiling)).toBe(true);
    expect(allowSubmission(visitor, 'third', 4, ceiling)).toBe(false); // ceiling reached
  });
});

describe('contact prefill from the URL (p. 198 F02)', () => {
  it('maps the ?intent= values other pages link with to the three spec types', () => {
    expect(intentToEnquiryType('project')).toBe('project');
    expect(intentToEnquiryType('tool')).toBe('tool');
    expect(intentToEnquiryType('tool-support')).toBe('tool');
    expect(intentToEnquiryType('TOOL-ACCESS')).toBe('tool');
    expect(intentToEnquiryType('general')).toBe('general');
    expect(intentToEnquiryType('media')).toBe('');
    expect(intentToEnquiryType(undefined)).toBe('');
  });

  it('preselects Tool Access and the tool for /contact?intent=tool&tool=easysolar', () => {
    const v = prefillFromSearchParams({ intent: 'tool', tool: 'easysolar' }, CHOICES);
    expect(v.enquiryType).toBe('tool');
    expect(v.tool).toBe('easysolar');
  });

  it('treats ?tool= on its own as a Tool Access enquiry', () => {
    expect(prefillFromSearchParams({ tool: 'easysolar' }, CHOICES).enquiryType).toBe('tool');
  });

  it('preselects domain and industry from the domain and industry pages', () => {
    const v = prefillFromSearchParams({ domain: 'energy-systems-transition', industry: 'oil-and-gas' }, CHOICES);
    expect(v.domain).toBe('energy-systems-transition');
    expect(v.industry).toBe('oil-and-gas');
  });

  it('ignores unknown or unpublished values rather than trusting them', () => {
    // mrv-tool is unvalidated, so it is not in the choices.
    const v = prefillFromSearchParams({ intent: 'tool', tool: 'mrv-tool', domain: 'nope' }, CHOICES);
    expect(v.tool).toBe('');
    expect(v.domain).toBe('');
    expect(v.enquiryType).toBe('tool');
  });

  it('does not attach a tool to a project enquiry', () => {
    expect(prefillFromSearchParams({ intent: 'project', tool: 'easysolar' }, CHOICES).tool).toBe('');
  });
});

describe('contact validation (p. 198, p. 228)', () => {
  const valid = { ...EMPTY_CONTACT_VALUES, name: 'Ada Lovelace', email: 'ada@example.org', enquiryType: 'general', message: 'Hello' };

  it('requires Name, Email, Enquiry Type and Message; the rest is optional', () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
    const r = contactSchema.safeParse(EMPTY_CONTACT_VALUES);
    expect(r.success).toBe(false);
    if (!r.success) {
      const fields = r.error.issues.map((i) => i.path[0]);
      expect(fields).toEqual(expect.arrayContaining(['name', 'email', 'enquiryType', 'message']));
      expect(fields).not.toContain('organisation');
      expect(fields).not.toContain('newsletterConsent');
    }
  });

  it('accepts only the three spec enquiry types', () => {
    expect(contactSchema.safeParse({ ...valid, enquiryType: 'media' }).success).toBe(false);
  });

  it('never requires newsletter consent (p. 198)', () => {
    expect(contactSchema.safeParse({ ...valid, newsletterConsent: false }).success).toBe(true);
  });

  it('rejects select values that were not offered', () => {
    const tampered = contactSchema.parse({ ...valid, enquiryType: 'tool', tool: 'mrv-tool', domain: 'x' });
    expect(checkChoices(tampered, CHOICES)).toEqual({
      domain: ['Please choose a domain from the list.'],
      tool: ['Please choose a tool from the list.'],
    });
    expect(checkChoices(contactSchema.parse({ ...valid, domain: 'energy-systems-transition' }), CHOICES)).toBeNull();
  });

  it('reads the form as trimmed strings, so the values can be sent back after an error', () => {
    const fd = new FormData();
    fd.set('name', '  Ada ');
    fd.set('newsletterConsent', 'on');
    const v = readContactForm(fd);
    expect(v.name).toBe('Ada');
    expect(v.email).toBe('');
    expect(v.newsletterConsent).toBe(true);
  });

  it('splits one Name into the stored first/last columns without inventing a surname', () => {
    expect(splitName('Ada  King Lovelace')).toEqual({ firstName: 'Ada', lastName: 'King Lovelace' });
    expect(splitName('Plato')).toEqual({ firstName: 'Plato', lastName: '—' });
  });
});
