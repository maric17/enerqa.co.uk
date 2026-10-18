# Publication restoration

Updated 15 October 2026 for WF-22–WF-24.

Restored 80 original visuals across all 25 articles: 64 archive images, 15 skipped table/vector crops and the Sudan Sankey diagram recovered from the original Enerqa article. This includes the aquaculture DPSIR vector diagram, hydrogen comparison tables, green-credit scoring tables and the SCWT resource-recovery callout.

Twenty-four archive-edition PDFs are available from the corresponding article pages. They retain the original paragraphs, tables, footnotes and source layout. The Sudan article instead links its original Enerqa publication. Original PDFs are archive editions; they do not silently replace the separately edited website text.

Read-only checks found all 25 CMS article bodies match the saved September reconstruction, and all lacked embedded image nodes. The current restoration preserves that text and inserts source artwork using text anchors. Changed anchors retain their artwork in a labelled appendix. Every visual has a description and full-size link; recovered table/vector crops include expandable source text.

## Article checklist

| Article | Original source | Recovered visuals | CMS text versus saved reconstruction |
| --- | --- | --- | --- |
| Breathing vs. Burning: The Carbon Footprint Contrast | Archive PDF pages 22–23 | 1 | Matches |
| Climate Change and War: A Complex Interplay | Archive PDF pages 15–17 | 4 | Matches |
| Climate Forcers: The Hidden Drivers of Global Warming | Archive PDF pages 10–11 | 1 | Matches |
| DPSIR Framework for Sustainable Aquaculture in the Red Sea Region (KSA): A Climate Adaptation and Mitigation Perspective | Archive PDF pages 100–104 | 2 | Matches |
| Driving Climate Action Through Renewable Energy Finance: Insights from an Expert | Archive PDF pages 60–63 | 6 | Matches |
| Empowering Communities Through Social Sustainability: A Call to Action | Archive PDF pages 82–85 | 1 | Matches |
| Environmental Impacts of Mercury Use in Artisanal Gold Mining in Africa (Sudan- case): The Amplifying Effect of Torrential Rains and Floods | Archive PDF pages 91–95 | 7 | Matches |
| Exploring the Rainbow of Hydrogen Technology: A Path to Sustainable Energy and Climate Resilience | Archive PDF pages 26–34 | 5 | Matches |
| GHG EMISSIONS – The Burden on Our Planet | Archive PDF pages 24–24 | 1 | Matches |
| Green Credit Lines in the Gulf Cooperation Council: Evaluating Opportunities, Overcoming Challenges, and Assessing the Impact on Energy Transition in  | Archive PDF pages 35–55 | 13 | Matches |
| Greenhouse Gases and Climate Change: An Overview | Archive PDF pages 18–21 | 6 | Matches |
| I-RECs - A catalyst for renewable energy investment in Qatar | Archive PDF pages 64–65 | 1 | Matches |
| Practical Tips for Reducing Food Waste at Home: A Step Towards Sustainability | Archive PDF pages 74–76 | 3 | Matches |
| Scope 4 Emissions: The Concept of Avoided Emissions | Archive PDF pages 109–112 | 4 | Matches |
| Sudan's Energy Balance 2020 | [Original Enerqa article](https://www.enerqa.co.uk/sudan-s-energy-balance-2020) | 1 | Matches |
| Supercritical Water Technology (SCWT) - A Sustainable Solution for Waste Management in Qatar | Archive PDF pages 56–59 | 2 | Matches |
| Sustainable Tourism | Archive PDF pages 77–79 | 2 | Matches |
| The Evolution of Climate Change Understanding and Response | Archive PDF pages 8–9 | 1 | Matches |
| The Hidden Costs of Your Burger and Pizza: What’s Really at Stake? | Archive PDF pages 72–73 | 1 | Matches |
| The Hidden Link Between Cigarette Smoking and Climate Change | Archive PDF pages 80–81 | 2 | Matches |
| The Imperative for ESG Readiness Tools: Unlocking Benefits for Companies, Institutions, and Society | Archive PDF pages 105–108 | 3 | Matches |
| The Origins of Urban Greening | Archive PDF pages 86–90 | 6 | Matches |
| The Role of Artificial Intelligence in Environmental Sustainability | Archive PDF pages 66–70 | 2 | Matches |
| Understanding the DPSIR, DPCER, DPSWR, and DPSER Frameworks in analyzing the interactions between human activities and the environment | Archive PDF pages 97–99 | 3 | Matches |
| Weathering the Storm: Climate Resilience in Supply Chains | Archive PDF pages 12–14 | 2 | Matches |

## Verification and remaining editorial work

- Tests check that all 80 assets exist, have descriptions and match real text anchors. Rendering preserves body text and keeps artwork if its anchor changes.
- The shared template removes the repeated Executive Summary section while preserving topics and substantive body content.
- [Browser evidence](browser-verification.json) records per-article counts, actual image loads, original PDF responses and absence of Executive Summary headings.
- [Full source-text comparison](publication-text-comparison.json) identifies differences against every archive article. Some are captions or removed tables; others are source-edition differences, sidebars or references. The weathering article uses the cleaner original website reference list, while the archive mixes references from other articles. Do not overwrite those edited references blindly.
- WF-22 remains open for the editorial decision on remaining body/reference differences. The original archive editions provide the complete source while this review proceeds; no missing prose was invented and no CMS rows were overwritten.
- WF-23 remains open for a final comparison of non-image drawings, callouts and placement against every source page. Loading the 80 recovered visuals does not establish that all source artwork has been restored.
- The final image-resolution check confirms a 1,200 px image for a 1,120 px display width; the diagram is no longer enlarged from a smaller requested image. See [resolution evidence](browser-image-resolution-verification.json).

Regeneration: scripts/audit-publication-archive.py inventories the PDF; scripts/audit-publication-text.py compares source text; scripts/extract-publication-figures.py regenerates lossless crops, reviewed anchors and original archive PDFs. The extractor requires PyMuPDF and Pillow. Keep the separately downloaded Sudan diagram, whose original source is recorded in the manifest.
