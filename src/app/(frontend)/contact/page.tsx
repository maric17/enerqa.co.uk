'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, MapPin, Phone, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

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
                <Link href="/project-development" className="text-[var(--color-secondary)] font-bold text-sm hover:underline inline-flex items-center gap-1">
                  Learn about our approach <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-8">
              <div className="bg-white p-8 md:p-12 rounded-2xl border border-gray-200 shadow-sm">
                <h2 className="text-2xl font-bold text-[var(--color-dark)] mb-8">Send an Enquiry</h2>
                
                {submitted ? (
                  <div className="bg-green-50 text-green-800 p-8 rounded-xl border border-green-200 text-center">
                    <h3 className="text-2xl font-bold mb-4">Thank You</h3>
                    <p className="mb-6">Your message has been successfully sent. A member of the Enerqa team will be in touch shortly.</p>
                    <button onClick={() => setSubmitted(false)} className="text-green-800 font-bold hover:underline">Send another message</button>
                  </div>
                ) : (
                  <form 
                    className="space-y-6"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setSubmitted(true);
                    }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">First Name *</label>
                        <input type="text" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[var(--color-primary)] outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Last Name *</label>
                        <input type="text" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[var(--color-primary)] outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Email Address *</label>
                        <input type="email" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[var(--color-primary)] outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Organisation / Company</label>
                        <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[var(--color-primary)] outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Nature of Enquiry *</label>
                      <select required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[var(--color-primary)] outline-none bg-white">
                        <option value="">Please select...</option>
                        <option value="project">Project Development Support</option>
                        <option value="tools">Digital Tools (ESG Readiness, easySOLAR, etc.)</option>
                        <option value="data">Data Portal &amp; Knowledge Hub</option>
                        <option value="media">Media or Research Enquiry</option>
                        <option value="general">General Enquiry</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Message *</label>
                      <textarea required rows={6} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[var(--color-primary)] outline-none resize-none"></textarea>
                    </div>

                    <div className="pt-4">
                      <button type="submit" className="bg-[var(--color-secondary)] text-white font-bold py-4 px-10 rounded-full hover:bg-[var(--color-secondary-dark)] transition-colors inline-flex items-center gap-2">
                        Submit Enquiry <ArrowRight className="w-4 h-4" />
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
