import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import { ArrowRight, Briefcase, Mail } from 'lucide-react';

export default function CareersPage() {
  return (
    <div className="bg-white min-h-screen pt-[70px]">
      {/* Q01 Purpose and Scope */}
      <section className="bg-[var(--color-dark)] text-white pt-32 pb-24 border-b border-gray-800">
        <Container>
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <div className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-white/60 mb-2">
              <Link href="/" className="hover:text-white transition-colors no-underline">Home</Link> / 
              <Link href="/about" className="hover:text-white transition-colors no-underline mx-1">About</Link> / 
              <span className="text-white ml-1">Careers</span>
            </div>
            <Typography variant="h1" className="text-white m-0">
              Careers at Enerqa
            </Typography>
            <Typography variant="body" className="text-gray-300 text-xl leading-relaxed max-w-3xl mt-2">
              Join a team of data scientists, energy analysts, and software engineers dedicated to bringing transparency and rigorous analytics to the global energy transition.
            </Typography>
          </div>
        </Container>
      </section>

      <Section theme="light" className="py-20">
        <Container>
          <div className="max-w-4xl mx-auto flex flex-col gap-16">
            
            {/* Q02 Main Content */}
            <div className="flex flex-col gap-6">
              <Typography variant="h2" className="text-[var(--color-dark)] m-0">
                Our Culture & Scope
              </Typography>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p>
                  At Enerqa, we believe that navigating the complexities of modern energy markets requires more than just data—it requires deep domain expertise, robust engineering, and an unwavering commitment to intellectual honesty.
                </p>
                <p>
                  We are a remote-first, globally distributed team. We value deep work, asynchronous communication, and rigorous peer review over endless meetings. Whether you are building the next generation of our ESG readiness tools or modeling grid constraints, your work will directly empower decision-makers worldwide.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 md:p-12">
              <Typography variant="h3" className="text-[var(--color-dark)] mb-6 flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-[var(--color-primary)]" />
                Open Positions
              </Typography>
              <p className="text-gray-600 mb-8">
                We do not currently have any open roles. However, we are always interested in connecting with talented data engineers and energy market analysts.
              </p>
              
              {/* Q03 Next Action */}
              <div className="flex flex-col sm:flex-row items-center gap-4 border-t border-gray-200 pt-8 mt-8">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">Speculative Applications</h4>
                  <p className="text-sm text-gray-500">Send us your CV and a brief outline of how you can contribute to Enerqa.</p>
                </div>
                <Link 
                  href="mailto:careers@enerqa.co.uk" 
                  className="bg-[var(--color-secondary)] text-white font-bold py-3 px-8 rounded-full hover:bg-[var(--color-secondary-dark)] transition-colors inline-flex items-center gap-2 whitespace-nowrap"
                >
                  <Mail className="w-4 h-4" /> Email CV
                </Link>
              </div>
            </div>

          </div>
        </Container>
      </Section>
    </div>
  );
}
