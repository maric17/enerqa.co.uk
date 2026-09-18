import React from 'react';
import { Container } from '@/components/ui/Container';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white pt-[70px]">
      
      <section className="py-20 bg-[var(--color-paper-alt)] border-b border-gray-200">
        <Container>
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--color-dark)]">Terms of Use</h1>
            <p className="text-xl text-gray-600">Last updated: September 2026</p>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="max-w-3xl prose prose-lg text-gray-600 max-w-none">
            <p>
              By accessing and using the Enerqa website, Knowledge Hub, Data Portal, and Digital Tools, you agree to comply with and be bound by the following Terms of Use.
            </p>
            
            <h2 className="text-2xl font-bold text-[var(--color-dark)] mt-10 mb-4">1. Use of Content</h2>
            <p>
              The content provided on this website, including original Enerqa Publications, analysis, and methodologies, is for informational purposes. While we strive for accuracy, the information should not be construed as formal financial, legal, or engineering advice without a dedicated consulting agreement.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-dark)] mt-10 mb-4">2. Digital Tools and Calculators</h2>
            <p>
              Tools such as easySOLAR and the ESG Readiness Diagnostic provide preliminary assessments based on the parameters you input. Outputs are indicative estimates meant to support early-stage decision-making and do not constitute a detailed feasibility study or guaranteed financial return.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-dark)] mt-10 mb-4">3. External Data and Global Intelligence</h2>
            <p>
              The Data Portal and Global Intelligence sections aggregate external, open-access information and third-party news. Enerqa is not responsible for the accuracy of external datasets or the content of third-party websites linked through our platform. All external data remains subject to its original provider's license (e.g., CC BY 4.0, Public Domain).
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-dark)] mt-10 mb-4">4. Intellectual Property</h2>
            <p>
              Original content, logos, tool interfaces, and proprietary models (such as GreenScale Pro methodologies) are the intellectual property of Enerqa. They may not be reproduced or commercially exploited without our express written permission.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-dark)] mt-10 mb-4">5. Contact</h2>
            <p>
              For legal enquiries regarding these terms, please contact <a href="mailto:legal@enerqa.co.uk" className="text-[var(--color-primary)] hover:underline">legal@enerqa.co.uk</a>.
            </p>
          </div>
        </Container>
      </section>

    </div>
  );
}
