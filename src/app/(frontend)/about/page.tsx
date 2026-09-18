import React from 'react';
import Link from 'next/link';
import { ArrowRight, Globe, BarChart2, Mail } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-paper)] pt-[70px]">
      
      {/* A01 About Enerqa */}
      <section className="py-20 bg-[var(--color-dark)] text-white border-b border-gray-800">
        <Container>
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-white">About Enerqa</h1>
            <p className="text-xl text-gray-300 leading-relaxed mb-6">
              Enerqa is a multidisciplinary project-development and consultancy company working across climate action and carbon management, energy systems and transition, environment, nature and circularity, and sustainable business, ESG and finance. Our role is to connect technical understanding with the commercial, environmental and institutional decisions needed to develop practical initiatives.
            </p>
          </div>
        </Container>
      </section>

      {/* A02 Our Approach */}
      <section id="approach" className="py-20 scroll-mt-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[var(--color-dark)] mb-6">Our Approach</h2>
              <div className="prose prose-lg text-gray-600 max-w-none">
                <p className="mb-6 leading-relaxed">
                  An idea becomes a viable initiative through evidence, careful assessment and a clear delivery structure. Technical studies, business and financial modelling, environmental and social considerations, and implementation requirements need to inform one another.
                </p>
                <p className="mb-8 leading-relaxed">
                  Engagement can begin with a new opportunity, an existing concept or a specific question within the project cycle. The scope is shaped around the decisions ahead and the work already completed.
                </p>
                <Link href="/project-development" className="inline-flex items-center gap-2 bg-[var(--color-secondary)] text-white font-bold py-3 px-6 rounded-full hover:bg-[var(--color-secondary-dark)] transition-colors">
                  Project Development and Lifecycle Support <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="bg-[var(--color-paper-alt)] p-10 rounded-2xl border border-gray-200">
              <div className="space-y-6">
                <div className="border-l-4 border-[var(--color-primary)] pl-6">
                  <h3 className="font-bold text-xl text-[var(--color-dark)] mb-2">Evidence &amp; Assessment</h3>
                  <p className="text-gray-600">Gathering the right data to make informed choices from the start.</p>
                </div>
                <div className="border-l-4 border-[var(--color-primary)] pl-6">
                  <h3 className="font-bold text-xl text-[var(--color-dark)] mb-2">Structure &amp; Delivery</h3>
                  <p className="text-gray-600">Connecting technical reality with financial and operational models.</p>
                </div>
                <div className="border-l-4 border-[var(--color-primary)] pl-6">
                  <h3 className="font-bold text-xl text-[var(--color-dark)] mb-2">Integration</h3>
                  <p className="text-gray-600">Ensuring environmental and social considerations strengthen the business case.</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* A03 Our Domains */}
      <section className="py-20 bg-[var(--color-paper-alt)] border-y border-gray-200">
        <Container>
          <div className="max-w-3xl mb-12">
            <h2 className="text-3xl font-bold text-[var(--color-dark)] mb-4">Our Domains</h2>
            <p className="text-lg text-gray-600">Explore the four interconnected domains that organise Enerqa's work.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/domains/climate-action-carbon-management" className="group bg-white p-8 rounded-xl border border-gray-200 hover:border-[var(--color-primary)] hover:shadow-md transition-all">
              <Globe className="w-10 h-10 text-[var(--color-primary)] mb-6" />
              <h3 className="text-xl font-bold text-[var(--color-dark)] group-hover:text-[var(--color-secondary)] transition-colors mb-3">Climate Action &amp; Carbon Management</h3>
              <div className="flex items-center text-[var(--color-secondary)] text-sm font-medium mt-4">
                Explore Domain <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
            <Link href="/domains/energy-systems-transition" className="group bg-white p-8 rounded-xl border border-gray-200 hover:border-[var(--color-primary)] hover:shadow-md transition-all">
              <div className="w-10 h-10 text-[var(--color-primary)] mb-6 flex items-center">⚡</div>
              <h3 className="text-xl font-bold text-[var(--color-dark)] group-hover:text-[var(--color-secondary)] transition-colors mb-3">Energy Systems &amp; Transition</h3>
              <div className="flex items-center text-[var(--color-secondary)] text-sm font-medium mt-4">
                Explore Domain <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
            <Link href="/domains/environment-nature-circularity" className="group bg-white p-8 rounded-xl border border-gray-200 hover:border-[var(--color-primary)] hover:shadow-md transition-all">
              <div className="w-10 h-10 text-[var(--color-primary)] mb-6 flex items-center">🌱</div>
              <h3 className="text-xl font-bold text-[var(--color-dark)] group-hover:text-[var(--color-secondary)] transition-colors mb-3">Environment, Nature &amp; Circularity</h3>
              <div className="flex items-center text-[var(--color-secondary)] text-sm font-medium mt-4">
                Explore Domain <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
            <Link href="/domains/sustainable-business-esg-finance" className="group bg-white p-8 rounded-xl border border-gray-200 hover:border-[var(--color-primary)] hover:shadow-md transition-all">
              <BarChart2 className="w-10 h-10 text-[var(--color-primary)] mb-6" />
              <h3 className="text-xl font-bold text-[var(--color-dark)] group-hover:text-[var(--color-secondary)] transition-colors mb-3">Sustainable Business, ESG &amp; Finance</h3>
              <div className="flex items-center text-[var(--color-secondary)] text-sm font-medium mt-4">
                Explore Domain <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          </div>
        </Container>
      </section>

      {/* A04 People and Organisation */}
      <section className="py-20">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-[var(--color-dark)] mb-6">People and Organisation</h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Our multidisciplinary approach brings relevant technical, environmental, climate, energy and business perspectives into the development process.
            </p>
            {/* Note: Team member cards omitted until approved profiles are provided per the specification. */}
          </div>
        </Container>
      </section>

      {/* A05 Connect with Enerqa */}
      <section className="py-20 bg-[var(--color-dark)] text-white">
        <Container>
          <div className="bg-[var(--color-dark-soft)] rounded-2xl p-10 md:p-16 text-center border border-gray-700">
            <h2 className="text-3xl font-bold mb-4">Connect with Enerqa</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
              Contact us to discuss an idea, a technical question or a project-development need.
            </p>
            <div className="flex flex-col items-center gap-6">
              <a href="mailto:info@enerqa.co.uk" className="flex items-center gap-2 text-[var(--color-primary)] hover:text-white transition-colors text-lg font-medium">
                <Mail className="w-5 h-5" /> info@enerqa.co.uk
              </a>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                <Link href="/contact" className="bg-[var(--color-primary)] text-[var(--color-dark)] font-bold py-3 px-8 rounded-full hover:bg-[var(--color-primary-dark)] transition-colors">
                  Contact Enerqa
                </Link>
                <Link href="/contact?intent=project" className="bg-transparent border border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white hover:text-[var(--color-dark)] transition-colors">
                  Discuss Your Project
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

    </div>
  );
}
