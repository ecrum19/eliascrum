import assert from 'node:assert/strict';
import { before, test } from 'node:test';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { PDFDocument } from 'pdf-lib';
import { activityLabel, generateCv, loadCvContent, siteLink } from '../build-cv.mjs';
import { CvPdf, normalizeText } from './render.mjs';

let content;
let documents;
const normalized = (text) => normalizeText(text).replace(/\s/g, '');

before(async () => {
  content = await loadCvContent();
  const outputs = await generateCv({ date: new Date('2026-09-08T00:00:00Z'), siteUrl: 'https://example.org/research/' });
  documents = {};
  for (const output of outputs) {
    const loadingTask = getDocument({ data: output.bytes.slice(), useSystemFonts: true, isEvalSupported: false });
    const pdf = await loadingTask.promise;
    const pages = [];
    const links = [];
    for (let index = 1; index <= pdf.numPages; index++) {
      const page = await pdf.getPage(index);
      const text = await page.getTextContent();
      pages.push(normalized(text.items.map((item) => item.str ?? '').join(' ')));
      links.push(...(await page.getAnnotations()).map((annotation) => annotation.url).filter(Boolean));
      for (const item of text.items.filter((item) => item.str?.trim())) {
        assert.ok(item.transform[4] >= 39, `Text crosses left margin: ${item.str}`);
        assert.ok(item.transform[4] + item.width <= 556.5, `Text crosses right margin: ${item.str}`);
        assert.ok(item.transform[5] >= 18, `Text crosses bottom margin: ${item.str}`);
      }
    }
    documents[output.id] = { ...output, pages, text: pages.join(''), links };
    await loadingTask.destroy();
  }
});

test('complete CV contains every CV record, detail, and artifact label', () => {
  const { text } = documents.complete;
  for (const section of content.cvSections) {
    assert.ok(text.includes(normalized(section.title)), section.title);
    for (const item of section.items) {
      for (const value of [item.role, item.organization, item.date, item.location, item.group?.toUpperCase()].filter(Boolean)) {
        assert.ok(text.includes(normalized(value)), `Missing CV field: ${value}`);
      }
      for (const detail of item.details ?? []) {
        const value = typeof detail === 'string' ? detail : detail.text;
        assert.ok(text.includes(normalized(value)), `Missing detail: ${value}`);
      }
      for (const artifact of item.artifacts ?? []) assert.ok(text.includes(normalized(artifact.label)), artifact.label);
    }
  }
});

test('complete CV includes every publication, software project, talk, and poster', () => {
  const { text } = documents.complete;
  for (const publication of content.publications) {
    for (const field of ['title', 'authors', 'venue', 'type']) assert.ok(text.includes(normalized(publication[field])), publication[field]);
    const status = publication.details.find((detail) => detail.label === 'Status')?.value;
    if (status) assert.ok(text.includes(normalized(status)), `Missing publication status: ${status}`);
  }
  for (const item of [...content.softwareProjects, ...content.talks, ...content.posters]) {
    const title = item.displayTitle ?? item.title;
    assert.ok(text.includes(normalized(title)), title);
  }
});

test('focused CV stays at two readable pages with relevant experience and current publications', () => {
  const { pages, text } = documents.focused;
  assert.equal(pages.length, 2);
  for (const title of ['Profile', 'Technical Skills', 'Research & Clinical Experience', 'Education']) assert.ok(pages[0].includes(normalized(title)), title);
  for (const title of ['Selected Software & Semantic Resources', 'Selected Publications', 'Fellowship & Selected Awards', 'Teaching & Communication']) assert.ok(pages[1].includes(normalized(title)), title);
  for (const item of content.selectPublications()) assert.ok(text.includes(normalized(item.title)), item.title);
  for (const publication of content.selectPublications()) {
    const status = publication.details.find((detail) => detail.label === 'Status')?.value;
    if (status) assert.ok(text.includes(normalized(status)), `Missing selected publication status: ${status}`);
  }
  assert.ok(text.includes(normalized('Doctor of Computer Science Engineering (in progress)')));
  assert.ok(text.includes('MedicalScribe'));
  assert.ok(!text.includes('IntramuralSportsOfficial'));
  assert.ok(!text.includes('DeltaSigmaPhiFraternity'));
});

test('PDF links retain mailto, DOI, repository, and subpath-aware site destinations', () => {
  for (const doc of Object.values(documents)) {
    assert.ok(doc.links.includes('mailto:elias.crum@ugent.be'));
    assert.ok(doc.links.some((url) => url.startsWith('https://doi.org/')));
    assert.ok(doc.links.some((url) => url.startsWith('https://example.org/research/')));
    assert.ok(doc.links.every((url) => /^(https?:|mailto:)/.test(url)));
    assert.ok(!doc.links.some((url) => url.startsWith('https://example.org/publications/')));
  }
  assert.equal(siteLink('/cv/artifacts/example.pdf', 'https://example.org/research/'), 'https://example.org/research/cv/artifacts/example.pdf');
  assert.throws(() => siteLink('javascript:alert(1)', 'https://example.org/'));
});

test('PDFs carry document metadata and remain small static downloads', async () => {
  for (const output of Object.values(documents)) {
    const pdf = await PDFDocument.load(output.bytes);
    assert.equal(pdf.getAuthor(), content.cvProfile.name);
    assert.ok(pdf.getTitle().includes(output.title));
    assert.ok(output.bytes.length < 500_000, 'CV should remain a small, fast static download');
  }
});

test('the requested scoped publication selection survives newer additions', () => {
  const latest = { ...content.publications[0], id: 'new-relevant-paper', sortDate: '2027-01-01' };
  assert.deepEqual(content.selectPublications([...content.publications, latest]).map((entry) => entry.id), content.scopedPublicationIds);
  assert.ok(documents.focused.text.includes(normalized('Coliphages of the human urinary microbiota')));
  assert.ok(documents.focused.text.includes(normalized('PhD Symposium Paper')));
  assert.ok(!documents.focused.text.includes(normalized('From VCF to RDF: RML-Based Conversion Approaches')));
  assert.ok(!documents.focused.text.includes(normalized('Solid Cockpit: Data manager, privacy editor')));
});

test('scoped copy, printed URLs, software replacement, and award descriptions are present', () => {
  const { text, pages, links, filename } = documents.focused;
  assert.equal(filename, 'elias-crum-scoped-cv.pdf');
  for (const phrase of ['direct clinical care support', 'Programming/Querying Languages', 'SHACL', 'ODRL',
    'genetic engineering and phage virulence augmentation', 'Directly assisted physician care of patients',
    'Double Major: Bioinformatics & Biology', 'VCF-Core Vocabulary']) assert.ok(text.includes(normalized(phrase)), phrase);
  assert.ok(!pages[0].includes('10.1371/journal.pone.0283930'), 'Remove the research-entry publication line');
  assert.ok(!text.includes(normalized('Federated Query Results Explorer')));
  assert.ok(!text.includes(normalized('QR Code Generator')));
  assert.ok(!links.some((link) => link.includes('qr-code-generator')));
  assert.ok(links.includes('https://github.com/ecrum19/vcf-core-vocabulary'));
  for (const entry of content.focusedSoftware) assert.ok(text.includes(normalized(`(${entry.repositoryUrl.replace('https://', '')})`)), entry.title);
  for (const description of Object.values(content.awardDescriptions)) assert.ok(text.includes(normalized(description)), description);
  assert.ok(pages[1].includes(normalized('For full interactive publication list, project links, talks, and a complete CV please visit my website: https://ecrum19.github.io/eliascrum/about/cv')), 'Closing statement and exact website URL must be readable when printed');
  assert.ok(links.includes('https://ecrum19.github.io/eliascrum/about/cv'), 'Closing statement must link to the requested CV page');
  assert.ok(!pages[1].includes(normalized('Full publication list, project links, talks, and complete CV:')));
  assert.ok(links.some((link) => link.includes('swat4hcls-2026-poster-paper.pdf')), 'VCF software paper link');
  assert.ok(links.some((link) => link.includes('eswc-2026-demo-paper.pdf')), 'Solid Cockpit paper link');
});

test('both PDF headlines use the requested word order', () => {
  for (const { pages } of Object.values(documents)) {
    assert.ok(pages[0].includes(normalized('COMPUTER SCIENCE ENGINEERING PHD CANDIDATE')));
    assert.ok(!pages[0].includes(normalized('PHD CANDIDATE IN COMPUTER SCIENCE ENGINEERING')));
  }
});

test('contact icons and section rules align to visible text centers', async () => {
  const doc = await CvPdf.create({ name: content.cvProfile.name, label: 'Test CV', date: new Date('2026-09-08'), siteUrl: 'https://eliascrum.github.io/eliascrum/', focused: true });
  const contacts = [];
  const icons = [];
  const originalText = doc.text.bind(doc);
  doc.text = (value, x, top, options) => {
    if (options?.href) contacts.push({ value, top, size: options.size });
    originalText(value, x, top, options);
  };
  const originalIcon = doc.contactIcon.bind(doc);
  doc.contactIcon = (kind, x, centerY, size) => {
    icons.push({ kind, centerY });
    originalIcon(kind, x, centerY, size);
  };
  doc.header(content.cvProfile, content.cvProfile.contacts);
  assert.equal(contacts.length, 4);
  assert.equal(icons.length, 4);
  for (const [index, contact] of contacts.entries()) {
    assert.ok(Math.abs(doc.textCenterY(contact.value, contact.top, contact.size) - icons[index].centerY) < 0.001);
    assert.equal(icons[index].centerY, icons[0].centerY);
  }
  const rules = [];
  doc.page.drawLine = (options) => rules.push(options);
  for (const title of ['Profile', 'Technical Skills', 'Research & Clinical Experience', 'Education']) {
    const expectedY = doc.textCenterY(title, doc.y + 5, 16, 'bold');
    doc.heading(title);
    assert.equal(rules.at(-1).start.y, expectedY);
    assert.equal(rules.at(-1).end.y, expectedY);
  }
});

test('paragraph spacing reserves a visible gap before the closing statement', async () => {
  const doc = await CvPdf.create({ name: 'Test', label: 'Test CV', date: new Date('2026-09-08'), siteUrl: 'https://example.org/', focused: true });
  const positions = [];
  doc.text = (value, x, top) => positions.push(top);
  const plain = doc.paragraph('Closing statement', { size: 9, gap: 0 });
  const separated = doc.paragraph('Closing statement', { size: 9, gap: 0, spaceBefore: 10 });
  assert.equal(separated.height - plain.height, 10);
  plain.draw(100);
  separated.draw(100);
  assert.deepEqual(positions, [100, 110]);
});

test('software activity reflects recent updates without inferring discontinuation', () => {
  const entry = { id: 'example' };
  const data = { softwareActivity: { example: { lastActivity: '2026-09-01', archived: false } }, softwareReleasesBySoftwareId: {} };
  assert.equal(activityLabel(entry, data, new Date('2026-09-08')), 'Active · updated Sept 2026');
  assert.equal(activityLabel(entry, data, new Date('2027-09-08')), 'No recent activity · updated Sept 2026');
  data.softwareActivity.example.archived = true;
  assert.equal(activityLabel(entry, data, new Date('2026-09-08')), 'Archived · updated Sept 2026');
});
