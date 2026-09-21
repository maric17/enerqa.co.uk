'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { Mail, MapPin, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { submitContactForm, FormState } from './actions';

const initialState: FormState = {
  success: false,
};

export default function ContactPage() {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-paper)] pt-[70px]">
      
      <section className="py-20 bg-[var(--color-dark)] text-white border-b border-gray-800">
        <Container>
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-white">Contact Enerqa</h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Whether you are discussing a new project, exploring our digital tools or seeking technical advice, we welcome the opportunity to connect.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Contact Info */}
            <div className="lg:col-span-4 space-y-10">
              <div>
                <h2 className="text-2xl font-bold text-[var(--color-dark)] mb-6">Get in Touch</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Mail className="w-6 h-6 text-[var(--color-primary)] mt-1" />
                    <div>
                      <div className="font-bold text-[var(--color-dark)] mb-1">Email</div>
                      <a href="mailto:info@enerqa.co.uk" className="text-gray-600 hover:text-[var(--color-secondary)] transition-colors">info@enerqa.co.uk</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-[var(--color-primary)] mt-1" />
                    <div>
                      <div className="font-bold text-[var(--color-dark)] mb-1">Office</div>
                      <p className="text-gray-600 leading-relaxed">
                        London, United Kingdom<br />
                        (Full address provided upon engagement)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--color-paper-alt)] p-8 rounded-xl border border-gray-200">
                <h3 className="text-xl font-bold text-[var(--color-dark)] mb-4">Project Development</h3>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  To help us direct your enquiry to the right team, please provide a brief overview of the project's sector, location and current stage of development.
                </p>
                <Link href="/projects" className="text-[var(--color-secondary)] font-bold text-sm hover:underline inline-flex items-center gap-1">
                  Learn about our approach <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-8">
              <div className="bg-white p-8 md:p-12 rounded-2xl border border-gray-200 shadow-sm">
                <h2 className="text-2xl font-bold text-[var(--color-dark)] mb-8">Send an Enquiry</h2>
                
                {state.success ? (
                  <div className="bg-green-50 text-green-800 p-8 rounded-xl border border-green-200 text-center">
                    <h3 className="text-2xl font-bold mb-4">Thank You</h3>
                    <p className="mb-6">{state.message}</p>
                    <button onClick={() => window.location.reload()} className="text-green-800 font-bold hover:underline">Send another message</button>
                  </div>
                ) : (
                  <form className="space-y-6" action={formAction}>
                    {/* F04 Delivery Error State */}
                    {state.message && !state.success && !state.errors && (
                      <div className="bg-red-50 text-red-800 p-4 rounded-lg border border-red-200 font-medium">
                        {state.message}
                      </div>
                    )}
                    
                    {/* Honeypot for spam protection */}
                    <div className="hidden" aria-hidden="true">
                      <label>Leave this field empty</label>
                      <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">First Name *</label>
                        <input type="text" name="firstName" required className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-[var(--color-primary)] outline-none ${state.errors?.firstName ? 'border-red-500' : 'border-gray-300'}`} />
                        {state.errors?.firstName && <p className="text-red-500 text-xs mt-1">{state.errors.firstName[0]}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Last Name *</label>
                        <input type="text" name="lastName" required className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-[var(--color-primary)] outline-none ${state.errors?.lastName ? 'border-red-500' : 'border-gray-300'}`} />
                        {state.errors?.lastName && <p className="text-red-500 text-xs mt-1">{state.errors.lastName[0]}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Email Address *</label>
                        <input type="email" name="email" required className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-[var(--color-primary)] outline-none ${state.errors?.email ? 'border-red-500' : 'border-gray-300'}`} />
                        {state.errors?.email && <p className="text-red-500 text-xs mt-1">{state.errors.email[0]}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Organisation / Company</label>
                        <input type="text" name="company" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[var(--color-primary)] outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Nature of Enquiry *</label>
                      <select name="natureOfEnquiry" required className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-[var(--color-primary)] outline-none bg-white ${state.errors?.natureOfEnquiry ? 'border-red-500' : 'border-gray-300'}`}>
                        <option value="">Please select...</option>
                        <option value="project">Project Development Support</option>
                        <option value="tools">Digital Tools (ESG Readiness, easySOLAR, etc.)</option>
                        <option value="data">Data Portal &amp; Knowledge Hub</option>
                        <option value="media">Media or Research Enquiry</option>
                        <option value="general">General Enquiry</option>
                      </select>
                      {state.errors?.natureOfEnquiry && <p className="text-red-500 text-xs mt-1">{state.errors.natureOfEnquiry[0]}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Message *</label>
                      <textarea name="message" required rows={6} className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-[var(--color-primary)] outline-none resize-none ${state.errors?.message ? 'border-red-500' : 'border-gray-300'}`}></textarea>
                      {state.errors?.message && <p className="text-red-500 text-xs mt-1">{state.errors.message[0]}</p>}
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 mt-4">
                      <div className="flex items-center h-5 mt-0.5">
                        <input type="checkbox" name="marketingConsent" id="marketingConsent" className="w-4 h-4 text-[var(--color-primary)] bg-white border-gray-300 rounded focus:ring-[var(--color-primary)]" />
                      </div>
                      <div className="text-sm">
                        <label htmlFor="marketingConsent" className="font-medium text-gray-700">Keep me updated</label>
                        <p className="text-gray-500 mt-1">I would like to receive occasional updates about Enerqa's tools, datasets, and insights. You can unsubscribe at any time.</p>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                      <button 
                        type="submit" 
                        disabled={isPending}
                        className="bg-[var(--color-secondary)] text-white font-bold py-4 px-10 rounded-full hover:bg-[var(--color-secondary-dark)] transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isPending ? 'Submitting...' : 'Submit Enquiry'} {isPending ? null : <ArrowRight className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                      By submitting this form, you agree to our <Link href="/privacy" className="underline hover:text-[var(--color-dark)]">Privacy Policy</Link>.
                    </p>
                  </form>
                )}
              </div>
            </div>

          </div>
        </Container>
      </section>

    </div>
  );
}
