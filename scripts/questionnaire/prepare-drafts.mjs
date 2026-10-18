import fs from 'node:fs';
import ts from 'typescript';
const root = process.cwd();
// Read literals from the seed files without executing their database-writing code.
function literals(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(literals);
  if (ts.isObjectLiteralExpression(node)) return Object.fromEntries(node.properties.filter(ts.isPropertyAssignment).map(p => [p.name.getText(), literals(p.initializer)]));
  return null;
}
function seed(file, name) {
  const ast = ts.createSourceFile(file, fs.readFileSync(root+'/'+file,'utf8'), ts.ScriptTarget.Latest, true);
  let result;
  function visit(node) { if (ts.isVariableDeclaration(node) && node.name.getText(ast) === name) result = literals(node.initializer); ts.forEachChild(node,visit); }
  visit(ast); return result;
}
const domains = seed('scripts/seed-domains.ts','domains');
const industries = seed('scripts/seed-industries.ts','industries');
const records = domains.flatMap(d => d.capabilities.map(c => ({record_id:c.slug, record_type:'service', service_id:c.slug, title:c.heading, content:c.narrative, public_url:`/domains/${d.slug}#${c.slug}`, canonical_domain_url:`/domains/${d.slug}`, language:'en', audience:'public', status:'draft', approved_by:null, approved_on:null, effective_from:null, effective_until:null, source:'scripts/seed-domains.ts; approved website handoff pp. 21–60', claims_allowed:[c.narrative], claims_prohibited:['Invented projects, clients, credentials, experience, pricing or certification'], promotion_enabled:false, special_review:c.slug.includes('carbon-market')?'Explicit carbon-markets approval required':null})));
fs.writeFileSync(root+'/docs/questionnaire/AI-CATALOGUE-DRAFT.json',JSON.stringify({schema_version:'draft-1',review_status:'awaiting_content_approval',monthly_budget_usd:50,records,url_registry:[...domains.map(d=>({id:d.slug,url:`/domains/${d.slug}`,purpose:d.title})),{id:'contact',url:'/contact',purpose:'Contact Enerqa'},{id:'project-contact',url:'/contact?intent=project',purpose:'Discuss Your Project'},{id:'lifecycle',url:'/project-development',purpose:'Project Development and Lifecycle Support'}]},null,2)+'\n');
fs.writeFileSync(root+'/docs/questionnaire/ARABIC-SOURCE-INVENTORY.json', JSON.stringify({status:'source_snapshot_for_review',source:'Repository seed literals; current CMS export unavailable',domains,industries},null,2)+'\n');
const meta=JSON.parse(fs.readFileSync(root+'/scripts/publication-rebuild/out/meta.json','utf8'));
const rows=Object.entries(meta).map(([slug,v])=>{let d=[],i=[],reason='';
 if(/hydrogen|solar|energy-balance|i-recs/.test(slug)){d=['energy-systems-transition'];i=['energy-utilities'];reason='Energy technology, renewable deployment or energy balance.';}
 else if(/finance|credit-lines/.test(slug)){d=['sustainable-business-esg-finance','energy-systems-transition'];i=['financial-institutions-investors-development-finance','energy-utilities'];reason='Finance for renewable energy and the energy transition.';}
 else if(/aquaculture/.test(slug)){d=['environment-nature-circularity','climate-action-carbon-management'];i=['agriculture-food-aquaculture'];reason='Aquaculture, environmental systems and climate adaptation.';}
 else if(/mercury/.test(slug)){d=['environment-nature-circularity'];i=['mining-natural-resources'];reason='Mercury pollution from artisanal gold mining.';}
 else if(/supercritical|food-waste/.test(slug)){d=['environment-nature-circularity'];i=/supercritical/.test(slug)?['water-waste-circular-economy']:['agriculture-food-aquaculture','water-waste-circular-economy'];reason='Waste treatment or waste prevention.';}
 else if(/tourism/.test(slug)){d=['sustainable-business-esg-finance','environment-nature-circularity'];i=['tourism-hospitality-destinations'];reason='Sustainability in tourism.';}
 else if(/esg|social-sustainability/.test(slug)){d=['sustainable-business-esg-finance'];i=[];reason='General ESG or social sustainability; no specific industry inferred.';}
 else if(/urban-greening/.test(slug)){d=['environment-nature-circularity','climate-action-carbon-management'];i=['infrastructure-real-estate-industrial-zones'];reason='Urban nature, built environment and adaptation.';}
 else if(/artificial-intelligence/.test(slug)){d=['environment-nature-circularity'];i=['technology-telecoms-data-infrastructure'];reason='AI and environmental applications.';}
 else if(/dpsir|dpcer/.test(slug)){d=['environment-nature-circularity'];i=[];reason='General environmental assessment frameworks.';}
 else if(/supply-chains/.test(slug)){d=['climate-action-carbon-management','sustainable-business-esg-finance'];i=['transport-logistics-mobility','industry-manufacturing-materials'];reason='Climate resilience in supply chains.';}
 else if(/burger/.test(slug)){d=['environment-nature-circularity','climate-action-carbon-management'];i=['agriculture-food-aquaculture'];reason='Food environmental footprint.';}
 else {d=['climate-action-carbon-management'];i=[];reason='General climate or emissions subject; avoid speculative sector tags.';}
 return {slug,domains:d,industries:i,rationale:reason,source_excerpt:v.excerpt,approved:false};});
fs.writeFileSync(root+'/docs/questionnaire/PUBLICATION-TAGS-DRAFT.json',JSON.stringify({status:'proposed_only_not_applied',source:'Article rebuild title and excerpt; editor should check full body',articles:rows},null,2)+'\n');
console.log(`Prepared ${records.length} service drafts, ${rows.length} publication tag proposals, 4 domain and 13 industry source records.`);
