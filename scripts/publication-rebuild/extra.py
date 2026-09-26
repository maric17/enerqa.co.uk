# Per-article fixes on top of dk/opts.py (earlier agent). Keys:
#   force      {prefix: 'p'|'h2'|'h3'}  block type for a line (dk/article.py)
#   mergeheads True                     join a heading that wraps onto a second line
#   drop       [regex]                  drop a PDF line (dk/article.py)
#   dropblocks [regex]                  drop a whole block after assembly (tables flattened to text, orphan figure credits)
#   relevel    [(regex, 'h2'|'h3')]     heading level fixes
#   repl2      {old: new}               exact text repairs (words the PDF text layer joined or split)

# Live-site post used instead of the archive PDF (file in dk/live/).
LIVE_SOURCE = {
    # The archive holds this article only as an image (PDF p. 24).
    'ghg-emissions-the-burden-on-our-planet': 'ghg-emissions-the-burden-on-our-planet.html',
    # The archive's reference list mixes in the AI and Scope 4 articles' references;
    # the live post is self-consistent (in-text [1], [3] -> refs 1-6).
    'weathering-the-storm-climate-resilience-in-supply-chains': 'weathering-the-storm-climate-resilience-in-supply-chains.html',
    # Not in the archive at all; created by scripts/add-sudan-energy-balance.ts.
    'sudan-s-energy-balance-2020': 'sudan-s-energy-balance-2020.html',
}

# Joins the PDF text layer makes between two words, and spaced hyphens in compounds.
GLOBAL_REPL = [
    # only the compounds found in the archive ("climate change - report" is a real dash)
    (r'\b(zero|user|trade|sector|low|least|large|finance|high) - ([a-z]+)\b', r'\1-\2'),
]

EXTRA = {
    'weathering-the-storm-climate-resilience-in-supply-chains': {
        'repl2': {
            # hyphens the live copy lost; the archive PDF has these URLs intact
            'drought-trade-riverssupply-chain': 'drought-trade-rivers-supply-chain',
            'blames-queuesdrought-draft-cut': 'blames-queues-drought-draft-cut',
            'weak-link-in-yoursupply-chain': 'weak-link-in-your-supply-chain',
            'are-youprepared': 'are-you-prepared',
            '[2] . J. Verschuur': '[2] J. Verschuur',
            '[Accessed 25 September 2024.': '[Accessed 25 September 2024].',
        },
    },
    'breathing-vs-burning-the-carbon-footprint-contrast': {
        # figure credit for a figure that is not imported
        'dropblocks': [r'^\(Author’s illustration\)$'],
    },
    'driving-climate-action-through-renewable-energy-finance-insights-from-an-expert': {
        'relevel': [(r'^(Overview|Challenges and barriers|Investment Trends|Risk Assessment|Recommendations)$', 'h3')],
        'repl2': {'insecuring': 'in securing', 'REplants': 'RE plants', 'landrights': 'land rights', 'inde-risking': 'in de-risking',
                  'critical .': 'critical.'},
    },
    'climate-change-and-war-a-complex-interplay': {
        'mergeheads': True,
        'dropblocks': [r'^Destruction in Ukraine'],    # two photo captions run together
    },
    'exploring-the-rainbow-of-hydrogen-technology-a-path-to-sustainable-energy-and-climate-resilience': {
        'tablepages': [29, 32, 33],
        'relevel': [(r'^Conclusion$', 'h3')],
        # Tables 1-3 came through as interleaved cell text; they are not imported.
        'dropblocks': [r'^(\*\*)?Source:', r'^Color Production Method Emissions Applicability', r'^Steam Methane Reforming$', r'^Cost-effective; widely used',
                       r'^Ideal for sectors requiring', r'^Hydrogen$', r'^Economic Context Technical Feasibility', r'^Gray Low-cost;',
                       r'^gas-rich countries; high$', r'^High; mature technology', r'^Moderate; dependent on CCS', r'^mitigates CO2',
                       r'^infrastructure and public nuclear', r'^energy mix, suitable where', r'^Under research; potential in',
                       r'^Hydrogen Type Emission Reduction Potential', r'^Gray Low High CO'],
        'repl2': {'extensively instars': 'extensively in stars', '1970soil': '1970s oil', 'hydrogenin ': 'hydrogen in ',
                  'ande xtensive': 'and extensive', 'IR ENA': 'IRENA'},
    },
}

EXTRA['green-credit-lines-in-the-gulf-cooperation-council-evaluating-opportunities-overcoming-challenges-and-assessing-the-impact-on-energy-transition-in'] = {
    'tablepages': [36, 38, 40, 44, 46, 47, 48, 49, 51, 52, 53],
    # Tables 2 (pp. 37-38) and 3 (pp. 39-40) have no cell grid the detector can see.
    'droprange': [(r'^Outlines a long-term vision for economic', r'^In their recent National RE strategy'),
                  (r'^Qatar National Issued USD 600 million', r'^Rese?arch Methodology')],
    'dropblocks': [r'^(\*\*)?Source:'],
    'footnotes': True,
    'nestbullets': True,
    'relevel': [(r'^(Energy Transition Challenges in Qatar and the GCC|The Role of the Financial Sector and GCL|Impact Assessment|Research Framework|GCL Implementation Potential Index \(GCLIPI\)|GCL Potential Impact Indicator \(GCLPII\)|Policy Recommendations|Financial Sector Recommendations|Study Limitations)$', 'h3'),
                (r'^(Highly ambitious \(3 points\)|Moderate \(2 points\)|Ambitious with challenges \(1 point\)):$', 'p')],
    'rx': [(r'\b(the|a|and|of|for)RE\b', r'\1 RE'), (r'\bRE(in|share|plans|use|sources|contribution|target)\b', r'RE \1')],
    'repl2': {'Reserch Methodology': 'Research Methodology', 'highest per th capita': 'highest per capita',
              'and Oman 12 [4]': 'and Oman 12th [4]', 'GCL Implementation 7 Potential Index': 'GCL Implementation Potential Index',
              'importance of the 5 governmental': 'importance of the governmental', 'infra structure': 'infrastructure'},
}

EXTRA['breathing-vs-burning-the-carbon-footprint-contrast']['repl2'] = {}

EXTRA['the-role-of-artificial-intelligence-in-environmental-sustainability'] = {
    'tablepages': [67],                       # Figure 9 bar chart labels
    # Figure 10 infographic: its numbers and labels cannot be paired reliably from the text layer
    'droprange': [(r'^Key Achievements:$', r'^2\.3 Biodiversity and Ecosystem Monitoring$')],
    'dropblocks': [r'^2$', r'^GTCO /YEAR$'],
    'keeprefs': [3, 4, 5, 6, 7, 8, 9],        # the text cites [3]-[9] of the shared list
    # the [9] entry runs on into the next chapters' references
    'truncafter': ['Artificial Intelligence (AI) Market Size, Share, Trends – 2033).'],
}

EXTRA['scope-4-emissions-the-concept-of-avoided-emissions'] = {
    'tablepages': [109],                      # Figure 13 (Scope 1/2/3 boxes)
    'dropblocks': [r'^•(Direct|Indirect) emissions', r'^(heat, or steam\.|chain, both upstream|and downstream)$', r'^Scope [123]$'],
    'keeprefs': [10, 11, 12, 13, 14],         # the text cites [10]-[14] of the shared list
}

EXTRA['practical-tips-for-reducing-food-waste-at-home-a-step-towards-sustainability'] = {
    'repl2': {'forch ange': 'for change'},
}

EXTRA['sustainable-tourism'] = {
    'relevel': [(r'^(What is Sustainable Tourism\?|The Three Pillars of Sustainable Tourism|The Triple Bottom Line: People, Planet, and Profit|Why is Sustainable Tourism Important\?|How Can You Contribute to Sustainable Tourism\?)$', 'h2'),
                (r'^[123]\. (Protecting Natural Resources|Preserving Cultures and Heritage|Supporting Local Economies)$', 'h3')],
}

EXTRA['the-hidden-link-between-cigarette-smoking-and-climate-change'] = {
    'dropblocks': [r'^The figure showcases a selection'],   # caption of a figure that is not imported
    'repl2': {'canencourage': 'can encourage', 'Tobacco -Free Kids': 'Tobacco-Free Kids'},
}

EXTRA['empowering-communities-through-social-sustainability-a-call-to-action'] = {
    # the SDG image's caption ran into the next paragraph
    'repl2': {'United Nations Sustainable Development Goals (SDGs)': '', 'stronger.Social': 'stronger. Social'},
}

EXTRA['the-origins-of-urban-greening'] = {
    'dropblocks': [r'^The photo is (from|for) '],             # photo captions; photos are not imported
    'relevel': [(r'^Street Tree Planting and Green Corridors:$', 'p')],
    'repl2': {'balanc e': 'balance'},
    'bulletsplit': {'start': r'^Urban Greening Success Stories •',
                    'labels': ['Urban Greening Success Stories', 'Urban Greening in the GCC', 'Urban Greening in Saudi Arabia']},
}

EXTRA['environmental-impacts-of-mercury-use-in-artisanal-gold-mining-in-africa-sudan-case-the-amplifying-effect-of-torrential-rains-and-floods'] = {
    'splitat': ['A field study by the author was conducted'],
    'repl2': {'(Carsten, 2016).Flooding': '(Carsten, 2016). Flooding', 'Northen Sudan': 'Northern Sudan'},
}

EXTRA['understanding-the-dpsir-dpcer-dpswr-and-dpser-frameworks-in-analyzing-the-interactions-between-human-activities-and-the-environment'] = {
    'relevel': [(r'^(Overview of the Frameworks|Uses of the Frameworks|Differences Between the Frameworks|Interrelationship Among the Frameworks)$', 'h2'),
                (r'^[1-4]\. (DPSIR|DPCER|DPSWR|DPSER) Framework$', 'h3')],
    'repl2': {'late 1990sand has': 'late 1990s and has'},
}

EXTRA['dpsir-framework-for-sustainable-aquaculture-in-the-red-sea-region-ksa-a-climate-adaptation-and-mitigation-perspective'] = {
    # side-column summary boxes on pp. 101 and 103
    'aside_x': 338, 'aside_pages': [101, 103], 'colsplit': {101: 338, 103: 365},
    'tablepages': [100, 102],                 # Figure 12 diagram, Table 10 and the Responses grid
    'relevel': [(r'^(DPSIR Framework for Aquaculture in the Red Sea Region|Linking DPSIR to Climate Adaptation and Mitigation|Way Forward)$', 'h2'),
                (r'^[1-5]\. (Drivers|Pressures|State of Environment|Impacts|Responses)$', 'h3')],
    # The Responses grid (label cell | text cell), rebuilt from its own words
    'replacerange': [(r'^Responses are the actions taken', r'^Linking DPSIR to Climate Adaptation', [
        'Responses are the actions taken to address the drivers, pressures, and impacts of aquaculture activities.',
        '- **Policy and Regulation:** Implementing stringent environmental standards for aquaculture operations, including site selection and waste management.',
        '- **Technological Innovations:** Adoption of low-impact practices such as integrated multi-trophic aquaculture (IMTA) and renewable energy-powered systems.',
        '- **Capacity Building:** Training programs for local communities and stakeholders to promote sustainable aquaculture practices.',
        '- **Climate Adaptation Strategies:** Incorporating climate-resilient species and enhancing ecosystem-based approaches.',
        '- **Monitoring and Research:** Establishing robust systems to monitor environmental parameters and assess aquaculture’s impacts.',
    ])],
    'moveblock': [(r'^Climate adaptation measures include utilizing', r'^Climate Mitigation$')],
    'repl2': {'th This paper is a contribution to the 6 International': 'This paper is a contribution to the 6th International',
              'frame work': 'framework'},
}

EXTRA['the-imperative-for-esg-readiness-tools-unlocking-benefits-for-companies-institutions-and-society'] = {
    'repl2': {'scales.On the other hand': 'scales. On the other hand', 'Ma jid Al Futtaim': 'Majid Al Futtaim'},
}

EXTRA['i-recs-a-catalyst-for-renewable-energy-investment-in-qatar'] = {
    'repl2': {'( https://www.irena.org': '(https://www.irena.org'},
}
