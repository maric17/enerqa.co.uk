import type { Tool } from '@/payload-types';
import { resolveMediaUrl } from '@/lib/utils';

// p. 3 / p. 165 (T02): the three flagship tools, in catalogue order.
export const FLAGSHIP_TOOL_SLUGS = ['esg-readiness', 'easysolar', 'greenscale-pro'];

/**
 * Splits validated catalogue records into T02 (the flagships, in p. 165 order)
 * and T03 "Other Enerqa Tools" (p. 165: every other validated tool, never a
 * flagship again). Missing flagships are skipped rather than left as gaps.
 */
export function splitCatalogue<T extends Pick<Tool, 'slug'>>(tools: T[]): { flagships: T[]; otherTools: T[] } {
  const flagships = FLAGSHIP_TOOL_SLUGS.map((slug) => tools.find((tool) => tool.slug === slug)).filter(
    (tool): tool is T => Boolean(tool),
  );
  const otherTools = tools.filter((tool) => !FLAGSHIP_TOOL_SLUGS.includes(tool.slug));
  return { flagships, otherTools };
}

// The only tool with an in-page widget (CarbonCalculator).
export const NATIVE_CALCULATOR_SLUG = 'carbon-calculator';

// p. 165 / p. 191: "Request Access → /contact?intent=tool&tool={slug}".
export const requestAccessHref = (slug: string) =>
  `/contact?intent=tool&tool=${encodeURIComponent(slug)}`;

// p. 166 availability labels ("used only when accurate") that don't imply a
// working file or application.
const CONTROLLED_LABELS = ['Request Access', 'Client Only', 'In Development'] as const;
type ControlledLabel = (typeof CONTROLLED_LABELS)[number];

export type ToolAccess =
  | { kind: 'download'; label: 'Download Tool'; availability: 'Download Available'; href: string }
  | { kind: 'online'; label: 'Launch Tool'; availability: 'Online Tool'; href: string; embedded: boolean }
  | { kind: 'request'; label: 'Request Access'; availability: ControlledLabel; href: string };

type ToolAccessFields = Pick<Tool, 'slug' | 'access' | 'file' | 'iframeUrl' | 'link'>;

export function fileUrl(tool: Pick<Tool, 'file'>): string {
  return tool.file && typeof tool.file === 'object' ? resolveMediaUrl(tool.file.url) : '';
}

/**
 * The action and availability label a tool may honestly show (pp. 166, 191):
 * "Download Tool" only with a cleared file, "Launch Tool" only with a working
 * embed or link, otherwise the default "Request Access". Legacy values
 * ("Public", "Enterprise") and states without a real target fall back to
 * Request Access, so no card ever offers an action that leads nowhere.
 */
export function getToolAccess(tool: ToolAccessFields): ToolAccess {
  if (tool.access === 'Download Available') {
    const href = fileUrl(tool);
    if (href) return { kind: 'download', label: 'Download Tool', availability: 'Download Available', href };
  }

  if (tool.access === 'Online Tool') {
    const embedded = Boolean(tool.iframeUrl) || tool.slug === NATIVE_CALCULATOR_SLUG;
    if (embedded) {
      return { kind: 'online', label: 'Launch Tool', availability: 'Online Tool', href: `/tools/${tool.slug}#access`, embedded };
    }
    if (tool.link) {
      return { kind: 'online', label: 'Launch Tool', availability: 'Online Tool', href: tool.link, embedded };
    }
  }

  const availability = (CONTROLLED_LABELS as readonly string[]).includes(tool.access ?? '')
    ? (tool.access as ControlledLabel)
    : 'Request Access';
  return { kind: 'request', label: 'Request Access', availability, href: requestAccessHref(tool.slug) };
}
