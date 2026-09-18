import React from 'react';
import { Container } from '@/components/ui/Container';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white pt-[70px]">
      
      <section className="py-20 bg-[var(--color-paper-alt)] border-b border-gray-200">
        <Container>
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--color-dark)]">Privacy Policy</h1>
            <p className="text-xl text-gray-600">Last updated: September 2026</p>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="max-w-3xl prose prose-lg text-gray-600 max-w-none">
            <p>
              This Privacy Policy explains how Enerqa collects, uses, and protects your personal data when you use our website, digital tools and services.
            </p>
            
            <h2 className="text-2xl font-bold text-[var(--color-dark)] mt-10 mb-4">1. Data Collection</h2>
            <p>
              We collect information you provide directly to us when you submit an enquiry, subscribe to publications, or use our digital calculators (such as easySOLAR or the ESG Readiness Diagnostic). This may include your name, email address, organisation, and project-specific data submitted for calculation purposes.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-dark)] mt-10 mb-4">2. Use of Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Respond to your project development and technical enquiries.</li>
              <li>Provide access to and results from our digital tools.</li>
              <li>Send requested publications and updates on global intelligence.</li>
              <li>Improve the functionality of the Knowledge Hub and Data Portal.</li>
            </ul>

            <h2 className="text-2xl font-bold text-[var(--color-dark)] mt-10 mb-4">3. Tool Data and Confidentiality</h2>
            <p>
              Data inputted into our calculators and diagnostic tools is processed solely to provide you with the requested outputs. We do not use your project data for public datasets or share it with third parties unless explicitly authorised by you during a formal consulting engagement.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-dark)] mt-10 mb-4">4. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or how we handle your data, please contact us at <a href="mailto:privacy@enerqa.co.uk" className="text-[var(--color-primary)] hover:underline">privacy@enerqa.co.uk</a>.
            </p>
          </div>
        </Container>
      </section>

    </div>
  );
}
