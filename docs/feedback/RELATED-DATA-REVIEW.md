# Related data — joint review matrix

Prepared 15 October 2026 for WF-21. This inventories the four domain mappings in `src/lib/feeds/contextual.ts` and the thirteen industry mappings in `scripts/seed-industries.ts`. Industry seed mappings must be compared with the saved CMS settings during the joint review; they are not represented as a fresh database audit.

News discovery, market quotes and numerical sustainability datasets are separate inputs. Selecting Exa or another news service does not replace the numerical providers below. Keep working catalogue links and existing verified datasets until an agreed replacement has suitable coverage and rights.

## Four domains

| Page | Configured numerical sources | Review decision |
| --- | --- | --- |
| [climate action carbon management](/domains/climate-action-carbon-management) | Climate TRACE, OECD | Choose the indicator, geography, period and whether a compact chart adds value. |
| [energy systems transition](/domains/energy-systems-transition) | U.S. EIA, NASA POWER, World Bank | Choose the indicator, geography, period and whether a compact chart adds value. |
| [environment nature circularity](/domains/environment-nature-circularity) | GBIF, OpenAQ, OECD | Choose the indicator, geography, period and whether a compact chart adds value. |
| [sustainable business esg finance](/domains/sustainable-business-esg-finance) | OECD, World Bank | Choose the indicator, geography, period and whether a compact chart adds value. |

## Thirteen industries

| Page | Seeded numerical sources | Review decision |
| --- | --- | --- |
| [Government, Regulators & Public Institutions](/industries/government-regulators-public-institutions) | World Bank, OECD | Compare saved CMS mapping; choose a sector-relevant measure and geography. |
| [Financial Institutions, Investors & Development Finance](/industries/financial-institutions-investors-development-finance) | OECD, World Bank | Compare saved CMS mapping; choose a sector-relevant measure and geography. |
| [Energy & Utilities](/industries/energy-utilities) | U.S. EIA, NASA POWER | Compare saved CMS mapping; choose a sector-relevant measure and geography. |
| [Oil, Gas & Petrochemicals](/industries/oil-gas-petrochemicals) | Climate TRACE, U.S. EIA | Compare saved CMS mapping; choose a sector-relevant measure and geography. |
| [Industry, Manufacturing & Materials](/industries/industry-manufacturing-materials) | Climate TRACE, U.S. EIA | Compare saved CMS mapping; choose a sector-relevant measure and geography. |
| [Infrastructure, Real Estate & Industrial Zones](/industries/infrastructure-real-estate-industrial-zones) | NASA POWER, World Bank | Compare saved CMS mapping; choose a sector-relevant measure and geography. |
| [Transport, Logistics & Mobility](/industries/transport-logistics-mobility) | Climate TRACE, U.S. EIA | Compare saved CMS mapping; choose a sector-relevant measure and geography. |
| [Water, Waste & Circular Economy](/industries/water-waste-circular-economy) | OECD, World Bank | Compare saved CMS mapping; choose a sector-relevant measure and geography. |
| [Agriculture, Food & Aquaculture](/industries/agriculture-food-aquaculture) | NASA POWER, World Bank | Compare saved CMS mapping; choose a sector-relevant measure and geography. |
| [Mining & Natural Resources](/industries/mining-natural-resources) | GBIF, Climate TRACE | Compare saved CMS mapping; choose a sector-relevant measure and geography. |
| [Tourism, Hospitality & Destinations](/industries/tourism-hospitality-destinations) | NASA POWER, GBIF | Compare saved CMS mapping; choose a sector-relevant measure and geography. |
| [Technology, Telecoms & Data Infrastructure](/industries/technology-telecoms-data-infrastructure) | U.S. EIA, NASA POWER | Compare saved CMS mapping; choose a sector-relevant measure and geography. |
| [Healthcare, Education & Institutional Estates](/industries/healthcare-education-institutional-estates) | NASA POWER, World Bank | Compare saved CMS mapping; choose a sector-relevant measure and geography. |

## Proposed presentation

- One compact, clearly titled dataset preview per page when a relevant verified dataset exists. Show units, observation period, geography, provider, last update and a link to methodology/download.
- Use source-catalogue links when a relevant licensed measure is unavailable. Do not fill gaps with example values or unrelated market quotes.
- Confirm whether Enerqa wants global comparisons, a Qatar/GCC view or another geography for each page. The current EIA fallback is explicitly United States electricity generation; that must not stand in for Qatar without a deliberate editorial choice.
- Select company tickers for Major Markets separately from domain/industry sustainability indicators.

## Decisions to record for each row

Record: chosen indicator and unit; geography; historical/current period; source and dataset link; update cadence; available licence/attribution; chart versus catalogue link; editorial owner. Apply the agreed choices through the existing dataset and page configuration, then verify all seventeen pages.

Dependency: resolve the applicable provider scope in [API-RECOMMENDATIONS.md](API-RECOMMENDATIONS.md), then review this matrix with the client. No provider, dataset, schema or CMS mapping was changed by generating this document.
