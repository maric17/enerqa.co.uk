import { z } from 'zod';

/**
 * Contact form rules (handoff p. 198, F02-F04), kept free of Next.js and
 * Payload imports so they can be unit-tested and shared by the page, the
 * client form and the server action.
 */

// p. 198 F02: "Enquiry Type required with Project Discussion, Tool Access or
// General Enquiry" - exactly these three.
export const ENQUIRY_TYPES = [
  { value: 'project', label: 'Project Discussion' },
  { value: 'tool', label: 'Tool Access' },
  { value: 'general', label: 'General Enquiry' },
] as const;

export type EnquiryType = (typeof ENQUIRY_TYPES)[number]['value'];

export function enquiryTypeLabel(value: EnquiryType): string {
  return ENQUIRY_TYPES.find((t) => t.value === value)?.label ?? value;
}

/**
 * `?intent=` values used by links across the site (pp. 15, 20, 151, 165, 166,
 * 169, 174 use `project` and `tool`). The other aliases are older links still
 * on the tools pages, mapped to the closest of the three spec types.
 */
const INTENT_TO_TYPE: Record<string, EnquiryType> = {
  project: 'project',
  tool: 'tool',
  'tool-access': 'tool',
  'tool-support': 'tool',
  general: 'general',
};

export function intentToEnquiryType(intent: string | undefined): EnquiryType | '' {
  if (!intent) return '';
  return INTENT_TO_TYPE[intent.trim().toLowerCase()] ?? '';
}

/** Everything the form shows, as strings, so it can be re-rendered as typed. */
export type ContactValues = {
  name: string;
  email: string;
  organisation: string;
  enquiryType: string;
  tool: string;
  domain: string;
  industry: string;
  projectLocation: string;
  currentStage: string;
  message: string;
  newsletterConsent: boolean;
};

export const EMPTY_CONTACT_VALUES: ContactValues = {
  name: '',
  email: '',
  organisation: '',
  enquiryType: '',
  tool: '',
  domain: '',
  industry: '',
  projectLocation: '',
  currentStage: '',
  message: '',
  newsletterConsent: false,
};

/** A choice offered in a select: the value is the record's slug. */
export type ContactChoice = { slug: string; title: string };

export type ContactChoices = {
  domains: ContactChoice[];
  industries: ContactChoice[];
  tools: ContactChoice[];
};

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(params: SearchParams, key: string): string {
  const v = params[key];
  return (Array.isArray(v) ? v[0] : v)?.trim() ?? '';
}

function knownSlug(slug: string, choices: ContactChoice[]): string {
  return choices.some((c) => c.slug === slug) ? slug : '';
}

/**
 * p. 198 F02: "Query parameters preselect relevant intent/domain/industry/tool
 * but remain editable." Unknown values are ignored rather than trusted, and a
 * tool on its own (`?tool=easysolar`) implies a Tool Access enquiry.
 */
export function prefillFromSearchParams(params: SearchParams, choices: ContactChoices): ContactValues {
  const tool = knownSlug(firstParam(params, 'tool'), choices.tools);
  let enquiryType = intentToEnquiryType(firstParam(params, 'intent'));
  if (!enquiryType && tool) enquiryType = 'tool';

  return {
    ...EMPTY_CONTACT_VALUES,
    enquiryType,
    tool: enquiryType === 'tool' ? tool : '',
    domain: knownSlug(firstParam(params, 'domain'), choices.domains),
    industry: knownSlug(firstParam(params, 'industry'), choices.industries),
  };
}

function text(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === 'string' ? v.trim() : '';
}

export function readContactForm(formData: FormData): ContactValues {
  return {
    name: text(formData, 'name'),
    email: text(formData, 'email'),
    organisation: text(formData, 'organisation'),
    enquiryType: text(formData, 'enquiryType'),
    tool: text(formData, 'tool'),
    domain: text(formData, 'domain'),
    industry: text(formData, 'industry'),
    projectLocation: text(formData, 'projectLocation'),
    currentStage: text(formData, 'currentStage'),
    message: text(formData, 'message'),
    newsletterConsent: formData.get('newsletterConsent') === 'on',
  };
}

// Length caps keep a pasted essay or a spam payload out of the database.
const SHORT = 200;

export const contactSchema = z.object({
  name: z.string().min(1, 'Please enter your name.').max(SHORT, `Please keep this under ${SHORT} characters.`),
  email: z.email('Please enter a valid email address.'),
  organisation: z.string().max(SHORT, `Please keep this under ${SHORT} characters.`),
  enquiryType: z.enum(['project', 'tool', 'general'], { message: 'Please choose an enquiry type.' }),
  tool: z.string().max(SHORT),
  domain: z.string().max(SHORT),
  industry: z.string().max(SHORT),
  projectLocation: z.string().max(SHORT, `Please keep this under ${SHORT} characters.`),
  currentStage: z.string().max(SHORT, `Please keep this under ${SHORT} characters.`),
  message: z.string().min(1, 'Please enter a message.').max(5000, 'Please keep your message under 5,000 characters.'),
  newsletterConsent: z.boolean(),
});

export type ValidContact = z.infer<typeof contactSchema>;

export type ContactFieldErrors = Partial<Record<keyof ContactValues, string[]>>;

/**
 * Select values arrive from the browser, so they are checked against the
 * records actually offered. A tampered value is reported, not silently stored.
 */
export function checkChoices(values: ValidContact, choices: ContactChoices): ContactFieldErrors | null {
  const errors: ContactFieldErrors = {};
  if (values.domain && !knownSlug(values.domain, choices.domains)) errors.domain = ['Please choose a domain from the list.'];
  if (values.industry && !knownSlug(values.industry, choices.industries)) errors.industry = ['Please choose an industry from the list.'];
  if (values.enquiryType === 'tool' && values.tool && !knownSlug(values.tool, choices.tools)) {
    errors.tool = ['Please choose a tool from the list.'];
  }
  return Object.keys(errors).length ? errors : null;
}

/**
 * The form asks for one Name (p. 198), but the Enquiries collection keeps the
 * older required firstName/lastName columns. Splitting at the first space keeps
 * every character (firstName + ' ' + lastName is the name as typed); a
 * single-word name gets an explicit "—" so the required column is never faked
 * with a made-up surname.
 */
export function splitName(name: string): { firstName: string; lastName: string } {
  const trimmed = name.trim().replace(/\s+/g, ' ');
  const space = trimmed.indexOf(' ');
  if (space === -1) return { firstName: trimmed, lastName: '—' };
  return { firstName: trimmed.slice(0, space), lastName: trimmed.slice(space + 1) };
}

/** What the action hands back to the form (React 19 resets fields after an action). */
export type ContactFormState = {
  status: 'idle' | 'success' | 'invalid' | 'error';
  /** Increments on every submission so the form re-mounts with `values`. */
  attempt: number;
  values: ContactValues;
  errors?: ContactFieldErrors;
};
