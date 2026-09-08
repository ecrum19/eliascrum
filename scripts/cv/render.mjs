import fs from 'node:fs/promises';
import { PDFDocument, PDFName, PDFString, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

const WIDTH = 595.28;
const HEIGHT = 841.89;
const MARGIN = 40;
const BOTTOM = 788;
const INK = rgb(0.20, 0.20, 0.20);
const MUTED = rgb(0.39, 0.39, 0.39);
const CORAL = rgb(0.81, 0.23, 0.19);

export function normalizeText(value) {
  return String(value ?? '').normalize('NFC').replace(/[\u2010-\u2015\u2212]/g, '-').replace(/\s+/g, ' ').trim();
}

// A measured layout: every text line is wrapped before drawing. Sections travel
// with their first entry; entries stay together instead of splitting across pages.
export class CvPdf {
  static async create({ name, label, date, siteUrl, focused = false }) {
    const pdf = await PDFDocument.create();
    pdf.registerFontkit(fontkit);
    pdf.setTitle(`${name} - ${label}`);
    pdf.setAuthor(name);
    pdf.setSubject('Clinical genomics, bioinformatics, and medical semantic web');
    pdf.setKeywords(['CV', 'RDF', 'SPARQL', 'Solid', 'Clinical Genomics', 'Bioinformatics']);
    pdf.setCreator('Elias Crum CV generator');
    pdf.setProducer('pdf-lib');
    pdf.setCreationDate(date);
    pdf.setModificationDate(date);
    pdf.catalog.set(PDFName.of('Lang'), PDFString.of('en-GB'));
    const fonts = {};
    const fontFaces = {};
    for (const [key, filename] of Object.entries({ regular: 'Regular', bold: 'Bold', italic: 'It', light: 'Light' })) {
      const bytes = await fs.readFile(new URL(`fonts/SourceSans3-${filename}.ttf`, import.meta.url));
      fonts[key] = await pdf.embedFont(bytes, { subset: true });
      fontFaces[key] = fontkit.create(bytes);
    }
    return new CvPdf(pdf, fonts, fontFaces, { name, label, date, siteUrl, focused });
  }

  constructor(pdf, fonts, fontFaces, options) {
    this.pdf = pdf;
    this.fonts = fonts;
    this.fontFaces = fontFaces;
    this.characterSets = Object.fromEntries(Object.entries(fonts).map(([key, font]) => [key, new Set(font.getCharacterSet())]));
    this.options = options;
    this.body = options.focused ? 10 : 9.6;
    this.leading = options.focused ? 12.2 : 12.1;
    this.headingHeight = options.focused ? 28 : 32;
    this.page = null;
    this.y = 0;
    this.headings = [];
    this.newPage();
  }

  newPage() {
    this.page = this.pdf.addPage([WIDTH, HEIGHT]);
    this.y = 43;
    if (this.pdf.getPageCount() > 1) {
      this.text(this.options.name, MARGIN, 28, { size: 9, font: 'bold', color: MUTED });
      this.text(this.options.label.toUpperCase(), WIDTH - MARGIN, 28, { size: 8, align: 'right', color: MUTED });
      this.y = 57;
    }
  }

  width(text, size = this.body, font = 'regular') {
    return this.fonts[font].widthOfTextAtSize(normalizeText(text), size);
  }

  // Center against visible glyphs, not the nominal font box or text baseline.
  textCenterY(value, top, size = this.body, font = 'regular') {
    const face = this.fontFaces[font];
    const { glyphs, positions } = face.layout(normalizeText(value));
    const bounds = glyphs.flatMap((glyph, index) => glyph.bbox.maxY > glyph.bbox.minY
      ? [glyph.bbox.minY + positions[index].yOffset, glyph.bbox.maxY + positions[index].yOffset]
      : []);
    const center = bounds.length ? (Math.min(...bounds) + Math.max(...bounds)) / 2 : 0;
    return HEIGHT - top - size + center * size / face.unitsPerEm;
  }

  wrap(text, width, size = this.body, font = 'regular') {
    const words = normalizeText(text).split(' ');
    const lines = [];
    let line = '';
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (this.width(candidate, size, font) <= width) {
        line = candidate;
        continue;
      }
      if (line) {
        lines.push(line);
        line = '';
      }
      // URLs and unusually long words must fit too; no font shrinking or clipping.
      for (const char of word) {
        if (this.width(line + char, size, font) > width) {
          lines.push(line);
          line = '';
        }
        line += char;
      }
    }
    if (line.trim()) lines.push(line.trim());
    return lines;
  }

  text(value, x, top, { size = this.body, font = 'regular', color = INK, align = 'left', href } = {}) {
    const text = normalizeText(value);
    const width = this.width(text, size, font);
    if (align === 'right') x -= width;
    if (align === 'center') x -= width / 2;
    if (x < MARGIN - 0.1 || x + width > WIDTH - MARGIN + 0.1 || top < 0 || top + size > HEIGHT - 18) {
      throw new Error(`CV text outside printable area: ${text}`);
    }
    // Fail visibly on missing glyphs rather than silently dropping accented names.
    const supported = this.characterSets[font];
    for (const char of text) {
      if (!supported.has(char.codePointAt(0))) throw new Error(`Missing font glyph: ${char} in ${text}`);
    }
    const y = HEIGHT - top - size;
    this.page.drawText(text, { x, y, size, font: this.fonts[font], color });
    if (href) {
      const link = this.pdf.context.obj({
        Type: 'Annot', Subtype: 'Link', Rect: [x, y - 2, x + width, y + size],
        Border: [0, 0, 0], A: { Type: 'Action', S: 'URI', URI: PDFString.of(href) },
      });
      this.page.node.addAnnot(this.pdf.context.register(link));
    }
  }

  paragraph(text, options = {}) {
    const { indent = 0, size = this.body, font = 'regular', gap = 2, spaceBefore = 0, bullet = false, ...style } = options;
    const leading = size === this.body ? this.leading : size * 1.27;
    const x = MARGIN + indent + (bullet ? 9 : 0);
    const lines = this.wrap(text, WIDTH - MARGIN - x, size, font);
    return {
      height: spaceBefore + lines.length * leading + gap,
      draw: (y) => {
        y += spaceBefore;
        if (bullet) this.text('•', MARGIN + indent, y, { size });
        lines.forEach((line, index) => this.text(line, x, y + index * leading, { ...style, size, font }));
      },
    };
  }

  inline(parts, { gap = 2, leading = this.leading } = {}) {
    const lines = [[]];
    let used = 0;
    for (const part of parts) {
      const size = part.size ?? this.body;
      const font = part.font ?? 'regular';
      const tokens = part.text.split(/(\s+)/).filter(Boolean);
      for (const token of tokens) {
        const whitespace = /^\s+$/.test(token);
        const value = whitespace ? ' ' : normalizeText(token);
        const width = this.fonts[font].widthOfTextAtSize(value, size);
        if (used + width > WIDTH - 2 * MARGIN) { lines.push([]); used = 0; }
        if (whitespace && !used) continue;
        if (width > WIDTH - 2 * MARGIN) {
          const fragments = this.wrap(value, WIDTH - 2 * MARGIN, size, font);
          fragments.forEach((fragment, index) => {
            if (index) { lines.push([]); used = 0; }
            lines.at(-1).push({ ...part, text: fragment, size, font, offset: used });
            used += this.width(fragment, size, font);
          });
        } else {
          lines.at(-1).push({ ...part, text: value, size, font, offset: used });
          used += width;
        }
      }
    }
    return { height: lines.length * leading + gap, draw: (y) => {
      lines.forEach((line, index) => line.forEach(({ text, offset, ...options }) => {
        if (text.trim()) this.text(text, MARGIN + offset, y + index * leading, options);
      }));
    } };
  }

  row(left, right = '', { font = 'bold', size = this.body + 0.6, mutedRight = false, href, gap = 2 } = {}) {
    const rightSize = this.body - 0.5;
    const rightWidth = right ? this.width(right, rightSize, 'italic') + 22 : 0;
    const lines = this.wrap(left, WIDTH - MARGIN * 2 - rightWidth, size, font);
    const leading = size * 1.23;
    return {
      height: lines.length * leading + gap,
      draw: (y) => {
        lines.forEach((line, index) => this.text(line, MARGIN, y + index * leading, { font, size, href }));
        if (right) this.text(right, WIDTH - MARGIN, y + 1, { size: rightSize, font: 'italic', color: mutedRight ? MUTED : CORAL, align: 'right' });
      },
    };
  }

  block(parts, gap = this.options.focused ? 5 : 7) {
    return { height: parts.reduce((total, part) => total + part.height, gap), draw: (y) => {
      for (const part of parts) { part.draw(y); y += part.height; }
    } };
  }

  add(block) {
    if (block.height > BOTTOM - 57) throw new Error('CV entry is too long for one page; edit its content or layout.');
    if (this.y + block.height > BOTTOM) {
      this.newPage();
      if (this.activeSection) this.heading(`${this.activeSection} (continued)`);
      if (this.y + block.height > BOTTOM) throw new Error('CV entry is too long to fit below its section heading.');
    }
    block.draw(this.y);
    this.y += block.height;
  }

  section(title, blocks) {
    if (!blocks.length) return;
    const headingHeight = this.headingHeight;
    if (this.y + headingHeight + blocks[0].height > BOTTOM) this.newPage();
    this.headings.push({ title, page: this.pdf.getPageCount(), y: this.y });
    this.activeSection = title;
    this.heading(title);
    blocks.forEach((block) => this.add(block));
  }

  heading(title) {
    this.text(title, MARGIN, this.y + 5, { size: 16, font: 'bold' });
    const lineStart = MARGIN + this.width(title, 16, 'bold') + 6;
    const centerY = this.textCenterY(title, this.y + 5, 16, 'bold');
    if (lineStart < WIDTH - MARGIN) this.page.drawLine({ start: { x: lineStart, y: centerY }, end: { x: WIDTH - MARGIN, y: centerY }, thickness: 0.55, color: MUTED });
    this.y += this.headingHeight;
  }

  header(profile, contacts) {
    const nameParts = profile.name.split(' ');
    const surname = nameParts.pop();
    const first = `${nameParts.join(' ')} `;
    const nameSize = 35;
    const start = (WIDTH - this.width(first, nameSize, 'light') - this.width(surname, nameSize, 'bold') - 6) / 2;
    this.text(first, start, 22, { size: nameSize, font: 'light' });
    this.text(surname, start + this.width(first, nameSize, 'light') + 6, 22, { size: nameSize, font: 'bold' });
    const headline = 'Computer Science Engineering PhD Candidate · Bioinformatician';
    this.text(headline.toUpperCase(), WIDTH / 2, 66, { size: 8.7, color: CORAL, align: 'center' });
    this.text(profile.address, WIDTH / 2, 80, { size: 9, color: MUTED, font: 'italic', align: 'center' });
    const allContacts = [...contacts, { label: 'Website', value: this.options.siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''), href: this.options.siteUrl }];
    const size = 7.5;
    const gap = 10;
    const iconSpace = 11;
    const total = allContacts.reduce((sum, item) => sum + this.width(item.value, size) + iconSpace, 0) + gap * (allContacts.length - 1);
    if (total > WIDTH - 2 * MARGIN) throw new Error('Contact row is too wide; shorten a display URL.');
    let x = (WIDTH - total) / 2;
    const centerY = this.textCenterY(allContacts[0].value, 97, size);
    for (const contact of allContacts) {
      const top = 97 + this.textCenterY(contact.value, 97, size) - centerY;
      this.contactIcon(contact.label, x, centerY, 7.5);
      this.text(contact.value, x + iconSpace, top, { size, href: contact.href });
      x += this.width(contact.value, size) + iconSpace + gap;
    }
    this.y = 117;
  }

  // Tiny vector marks stay sharp in print without a remote icon font dependency.
  contactIcon(kind, x, centerY, size) {
    const y = centerY - size / 2;
    const line = (x1, y1, x2, y2) => this.page.drawLine({ start: { x: x + x1 * size, y: y + y1 * size }, end: { x: x + x2 * size, y: y + y2 * size }, thickness: 0.55, color: CORAL });
    if (kind === 'Email') {
      this.page.drawRectangle({ x, y: y + size * 0.14, width: size, height: size * 0.72, borderWidth: 0.55, borderColor: CORAL });
      line(0, 0.86, 0.5, 0.46); line(0.5, 0.46, 1, 0.86);
    } else if (kind === 'LinkedIn') {
      this.page.drawRectangle({ x, y, width: size, height: size, color: CORAL });
      this.page.drawText('in', { x: x + 1, y: y + 1, size: 6, font: this.fonts.bold, color: rgb(1, 1, 1) });
    } else if (kind === 'GitHub') {
      line(0.25, 0.15, 0.25, 0.85); line(0.25, 0.35, 0.8, 0.6); line(0.8, 0.6, 0.8, 0.85);
      for (const [cx, cy] of [[0.25, 0.15], [0.25, 0.85], [0.8, 0.85]]) this.page.drawCircle({ x: x + cx * size, y: y + cy * size, size: 1.15, color: CORAL });
    } else {
      this.page.drawCircle({ x: x + size / 2, y: y + size / 2, size: size / 2, borderWidth: 0.55, borderColor: CORAL });
      this.page.drawEllipse({ x: x + size / 2, y: y + size / 2, xScale: size * 0.2, yScale: size / 2, borderWidth: 0.45, borderColor: CORAL });
      line(0, 0.5, 1, 0.5);
    }
  }

  async save() {
    const count = this.pdf.getPageCount();
    if (this.options.focused && count > 2) throw new Error(`Focused CV is ${count} pages; shorten the curated content to stay within two pages.`);
    const date = this.options.date.toLocaleDateString('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' });
    this.pdf.getPages().forEach((page, index) => {
      this.page = page;
      this.text(`Updated ${date}`, MARGIN, 811, { size: 8, color: MUTED });
      this.text(`${this.options.name} · Curriculum Vitae`, WIDTH / 2, 811, { size: 8, color: MUTED, align: 'center' });
      this.text(`${index + 1} / ${count}`, WIDTH - MARGIN, 811, { size: 8, color: MUTED, align: 'right' });
    });
    return this.pdf.save();
  }
}
