import React from 'react';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Typography } from '@/components/ui/Typography';
import { Accordion } from '@/components/ui/Accordion';

export const metadata = {
  title: 'Frequently Asked Questions | enerQA',
  description: 'Find answers to common questions about climate change, data on the portal, and how to use the enerQA Climate Change Knowledge Portal.',
};

export default function FAQPage() {
  const generalQuestions = [
    {
      title: 'What is climate change and how does it affect Qatar?',
      content: (
        <p>
          Climate change refers to long-term shifts in temperatures and weather patterns. In Qatar, this can lead to higher average temperatures, sea-level rise affecting coastal areas, and increased challenges regarding water and food security. The portal provides data and insights to help mitigate and adapt to these effects.
        </p>
      ),
    },
    {
      title: 'How can I contact the support team?',
      content: (
        <p>
          If you didn't find the answer you were looking for, you can reach out to our helpdesk and support team via the <a href="/contact" className="text-[#a0133c] hover:underline font-medium">Contact Us</a> page.
        </p>
      ),
    },
  ];

  const portalQuestions = [
    {
      title: 'How do I use the data explorer?',
      content: (
        <p>
          You can use the Data Explorer by navigating to the Climate Data section. From there, you can filter datasets by indicator, year, and region, and visualize them using interactive charts and maps. You can also download the data in open standards like CSV or GeoJSON.
        </p>
      ),
    },
    {
      title: 'How can I contribute to the portal?',
      content: (
        <p>
          We highly encourage community contributions! Experts, researchers, and organizations can submit research articles, case studies, or data sets through our 'Call for Contributions' page under the Community section. All submissions undergo an editorial review process before being published to ensure high quality and accuracy.
        </p>
      ),
    },
  ];

  const dataQuestions = [
    {
      title: 'Where does the portal’s data come from?',
      content: (
        <p>
          Our data is integrated from authoritative global and national sources, including the UNFCCC, World Bank Climate Change Knowledge Portal (CCKP), WRI Climate Watch, and Qatar's national ministries. We ensure transparency by linking to the original datasets and utilizing official APIs for up-to-date information.
        </p>
      ),
    },
    {
      title: 'How often is the data updated?',
      content: (
        <p>
          The update frequency depends heavily on the specific data source. Some indicators, such as real-time air quality, update frequently via external APIs, while national greenhouse gas inventories are typically updated annually as official reports are published. We clearly mark the "last updated" date for each dataset to maintain transparency.
        </p>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50/50 pb-20">
      {/* Hero Section */}
      <section className="bg-[#1b030a] text-white pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5 opacity-10"></div>
        <Container className="relative z-10 text-center">
          <Typography variant="h1" className="mb-6">
            Frequently Asked Questions
          </Typography>
          <Typography variant="lede" className="text-white/80 max-w-2xl mx-auto">
            Find quick answers to common inquiries about climate change, data sources, and how to effectively navigate the portal.
          </Typography>
        </Container>
      </section>

      {/* FAQs Content */}
      <Section className="-mt-8">
        <Container className="max-w-3xl space-y-12">
          
          <div id="general" className="scroll-mt-32">
            <Typography variant="h3" className="mb-6 text-[#1b030a] flex items-center gap-4 text-2xl">
              <span className="w-10 h-10 rounded-full bg-[#a0133c]/10 text-[#a0133c] flex items-center justify-center text-sm font-bold">1</span>
              General Climate Questions
            </Typography>
            <Accordion items={generalQuestions} />
          </div>

          <div id="portal-usage" className="scroll-mt-32">
            <Typography variant="h3" className="mb-6 text-[#1b030a] flex items-center gap-4 text-2xl">
              <span className="w-10 h-10 rounded-full bg-[#a0133c]/10 text-[#a0133c] flex items-center justify-center text-sm font-bold">2</span>
              Portal Usage Questions
            </Typography>
            <Accordion items={portalQuestions} />
          </div>

          <div id="data" className="scroll-mt-32">
            <Typography variant="h3" className="mb-6 text-[#1b030a] flex items-center gap-4 text-2xl">
              <span className="w-10 h-10 rounded-full bg-[#a0133c]/10 text-[#a0133c] flex items-center justify-center text-sm font-bold">3</span>
              Data Questions
            </Typography>
            <Accordion items={dataQuestions} />
          </div>

          {/* Helpdesk Contact Banner */}
          <div className="mt-20 bg-white rounded-2xl p-10 border border-gray-100 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#a0133c] to-[#1b030a]"></div>
            <Typography variant="h4" className="mb-4 text-[#1b030a]">
              Didn’t find your question?
            </Typography>
            <Typography className="text-gray-600 mb-8 max-w-md mx-auto">
              Our support team is here to help you navigate the portal and find the data you need.
            </Typography>
            <a 
              href="/contact" 
              className="inline-block bg-[#a0133c] text-white font-medium px-8 py-3 rounded-full hover:bg-[#800f30] transition-colors"
            >
              Contact Us
            </a>
          </div>

        </Container>
      </Section>
    </main>
  );
}
