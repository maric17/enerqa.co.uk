import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { publishedToolsWhere } from '@/collections/Tools'
import { Typography } from '../ui/Typography'
import { Container } from '../ui/Container'

/**
 * H10 Enerqa Tools (handoff p. 15).
 *
 * Only the three flagship tools appear (p. 225 "Prioritise the three named
 * flagship tools"; p. 165 T02 names them and gives their routes). The old
 * CMS query also pulled in unvalidated tools (p. 166: validate names and
 * versions before adding them) and a second ESG Readiness record.
 *
 * The CMS still decides whether each card shows: a flagship appears only while
 * its record passes `publishedToolsWhere` (validated), the same gate as the
 * catalogue and the detail route, so un-validating a tool removes its card too.
 *
 * Names and descriptions are the approved T02 text from p. 165, verbatim. No
 * availability label is shown: p. 166 allows "Online Tool" and the others
 * "only when accurate", and access is still being validated.
 */
const FLAGSHIP_TOOLS = [
  {
    slug: 'esg-readiness',
    title: 'ESG Readiness Tool',
    desc: 'The ESG Readiness Tool uses criteria and guiding questions to identify readiness gaps and areas for improvement, providing a starting point for a more focused ESG strategy and action plan.',
    image: '/assets/images/esg-logo.webp',
  },
  {
    slug: 'easysolar',
    title: 'easySOLAR',
    desc: 'easySOLAR brings solar PV and battery-storage sizing together with capital and operating costs, financial performance, expected savings and avoided GHG emissions.',
    image: '/assets/images/easysolar.png',
  },
  {
    slug: 'greenscale-pro',
    title: 'GreenScale Pro',
    desc: 'GreenScale Pro provides an assessment framework for examining sustainability and resilience criteria and identifying priorities for further development.',
    image: '/assets/images/greenscale.png',
  },
] as const

export const Tools = async () => {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'tools',
    where: { and: [publishedToolsWhere, { slug: { in: FLAGSHIP_TOOLS.map((tool) => tool.slug) } }] },
    limit: FLAGSHIP_TOOLS.length,
    depth: 0,
  })
  const validatedSlugs = new Set(docs.map((doc) => doc.slug))
  const tools = FLAGSHIP_TOOLS.filter((tool) => validatedSlugs.has(tool.slug))

  return (
    <section className="bg-white py-[60px]" id="tools" aria-labelledby="h10-enerqa-tools">
      <Container>

        <div className="max-w-[800px] mb-12 text-left">
          <Typography variant="h2" id="h10-enerqa-tools" className="home-h2 text-ink mb-4">
            Enerqa Tools
          </Typography>
          {/* p. 15 H10 narrative, verbatim */}
          <p className="text-[15.5px] text-ink-soft leading-[1.6] m-0 mb-6 font-light">
            Structured tools help make assessment, modelling and project decisions more accessible. Explore ESG readiness, solar-energy assessment and sustainability and resilience evaluation.
          </p>
          <Link href="/tools" className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[var(--color-secondary)] no-underline transition-colors hover:text-[#075a93]">
            Explore All Tools &rarr;
          </Link>
        </div>

        {tools.length > 0 && (
          <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-3">
            {tools.map(tool => (
              <li key={tool.slug} className="group bg-white border border-[var(--green)]/20 rounded-[var(--r-md)] p-6 flex flex-col justify-between gap-4 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,207,200,0.08)] hover:border-[var(--green)]/40">
                <div>
                  <div className="bg-[#FAFBFB] h-[110px] rounded-[var(--r-sm)] flex items-center justify-center mb-4 border border-[var(--green)]/20 overflow-hidden p-3 transition-colors group-hover:bg-white">
                    {/* The logo repeats the tool name printed below it, so it is decorative. */}
                    <Image src={tool.image} alt="" width={200} height={100} className="max-w-full max-h-full object-contain" />
                  </div>
                  <h3 className="text-[17px] font-bold text-ink m-0 mb-2">
                    {tool.title}
                  </h3>
                  <p className="text-[13.5px] text-ink-soft leading-[1.55] m-0 font-light">
                    {tool.desc}
                  </p>
                </div>
                {/* p. 165: "Explore Tool -> /tools/{slug}" */}
                <Link href={`/tools/${tool.slug}`} className="text-[13px] font-bold text-[var(--color-secondary)] flex items-center gap-1 no-underline transition-colors mt-3 hover:text-[#075a93]">
                  Explore Tool<span className="sr-only">: {tool.title}</span> &rarr;
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  )
}
