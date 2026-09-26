import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Metadata } from 'next';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { Container } from '@/components/ui/Container';
import { publishedToolsWhere } from '@/collections/Tools';
import type { Tool } from '@/payload-types';
import { getToolAccess, splitCatalogue } from './access';

// p. 165 (T01): the page heading and introduction double as title and description.
// `absolute` skips the " | Enerqa" template, which would repeat the brand.
export const metadata: Metadata = {
  title: { absolute: 'Enerqa Tools' },
  description:
    'Explore tools designed to structure assessment, modelling and sustainability decisions. Each tool explains its purpose, inputs, outputs, assumptions and available access route.',
  alternates: { canonical: '/tools' },
};

const primaryButton =
  'inline-flex items-center gap-2 bg-[var(--color-secondary)] text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-[var(--color-secondary-dark)] transition-colors';
const secondaryButton =
  'inline-flex items-center gap-2 border-2 border-[var(--color-dark)] text-[var(--color-dark)] text-sm font-bold px-5 py-2 rounded-full hover:bg-[var(--color-dark)] hover:text-white transition-colors';

// One catalogue card: purpose first, then the truthful availability label and
// the buttons bottom-left (p. 8). "Explore Tool" plus the access action is the
// p. 165 T02 pair; the action label comes from the real access state (p. 191).
function ToolCard({ tool, headingLevel }: { tool: Tool; headingLevel: 'h2' | 'h3' }) {
  const Heading = headingLevel;
  const action = getToolAccess(tool);
  const external = action.kind !== 'request' && /^https?:\/\//.test(action.href);

  return (
    <article className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col">
      <Heading className="text-2xl font-bold text-[var(--color-dark)] mb-4">{tool.title}</Heading>
      <p className="text-gray-600 leading-relaxed mb-6 flex-grow">{tool.desc}</p>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">
        Availability: {action.availability}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/tools/${tool.slug}`} className={secondaryButton} aria-label={`Explore Tool: ${tool.title}`}>
          Explore Tool <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
        <Link
          href={action.href}
          className={primaryButton}
          aria-label={`${action.label}: ${tool.title}`}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {action.label} <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export default async function ToolsPage() {
  const payload = await getPayload({ config: configPromise });
  // p. 166: the catalogue uses CMS records, and pp. 3/166 allow only validated
  // tools. depth 1 populates `file`, which decides whether "Download Tool" is honest.
  const { docs } = await payload.find({
    collection: 'tools',
    where: publishedToolsWhere,
    limit: 100,
    depth: 1,
    sort: 'title',
  });

  const { flagships, otherTools } = splitCatalogue(docs);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-paper)] pt-[70px]">

      {/* T01 Breadcrumb, H1 and introduction (p. 165) */}
      <section className="py-20 bg-[var(--color-dark)] text-white border-b border-gray-800">
        <Container>
          <nav aria-label="Breadcrumb" className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-white/60 mb-6">
            <Link href="/" className="text-white/60 hover:text-white transition-colors no-underline">Home</Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page" className="text-white">Tools</span>
          </nav>
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-white">Enerqa Tools</h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Explore tools designed to structure assessment, modelling and sustainability decisions. Each tool explains its purpose, inputs, outputs, assumptions and available access route.
            </p>
          </div>
        </Container>
      </section>

      {/* T02 Flagship tools, read from the CMS (p. 165). Each card's copy is the
          record's `desc`, which holds the p. 165 T02 text. */}
      {flagships.length > 0 && (
        <section className="py-24 bg-white border-b border-gray-200" aria-label="Flagship tools">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {flagships.map((tool) => (
                <ToolCard key={tool.id} tool={tool} headingLevel="h2" />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* T03 Other Enerqa Tools (pp. 165-166): validated, non-flagship tools only.
          Until one is validated the spec copy alone explains that they follow. */}
      <section className="py-24 bg-[var(--color-paper-alt)] border-b border-gray-200">
        <Container>
          <div className="max-w-4xl mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-dark)] mb-6">Other Enerqa Tools</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Additional tools can address greenhouse gas calculations, MRV, environmental and social risk, and green-project screening. Each will be listed with a clear scope and access state when its current release is available.
            </p>
          </div>
          {otherTools.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {otherTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} headingLevel="h3" />
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* T04 Using the Tools (p. 166) */}
      <section className="py-24 bg-white border-b border-gray-200">
        <Container>
          <div className="max-w-4xl">
            <h2 className="text-3xl font-bold text-[var(--color-dark)] mb-6">Using the Tools</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Tool results depend on the quality of the inputs, the selected methodology and the assumptions applied. Review the scope and limitations before using an output for reporting, financing or project decisions. Specialist support can help interpret results and identify the further work required.
            </p>
          </div>
        </Container>
      </section>

      {/* T05 Request Tool Access (p. 166): both spec CTAs. */}
      <section className="py-24 bg-[var(--color-paper-alt)] mt-auto">
        <Container>
          <div className="max-w-4xl bg-white rounded-2xl p-10 border border-gray-200 shadow-sm">
            <h2 className="text-3xl font-bold text-[var(--color-dark)] mb-4">Request Tool Access</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl">
              Tell us which tool you are interested in and how you intend to use it.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/contact?intent=tool" className={primaryButton}>
                Request Tool Access <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link href="/contact?intent=project" className={secondaryButton}>
                Discuss Your Project <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Container>
      </section>

    </div>
  );
}
