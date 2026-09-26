import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EMPTY_CONTACT_VALUES, type ContactChoices, type ContactFormState } from '@/lib/forms/contact';

// The real action writes to the CMS; the form only needs its reply.
const submitContactForm = vi.fn<(prev: ContactFormState, fd: FormData) => Promise<ContactFormState>>();
vi.mock('./actions', () => ({ submitContactForm: (prev: ContactFormState, fd: FormData) => submitContactForm(prev, fd) }));

import { ContactForm } from './ContactForm';

const CHOICES: ContactChoices = {
  domains: [{ slug: 'energy-systems-transition', title: 'Energy Systems & Transition' }],
  industries: [{ slug: 'oil-and-gas', title: 'Oil and Gas' }],
  tools: [{ slug: 'easysolar', title: 'easySOLAR' }],
};

beforeEach(() => submitContactForm.mockReset());

describe('ContactForm (p. 198 F02-F04)', () => {
  it('labels every control and marks required/optional explicitly (L1136)', () => {
    render(<ContactForm choices={CHOICES} prefill={EMPTY_CONTACT_VALUES} />);
    expect(screen.getByLabelText('Name (required)')).toHaveAttribute('name', 'name');
    expect(screen.getByLabelText('Email (required)')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Organisation (optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Domain (optional)').tagName).toBe('SELECT');
    expect(screen.getByLabelText('Industry (optional)').tagName).toBe('SELECT');
    expect(screen.getByLabelText('Project Location (optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Current Stage (optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Message (required)').tagName).toBe('TEXTAREA');
    for (const type of ['Project Discussion', 'Tool Access', 'General Enquiry']) {
      expect(screen.getByLabelText(type)).toHaveAttribute('type', 'radio');
    }
  });

  it('uses the F03 heading, button and privacy line, with an unticked optional newsletter box', () => {
    render(<ContactForm choices={CHOICES} prefill={EMPTY_CONTACT_VALUES} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Send Your Enquiry' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send Enquiry' })).toBeInTheDocument();
    expect(screen.getByText(/We will use the information you provide to respond to your enquiry\./)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Read our Privacy Notice.' })).toHaveAttribute('href', '/privacy');
    const consent = screen.getByRole('checkbox');
    expect(consent).not.toBeChecked();
    expect(consent).not.toBeRequired();
  });

  it('preselects Tool Access and the tool from ?intent=tool&tool=easysolar, still editable', () => {
    render(<ContactForm choices={CHOICES} prefill={{ ...EMPTY_CONTACT_VALUES, enquiryType: 'tool', tool: 'easysolar' }} />);
    expect(screen.getByLabelText('Tool Access')).toBeChecked();
    const tool = screen.getByLabelText('Tool (optional)') as HTMLSelectElement;
    expect(tool.value).toBe('easysolar');
    expect(tool).not.toBeDisabled();
  });

  it('keeps the visitor\'s input after a validation error (React 19 resets forms)', async () => {
    const values = { ...EMPTY_CONTACT_VALUES, name: 'Ada Lovelace', email: 'not-an-email', enquiryType: 'project', message: 'A solar project in Qatar' };
    submitContactForm.mockResolvedValue({ status: 'invalid', attempt: 1, values, errors: { email: ['Please enter a valid email address.'] } });

    const { container } = render(<ContactForm choices={CHOICES} prefill={EMPTY_CONTACT_VALUES} />);
    await act(async () => {
      fireEvent.submit(container.querySelector('form')!);
    });

    expect(screen.getByLabelText('Name (required)')).toHaveValue('Ada Lovelace');
    expect(screen.getByLabelText('Message (required)')).toHaveValue('A solar project in Qatar');
    expect(screen.getByLabelText('Project Discussion')).toBeChecked();
    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByLabelText('Email (required)')).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows the F04 error with the info@ fallback, and the F04 success without a response-time promise', async () => {
    submitContactForm.mockResolvedValueOnce({ status: 'error', attempt: 1, values: EMPTY_CONTACT_VALUES });
    const { container } = render(<ContactForm choices={CHOICES} prefill={EMPTY_CONTACT_VALUES} />);
    await act(async () => {
      fireEvent.submit(container.querySelector('form')!);
    });
    expect(screen.getByRole('alert')).toHaveTextContent('We could not send your enquiry. Please try again or email info@enerqa.co.uk.');

    submitContactForm.mockResolvedValueOnce({ status: 'success', attempt: 2, values: EMPTY_CONTACT_VALUES });
    await act(async () => {
      fireEvent.submit(container.querySelector('form')!);
    });
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Thank you. Your enquiry has been received.');
    expect(status.textContent).not.toMatch(/shortly|within|in touch/i);
  });
});
