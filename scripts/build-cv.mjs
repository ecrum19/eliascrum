#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { CvPdf } from './cv/render.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));

export async function loadCvContent() {
  const result = await build({ entryPoints: [path.join(root, 'scripts/cv/content.ts')], bundle: true, platform: 'node', format: 'esm', write: false });
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
}

export function siteLink(value, siteUrl) {
  const url = new URL(value.replace(/^\/(?!\/)/, ''), siteUrl);
  if (!['https:', 'http:', 'mailto:'].includes(url.protocol)) throw new Error(`Unsupported CV link: ${value}`);
  return url.href;
}

export function publicationStatus(entry) {
  return entry.details.find((detail) => detail.label === 'Status')?.value;
}

export function activityLabel(entry, data, date) {
  const activity = data.softwareActivity[entry.id];
  const recordedDate = data.softwareReleasesBySoftwareId[entry.id]?.publishedAt?.slice(0, 10);
  const lastActivity = [activity?.lastActivity, recordedDate].filter(Boolean).sort().at(-1);
  if (!lastActivity) return 'Activity not recorded';
  const last = new Date(`${lastActivity}T00:00:00Z`);
  const month = last.toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });
  const recent = date.getTime() >= last.getTime() && date.getTime() - last.getTime() <= 180 * 86400000;
  const status = activity?.archived ? 'Archived' : recent ? 'Active' : 'No recent activity';
  return `${status} · updated ${month}`;
}

function publicationHref(entry) {
  const doi = entry.details.find((detail) => detail.label === 'DOI' && /^10\./.test(detail.value));
  return doi?.href || (doi ? `https://doi.org/${doi.value}` : entry.url || entry.paperPdfPath || `/publications/${entry.slug || entry.id}/paper`);
}

export async function generateCv({ date = new Date(), siteUrl = process.env.CV_SITE_URL ?? 'https://eliascrum.github.io/eliascrum/' } = {}) {
  if (!Number.isFinite(date.getTime())) throw new Error('Invalid CV generation date.');
  siteUrl = siteUrl.replace(/\/?$/, '/');
  if (!['https:', 'http:'].includes(new URL(siteUrl).protocol)) throw new Error('CV_SITE_URL must be an HTTP(S) URL.');
  const data = await loadCvContent();
  const absolute = (value) => siteLink(value, siteUrl);
  const results = [];

  for (const variant of data.cvDownloads) {
    const focused = variant.id === 'focused';
    const doc = await CvPdf.create({ name: data.cvProfile.name, label: variant.title, date, siteUrl, focused });
    doc.header(data.cvProfile, data.cvProfile.contacts);

    const detailBlock = (detail) => typeof detail === 'string'
      ? doc.paragraph(detail, { bullet: true })
      : doc.paragraph(`${detail.prefix ?? ''} ${detail.text}`, { bullet: true, href: absolute(detail.url) });
    const itemBlock = (item, { compact = false } = {}) => doc.block([
      doc.row(item.organization || item.role, item.location),
      ...(item.organization ? [doc.row(`${item.role}${item.role.startsWith('Doctor of') && /present/i.test(item.date ?? '') ? ' (in progress)' : ''}`, item.date, { font: 'regular', size: doc.body, mutedRight: true })] : item.date ? [doc.paragraph(item.date, { size: 9 })] : []),
      ...(compact && item.details?.length ? [doc.paragraph(item.details.map((detail) => typeof detail === 'string' ? detail : detail.text).join(' · '))] : (item.details ?? []).map(detailBlock)),
      ...(focused ? [] : (item.artifacts ?? []).map((artifact) => doc.paragraph(artifact.label, { size: 8.8, href: absolute(artifact.path) }))),
    ]);

    const awardBlock = (item) => focused ? doc.block([
      doc.inline([
        { text: `${item.role} (${item.date})`, font: 'bold' },
        { text: ` · ${item.organization}`, size: 9 },
      ]),
      doc.paragraph(data.awardDescriptions[item.role], { size: 9.5 }),
    ], 5) : doc.block([
      doc.row(item.role, item.date),
      doc.paragraph([item.organization, focused ? null : item.location].filter(Boolean).join(' · ')),
      ...(data.awardDescriptions[item.role] ? [doc.paragraph(data.awardDescriptions[item.role])] : []),
      ...(focused ? [] : (item.details ?? []).map(detailBlock)),
      ...(focused ? [] : (item.artifacts ?? []).map((artifact) => doc.paragraph(artifact.label, { size: 8.8, href: absolute(artifact.path) }))),
    ], focused ? 4 : 7);

    const skillBlock = (item) => doc.block([
      doc.paragraph(`${focused && item.role === 'Miscellaneous' ? 'Research tooling' : item.role}: ${(item.details ?? []).join(' ')}`, { gap: 1 }),
    ], 2);

    const publicationBlock = (entry) => {
      const doi = entry.details.find((detail) => detail.label === 'DOI' && /^10\./.test(detail.value));
      const href = absolute(doi?.href || (doi ? `https://doi.org/${doi.value}` : entry.url || `/publications/${entry.slug || entry.id}/paper`));
      const status = publicationStatus(entry);
      return doc.block([
        doc.paragraph(entry.title, { font: 'bold', href }),
        doc.paragraph(entry.authors, { size: focused ? 9 : 9.2 }),
        doc.paragraph(`${entry.venue} · ${entry.year} · ${entry.type}${status ? ` · ${status}` : ''}`, { font: 'italic', size: 9 }),
        ...(!focused && doi ? [doc.paragraph(`DOI: ${doi.value}`, { size: 8.8, href })] : []),
      ], focused ? 6 : 8);
    };

    const softwareBlock = (entry) => {
      const url = absolute(entry.repositoryUrl || entry.webUrl || `/software/${entry.slug || entry.id}`);
      const related = (entry.relatedPublicationIds ?? []).map((id) => {
        const publication = data.publications.find((item) => item.id === id);
        if (!publication) throw new Error(`Missing software publication: ${id}`);
        return publication;
      }).sort((a, b) => b.sortDate.localeCompare(a.sortDate));
      return doc.block([
        doc.inline([
          { text: entry.title, font: 'bold', href: url },
          { text: ` (${url.replace(/^https?:\/\//, '').replace(/\/$/, '')})`, size: 9, href: url },
        ]),
        doc.paragraph(entry.summary),
        doc.inline([
          { text: activityLabel(entry, data, date), size: 8.5, font: 'italic' },
          ...related.flatMap((paper, index) => [
            { text: index === 0 ? ' · Papers: ' : '; ', size: 8.5 },
            { text: `${paper.type === 'Preprint' ? paper.venue : paper.venueTags[0] || paper.venue} ${paper.year}`.replace(/(\d{4}) \1/g, '$1'), size: 8.5, href: absolute(publicationHref(paper)) },
          ]),
        ], { leading: 11, gap: 0 }),
        ...(!focused ? [doc.paragraph(entry.type, { font: 'italic', size: 9 }), ...[entry.webUrl].filter((link) => link && absolute(link) !== url).map((link) => doc.paragraph(link, { size: 8.5, href: absolute(link) }))] : []),
      ], focused ? 6 : 8);
    };

    const presentationBlock = (entry, kind) => doc.block([
      doc.row(entry.displayTitle, entry.displayDateLabel, { href: absolute(kind === 'talk' ? `/talks/${entry.slug}` : `/talks/posters/${entry.slug}`) }),
      doc.paragraph(entry.venueTags.join(' · '), { size: 9, font: 'italic' }),
      doc.paragraph(entry.summary),
      doc.paragraph(kind === 'talk' ? 'Presentation slides' : 'Poster', { size: 8.8, href: absolute(kind === 'talk' ? entry.slidePath : entry.path) }),
    ]);

    if (focused) {
      doc.section('Profile', [doc.paragraph(data.focusedSummary, { gap: 4 })]);
      doc.section('Technical Skills', data.focusedSkills.map(skillBlock));
      doc.section('Research & Clinical Experience', data.focusedExperience.map((item) => itemBlock(item)));
      doc.section('Education', data.focusedEducation.map((item) => itemBlock(item, { compact: true })));
      if (doc.pdf.getPageCount() !== 1) throw new Error('Focused CV page one overflowed; shorten profile, experience, or education.');
      doc.newPage();
      doc.section('Selected Software & Semantic Resources', data.focusedSoftware.map(softwareBlock));
      const selected = data.selectPublications();
      if (selected.length !== 4) throw new Error('Expected four relevant publications for the focused CV.');
      doc.section('Selected Publications', selected.map(publicationBlock));
      doc.section('Fellowship & Selected Awards', data.focusedAwards.map(awardBlock));
      doc.section('Teaching & Communication', [itemBlock({ ...data.focusedTeaching, details: data.focusedTeaching.details.slice(0, 1) })]);
      const cvPageUrl = 'https://ecrum19.github.io/eliascrum/about/cv';
      doc.add(doc.paragraph(`For full interactive publication list, project links, talks, and a complete CV please visit my website: ${cvPageUrl}`, { size: 9, href: cvPageUrl, spaceBefore: 10, gap: 0 }));
    } else {
      for (const section of data.cvSections) {
        let previousGroup;
        const blocks = section.items.map((item) => {
          const block = section.layout === 'skills' ? skillBlock(item) : section.layout === 'awards' ? awardBlock(item) : itemBlock(item);
          if (item.group && item.group !== previousGroup) {
            previousGroup = item.group;
            return doc.block([doc.paragraph(item.group.toUpperCase(), { font: 'bold', size: 9, gap: 5 }), block], 0);
          }
          return block;
        });
        doc.section(section.title, blocks);
      }
      doc.section('Publications', [...data.publications].sort((a, b) => b.sortDate.localeCompare(a.sortDate)).map(publicationBlock));
      doc.add(doc.paragraph(`ORCID: ${data.orcidProfileUrl.replace('https://orcid.org/', '')}`, { size: 9, href: data.orcidProfileUrl }));
      doc.section('Software & Semantic Resources', data.softwareProjects.map(softwareBlock));
      doc.section('Talks', [...data.talks].sort((a, b) => b.displayDateIso.localeCompare(a.displayDateIso)).map((entry) => presentationBlock(entry, 'talk')));
      doc.section('Posters', [...data.posters].sort((a, b) => b.displayDateIso.localeCompare(a.displayDateIso)).map((entry) => presentationBlock(entry, 'poster')));
    }
    const bytes = await doc.save();
    results.push({ ...variant, bytes, pages: doc.pdf.getPageCount(), headings: doc.headings });
  }
  return results;
}

async function main() {
  const date = process.env.SOURCE_DATE_EPOCH ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000) : new Date();
  // Generate and validate both documents before replacing either public artifact.
  const results = await generateCv({ date });
  for (const result of results) {
    const output = path.join(root, 'public', result.path.replace(/^\//, ''));
    await fs.mkdir(path.dirname(output), { recursive: true });
    const temporary = `${output}.tmp`;
    await fs.writeFile(temporary, result.bytes);
    await fs.rename(temporary, output);
    console.log(`Generated ${path.relative(root, output)} (${result.pages} pages)`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error); process.exitCode = 1; });
}
