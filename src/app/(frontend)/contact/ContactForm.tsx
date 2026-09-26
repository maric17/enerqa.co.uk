'use client';

import React, { useActionState, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { submitContactForm } from './actions';
import {
  ENQUIRY_TYPES,
  type ContactChoices,
  type ContactFieldErrors,
  type ContactFormState,
  type ContactValues,
} from '@/lib/forms/contact';

const inputBase =
  'w-full px-4 py-3 border rounded-lg bg-white text-[var(--color-dark)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]';

function inputClass(invalid: boolean) {
  return `${inputBase} ${invalid ? 'border-red-600' : 'border-gray-300'}`;
}

/** p. 198: "Show required/optional labels explicitly." */
function Label({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-bold text-gray-700 mb-2">
      {children} <span className="font-normal text-gray-500">({required ? 'required' : 'optional'})</span>
    </label>
  );
}

function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p id={id} className="text-red-700 text-sm mt-1">
      {errors[0]}
    </p>
  );
}

/** aria props for a field that may carry an error message. */
function describe(name: keyof ContactValues, errors?: ContactFieldErrors) {
  const has = Boolean(errors?.[name]?.length);
  return { 'aria-invalid': has || undefined, 'aria-describedby': has ? `contact-${name}-error` : undefined };
}

export function ContactForm({ choices, prefill }: { choices: ContactChoices; prefill: ContactValues }) {
  const [state, formAction, isPending] = useActionState(submitContactForm, {
    status: 'idle',
    attempt: 0,
    values: prefill,
  } satisfies ContactFormState);

  // F04 success: p. 198 wording, which is also exactly what happens (the
  // enquiry is saved for staff; no email is sent and no response time is
  // promised, p. 228).
  if (state.status === 'success') return <ContactSuccess />;

  // Keyed on the attempt: each reply re-mounts the fields with the values the
  // action returned. React 19 resets a form after its action, and a select's
  // defaultValue is not re-applied on update, so re-mounting is what reliably
  // preserves the visitor's input after an error (p. 198).
  return (
    <ContactFields
      key={state.attempt}
      state={state}
      choices={choices}
      formAction={formAction}
      isPending={isPending}
    />
  );
}

function ContactSuccess() {
  const ref = useRef<HTMLDivElement>(null);
  // The submit button that had focus is gone; move focus to the confirmation
  // so keyboard and screen-reader users land on it.
  useEffect(() => ref.current?.focus(), []);
  return (
    <div ref={ref} tabIndex={-1} role="status"
      className="bg-green-50 text-green-900 p-8 rounded-xl border border-green-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dark)]">
      <p className="text-lg font-bold m-0">Thank you. Your enquiry has been received.</p>
      {/* A plain link (full reload) so the form starts empty. */}
      <a href="/contact" className="inline-block mt-4 font-bold underline">
        Send another enquiry
      </a>
    </div>
  );
}

function ContactFields({
  state,
  choices,
  formAction,
  isPending,
}: {
  state: ContactFormState;
  choices: ContactChoices;
  formAction: (formData: FormData) => void;
  isPending: boolean;
}) {
  const { values, errors } = state;
  const [enquiryType, setEnquiryType] = useState(values.enquiryType);
  const formRef = useRef<HTMLFormElement>(null);

  // After a validation error, move focus to the first field that needs fixing
  // (for the Enquiry Type group, its first radio).
  useEffect(() => {
    if (state.status !== 'invalid') return;
    const el = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    (el?.matches('input, select, textarea') ? el : el?.querySelector<HTMLElement>('input'))?.focus();
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      {state.status === 'error' && (
        // F04 error, p. 198 wording.
        <div role="alert" className="bg-red-50 text-red-900 p-4 rounded-lg border border-red-200 font-medium">
          We could not send your enquiry. Please try again or email{' '}
          <a href="mailto:info@enerqa.co.uk" className="underline">info@enerqa.co.uk</a>.
        </div>
      )}
      {state.status === 'invalid' && (
        <div role="alert" className="bg-red-50 text-red-900 p-4 rounded-lg border border-red-200 font-medium">
          Please correct the fields marked below.
        </div>
      )}

      {/* Honeypot (p. 228 spam protection): clipped rather than moved
          off-screen, so it cannot cause sideways scrolling in RTL. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input type="text" id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="contact-name" required>Name</Label>
          <input id="contact-name" type="text" name="name" required autoComplete="name" maxLength={200}
            defaultValue={values.name} className={inputClass(Boolean(errors?.name))} {...describe('name', errors)} />
          <FieldError id="contact-name-error" errors={errors?.name} />
        </div>
        <div>
          <Label htmlFor="contact-email" required>Email</Label>
          <input id="contact-email" type="email" name="email" required autoComplete="email" maxLength={200}
            defaultValue={values.email} className={inputClass(Boolean(errors?.email))} {...describe('email', errors)} />
          <FieldError id="contact-email-error" errors={errors?.email} />
        </div>
      </div>

      <div>
        <Label htmlFor="contact-organisation">Organisation</Label>
        <input id="contact-organisation" type="text" name="organisation" autoComplete="organization" maxLength={200}
          defaultValue={values.organisation} className={inputClass(Boolean(errors?.organisation))} {...describe('organisation', errors)} />
        <FieldError id="contact-organisation-error" errors={errors?.organisation} />
      </div>

      <fieldset role="radiogroup" aria-required="true" {...describe('enquiryType', errors)}>
        <legend className="block text-sm font-bold text-gray-700 mb-2">
          Enquiry Type <span className="font-normal text-gray-500">(required)</span>
        </legend>
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
          {ENQUIRY_TYPES.map((t) => (
            <label key={t.value} htmlFor={`contact-type-${t.value}`}
              className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg cursor-pointer has-[:checked]:border-[var(--color-secondary)] has-[:checked]:bg-blue-50">
              <input id={`contact-type-${t.value}`} type="radio" name="enquiryType" value={t.value} required
                defaultChecked={values.enquiryType === t.value}
                onChange={(e) => setEnquiryType(e.target.value)}
                className="h-4 w-4 accent-[var(--color-secondary)]" />
              <span className="text-gray-800">{t.label}</span>
            </label>
          ))}
        </div>
        <FieldError id="contact-enquiryType-error" errors={errors?.enquiryType} />
      </fieldset>

      {/* Shown for Tool Access; `?tool=` preselects it but it stays editable. */}
      {enquiryType === 'tool' && choices.tools.length > 0 && (
        <div>
          <Label htmlFor="contact-tool">Tool</Label>
          <select id="contact-tool" name="tool" defaultValue={values.tool}
            className={inputClass(Boolean(errors?.tool))} {...describe('tool', errors)}>
            <option value="">Not specified</option>
            {choices.tools.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
          </select>
          <FieldError id="contact-tool-error" errors={errors?.tool} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="contact-domain">Domain</Label>
          <select id="contact-domain" name="domain" defaultValue={values.domain}
            className={inputClass(Boolean(errors?.domain))} {...describe('domain', errors)}>
            <option value="">Not specified</option>
            {choices.domains.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
          </select>
          <FieldError id="contact-domain-error" errors={errors?.domain} />
        </div>
        <div>
          <Label htmlFor="contact-industry">Industry</Label>
          <select id="contact-industry" name="industry" defaultValue={values.industry}
            className={inputClass(Boolean(errors?.industry))} {...describe('industry', errors)}>
            <option value="">Not specified</option>
            {choices.industries.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
          </select>
          <FieldError id="contact-industry-error" errors={errors?.industry} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="contact-projectLocation">Project Location</Label>
          <input id="contact-projectLocation" type="text" name="projectLocation" maxLength={200} dir="auto"
            defaultValue={values.projectLocation} className={inputClass(Boolean(errors?.projectLocation))} {...describe('projectLocation', errors)} />
          <FieldError id="contact-projectLocation-error" errors={errors?.projectLocation} />
        </div>
        <div>
          <Label htmlFor="contact-currentStage">Current Stage</Label>
          <input id="contact-currentStage" type="text" name="currentStage" maxLength={200} dir="auto"
            defaultValue={values.currentStage} className={inputClass(Boolean(errors?.currentStage))} {...describe('currentStage', errors)} />
          <FieldError id="contact-currentStage-error" errors={errors?.currentStage} />
        </div>
      </div>

      <div>
        <Label htmlFor="contact-message" required>Message</Label>
        <textarea id="contact-message" name="message" required rows={6} maxLength={5000} dir="auto"
          defaultValue={values.message} className={`${inputClass(Boolean(errors?.message))} resize-y`} {...describe('message', errors)} />
        <FieldError id="contact-message-error" errors={errors?.message} />
      </div>

      {/* F03 Send Your Enquiry (p. 198) */}
      <div className="pt-6 border-t border-gray-200 space-y-5">
        <h2 className="text-2xl font-bold text-[var(--color-dark)] m-0">Send Your Enquiry</h2>

        {/* p. 198: newsletter consent is a separate, unticked, optional box -
            never a condition of the enquiry. Wording from K06 (p. 156). */}
        <div className="flex items-start gap-3">
          <input id="contact-newsletterConsent" type="checkbox" name="newsletterConsent"
            defaultChecked={values.newsletterConsent}
            className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-primary)]" />
          <label htmlFor="contact-newsletterConsent" className="text-sm text-gray-700">
            Receive new Enerqa publications and selected updates{' '}
            <span className="text-gray-500">(optional)</span>
          </label>
        </div>

        <p className="text-sm text-gray-600 m-0">
          We will use the information you provide to respond to your enquiry.{' '}
          <Link href="/privacy" className="underline hover:text-[var(--color-dark)]">Read our Privacy Notice.</Link>
        </p>

        <div className="flex flex-wrap items-center gap-4">
          {/* Disabled while sending, so a double click cannot submit twice (p. 198). */}
          <button type="submit" disabled={isPending}
            className="bg-[var(--color-secondary)] text-white font-bold py-4 px-10 rounded-full hover:bg-[var(--color-secondary-dark)] transition-colors inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-dark)]">
            Send Enquiry <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
          <p role="status" className="text-sm text-gray-600 m-0">
            {isPending ? 'Sending your enquiry.' : ''}
          </p>
        </div>
      </div>
    </form>
  );
}
