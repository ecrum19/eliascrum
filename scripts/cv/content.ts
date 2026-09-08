import { cvProfile, cvSections, type CvItem } from '../../src/data/cvData';
import { cvDownloads } from '../../src/data/cvDownloads';
import { publications, orcidProfileUrl, type Publication } from '../../src/data/publicationsData';
import { softwareProjects } from '../../src/data/softwareData';
import { softwareReleasesBySoftwareId } from '../../src/data/softwareReleases';
import { getTalkViewEntries } from '../../src/data/talkCatalog';
import { getPosterViewEntries } from '../../src/data/posterCatalog';

export { cvProfile, cvSections, cvDownloads, publications, softwareProjects, orcidProfileUrl, softwareReleasesBySoftwareId };
export const talks = getTalkViewEntries();
export const posters = getPosterViewEntries();

// Editorial choices for medical semantic web applications. Facts, dates, degree names,
// publication status, and project descriptions continue to come from the site records.
export const focusedSummary =
  'Computer science engineering PhD candidate and bioinformatician working on interoperable, privacy-aware clinical genomic data. Research spans RDF knowledge graphs, ontology definition, federated SPARQL querying, and Solid-based data sharing, with prior experience in microbial genomics and direct clinical care support.';

function section(title: string) {
  const result = cvSections.find((entry) => entry.title === title);
  if (!result) throw new Error(`Missing CV section: ${title}`);
  return result;
}

function item(title: string, role: string): CvItem {
  const result = section(title).items.find((entry) => entry.role === role);
  if (!result) throw new Error(`Missing focused CV item: ${title} / ${role}`);
  return result;
}

export const focusedExperience = [
  item('Research Experience', 'Ph.D. Candidate'),
  { ...item('Research Experience', 'Research Stay'),
    details: [
      'Knowledge Representation Unit (KRU): public SPARQL endpoint maintenance and Solid Cockpit development for federated querying across endpoints and research-data Solid pods.',
      'FWO Long Research Stay V416635N; CHIST-ERA TRIPLE (CHIST-ERA-22-ORD-09).',
    ] },
  { ...item('Research Experience', "Master's Researcher"),
    details: item('Research Experience', "Master's Researcher").details?.filter((detail) => typeof detail === 'string' && !detail.startsWith("Master's thesis:")) },
  { ...item('Professional Experience', 'Medical Scribe'),
    details: item('Professional Experience', 'Medical Scribe').details?.filter((_, index) => index !== 1) },
];
export const focusedEducation = section('Education').items;
export const focusedTeaching = item('Professional Experience', 'Adjunct Professor of Biology');
// Descriptions checked against the fellowship record and the award certificates.
export const awardDescriptions: Record<string, string> = {
  'Strategic Basic PhD Fellowship Awardee': 'Four-year fellowship supporting privacy-aware clinical genomic data management and querying.',
  'AIbare Award': 'Poster award for VCF-to-RDF research, selected by consensus ranking across generative-AI models.',
  'Best Paper (Group)': 'Best scientific report award for the ISWS 2024 group research project.',
  'Best Poster (Individual)': 'Best poster award for presenting the PENGQUIN clinical genomics research framework.',
};
export const focusedAwards = section('Honors and Awards').items.filter((entry) => entry.group === 'Graduate Education');
export const focusedSkills = ['Semantic Web', 'Programming/Querying Languages', 'Miscellaneous', 'Languages'].map((role) => item('Skills', role));

// Concise descriptions grounded in each project's description on the site.
const softwareSummaries: Record<string, string> = {
  'vcf-rdfizer': 'VCF-to-RDF conversion with RML/RMLStreamer, a dedicated vocabulary, and compression options.',
  'solid-cockpit': 'Browser interface for Solid Pod data, access permissions, notifications, and SPARQL querying.',
  'ontology-companion-generator': 'Configurable npm generator for ontology documentation, exploration, and visualization websites.',
  'vcf-core-vocabulary': 'Converter-independent vocabulary and SHACL shapes for representing VCF 4.5 genomic variant data in RDF.',
};
export const focusedSoftware = Object.entries(softwareSummaries).map(([id, summary]) => {
  const result = softwareProjects.find((entry) => entry.id === id);
  if (!result) throw new Error(`Missing focused CV software: ${id}`);
  return { ...result, summary };
});

// Explicit selection requested by Elias. Newer papers must not displace these silently.
export const scopedPublicationIds = [
  'real-world-federation-iswc-2026',
  'genome-sharing-review-2026',
  'pengquin-eswc-2024',
  'urinary-coliphages-2023',
];
export function selectPublications(source: Publication[] = publications) {
  return scopedPublicationIds.map((id) => {
    const result = source.find((entry) => entry.id === id);
    if (!result) throw new Error(`Missing scoped CV publication: ${id}`);
    return id === 'pengquin-eswc-2024' ? { ...result, type: 'PhD Symposium Paper' } : result;
  });
}

// Public GitHub repository metadata checked 2026-09-08. `lastActivity` is pushed_at,
// not the release date. Newer dates from the site's release updater also feed the PDF.
// Active means non-archived and activity within 180 days; older activity is labelled
// "No recent activity" rather than claiming the project has been discontinued.
export const softwareActivity: Record<string, { lastActivity: string; archived: boolean; source: string }> = {
  'vcf-rdfizer': { lastActivity: '2026-09-05', archived: false, source: 'https://api.github.com/repos/ecrum19/VCF-RDFizer' },
  'solid-cockpit': { lastActivity: '2026-08-25', archived: false, source: 'https://api.github.com/repos/KNowledgeOnWebScale/solid-cockpit' },
  'ontology-companion-generator': { lastActivity: '2026-09-01', archived: false, source: 'https://api.github.com/repos/ecrum19/ocg' },
  'qr-code-generator': { lastActivity: '2026-08-04', archived: false, source: 'https://api.github.com/repos/ecrum19/qr-code-generator' },
};
