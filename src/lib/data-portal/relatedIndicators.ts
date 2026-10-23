import catalogue from './gapminder-catalogue.json';
import coverage from './related-indicator-coverage.json';

type Recommendation = { id: string; why: string };
const indicator = (id: string, why: string): Recommendation => ({ id, why });

// Editorial order reflects each page's subject; matching a provider name is insufficient.
const energy = [
  indicator('wdi:eg_elc_rnew_zs', 'Compare the renewable share of electricity generation.'),
  indicator('wdi:eg_fec_rnew_zs', 'Track renewable energy across total final consumption.'),
  indicator('wdi:eg_use_comm_gd_pp_kd', 'Compare the energy required per unit of economic output.'),
  indicator('wdi:eg_use_pcap_kg_oe', 'Compare energy demand per person.'),
  indicator('wdi:eg_elc_coal_zs', 'Track dependence on coal-fired electricity.'),
];
const climate = [
  indicator('fasttrack:terr_emissions', 'Compare territorial carbon dioxide emissions.'),
  indicator('wdi:en_ghg_ch4_mt_ce_ar5', 'Track total methane emissions, excluding land use and forestry.'),
  indicator('wdi:en_ghg_n2o_mt_ce_ar5', 'Track total nitrous oxide emissions, excluding land use and forestry.'),
  indicator('wdi:en_ghg_co2_lu_df_mt_ce_ar5', 'Explore the carbon impact of deforestation.'),
  indicator('wdi:en_pop_el5m_zs', 'Compare population exposure in low-elevation coastal areas.'),
];
const environment = [
  indicator('wdi:en_ghg_co2_lu_fl_mt_ce_ar5', 'Explore carbon fluxes associated with forest land.'),
  indicator('wdi:en_ghg_co2_lu_df_mt_ce_ar5', 'Track the carbon impact of deforestation.'),
  indicator('wdi:en_ghg_ch4_wa_mt_ce_ar5', 'Compare methane emissions from waste.'),
  indicator('wdi:ny_adj_dfor_gn_zs', 'Compare forest depletion as a share of national income.'),
  indicator('wdi:ny_adj_dres_gn_zs', 'Compare the economic depletion of natural resources.'),
];
const finance = [
  indicator('wdi:ny_adj_svng_gn_zs', 'Compare savings after accounting for resource depletion and pollution damage.'),
  indicator('wdi:ny_adj_dco2_gn_zs', 'Explore estimated carbon dioxide damage relative to national income.'),
  indicator('wdi:ny_adj_dres_gn_zs', 'Assess the economic cost of natural resource depletion.'),
  indicator('wdi:ic_frm_co2_zs', 'Compare the share of firms monitoring their own carbon dioxide emissions.'),
  indicator('wdi:ie_ppi_watr_cd', 'Explore private participation in water and sanitation investment.'),
];
const buildings = [
  indicator('wdi:en_ghg_ch4_bu_mt_ce_ar5', 'Track methane emissions from building energy use.'),
  indicator('wdi:en_ghg_n2o_bu_mt_ce_ar5', 'Track nitrous oxide emissions from building energy use.'),
  indicator('wdi:eg_elc_rnew_zs', 'Compare the national electricity mix used to power buildings.'),
];

export const RELATED_INDICATORS: Record<'domains' | 'industries', Record<string, readonly Recommendation[]>> = {
  domains: {
    'climate-action-carbon-management': climate,
    'energy-systems-transition': energy,
    'environment-nature-circularity': environment,
    'sustainable-business-esg-finance': finance,
  },
  industries: {
    'government-regulators-public-institutions': [climate[0], energy[0], climate[4], finance[0], environment[4]],
    'financial-institutions-investors-development-finance': finance,
    'energy-utilities': energy,
    'oil-gas-petrochemicals': [
      indicator('wdi:en_ghg_ch4_fe_mt_ce_ar5', 'Compare fugitive methane emissions from energy production.'),
      indicator('wdi:ny_adj_dngy_gn_zs', 'Track the economic depletion of energy resources.'),
      indicator('wdi:eg_elc_fosl_zs', 'Compare electricity generation from oil, gas and coal.'),
      indicator('wdi:eg_elc_ngas_zs', 'Compare the share of electricity generated from natural gas.'),
      indicator('wdi:eg_elc_petr_zs', 'Compare the share of electricity generated from oil.'),
    ],
    'industry-manufacturing-materials': [
      indicator('wdi:en_ghg_ch4_ic_mt_ce_ar5', 'Track methane emissions from industrial combustion.'),
      indicator('wdi:en_ghg_n2o_ic_mt_ce_ar5', 'Track nitrous oxide emissions from industrial combustion.'),
      indicator('wdi:en_ghg_fgas_ip_mt_ce_ar5', 'Compare fluorinated greenhouse gas emissions from industrial processes.'),
      finance[3], energy[2],
    ],
    'infrastructure-real-estate-industrial-zones': [
      ...buildings,
      indicator('wdi:en_pop_el5m_ur_zs', 'Compare urban population exposure in low-elevation coastal areas.'),
      indicator('wdi:eg_elc_accs_ur_zs', 'Compare urban access to electricity.'),
    ],
    'transport-logistics-mobility': [
      indicator('wdi:en_ghg_ch4_tr_mt_ce_ar5', 'Track methane emissions from transport energy use.'),
      indicator('wdi:en_ghg_n2o_tr_mt_ce_ar5', 'Track nitrous oxide emissions from transport energy use.'),
    ],
    'water-waste-circular-economy': [environment[2],
      indicator('wdi:en_ghg_n2o_wa_mt_ce_ar5', 'Compare nitrous oxide emissions from waste.'), finance[4]],
    'agriculture-food-aquaculture': [
      indicator('wdi:en_ghg_ch4_ag_mt_ce_ar5', 'Compare methane emissions from agriculture.'),
      indicator('wdi:en_ghg_n2o_ag_mt_ce_ar5', 'Compare nitrous oxide emissions from agriculture.'), climate[3]],
    'mining-natural-resources': [
      indicator('wdi:ny_adj_dmin_gn_zs', 'Compare mineral depletion relative to national income.'), environment[4]],
    'tourism-hospitality-destinations': [
      indicator('wdi:en_pop_el5m_zs', 'Assess national coastal exposure as context for destination resilience.'),
      indicator('wdi:eg_elc_rnew_zs', 'Compare the national electricity mix supplying hospitality facilities.')],
    'technology-telecoms-data-infrastructure': [
      indicator('wdi:eg_elc_rnew_zs', 'Compare the national electricity mix supplying digital infrastructure.'),
      indicator('wdi:eg_use_comm_gd_pp_kd', 'Compare national energy intensity as context for infrastructure efficiency.')],
    'healthcare-education-institutional-estates': buildings,
  },
};

/** Only recommend real Explorer indicators with recorded open reuse terms. */
export function relatedIndicators(field: 'domains' | 'industries', slug: string) {
  return (RELATED_INDICATORS[field][slug] ?? []).slice(0, 5).flatMap(recommendation => {
    const record = catalogue.find(entry => entry.id === recommendation.id);
    const period = coverage[recommendation.id as keyof typeof coverage];
    return record && period?.commit === record.commit && /^CC BY[ -]?4\.0$/i.test(record.licence)
      ? [{ ...record, period, why: recommendation.why, href: explorerLink(record.id) }] : [];
  });
}

export function explorerLink(indicatorId?: string) {
  return indicatorId ? `/data-portal/explorer?${new URLSearchParams({ indicator: indicatorId })}` : '/data-portal/explorer';
}

/** Section actions open the page's lead recommendation, rather than the catalogue's first entry. */
export function relatedDataHref(field: 'domains' | 'industries', slug: string) {
  return relatedIndicators(field, slug)[0]?.href ?? explorerLink();
}
