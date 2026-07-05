import { Document, Paragraph, TextRun, AlignmentType, Packer, Tab, TabStopType, TabStopPosition, ImageRun } from 'docx';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { resolve } from 'path';

const GERB_PATH = resolve('src', 'assets', 'gerb.png');

const FONT = 'Times New Roman';
const FONT_SIZE = 28;
const LINE_SPACING = 360;

const PAGE_MARGINS = {
  top: 567,
  right: 454,
  bottom: 454,
  left: 1134,
};

const SPDelimiter = ' || ';

function isAllCaps(s: string): boolean {
  const letters = s.replace(/[^a-zA-Z\u0400-\u04FF\u0500-\u052Fʻ'ʼ`‘’]/g, '');
  if (letters.length < 3) return false;
  return letters === letters.toUpperCase();
}

function hasSignature(s: string): boolean {
  return s.includes('__________') || /^Imzo/i.test(s.trim()) || /^Direktor/i.test(s.trim());
}

type AlignmentValue = (typeof AlignmentType)[keyof typeof AlignmentType];

interface SimpleLine {
  type: 'simple';
  text: string;
  alignment: AlignmentValue;
  bold: boolean;
  fontSize?: number;
}

interface SplitLine {
  type: 'split';
  leftText: string;
  rightText: string;
  rightFontSize?: number;
}

type ParsedLine = SimpleLine | SplitLine;

function buildHeaderParagraphs(school?: { name: string; address?: string | null; phone?: string | null }): Paragraph[] {
  const result: Paragraph[] = [];

  let gerbBuffer: Buffer | null = null;
  try {
    gerbBuffer = readFileSync(GERB_PATH);
  } catch {
    // Gerb image not found — skip image
  }

  if (gerbBuffer) {
    const imgRun = new ImageRun({
      data: gerbBuffer,
      transformation: {
        width: 76,
        height: 78,
      },
    });
    result.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: LINE_SPACING, before: 0, after: 120 },
      children: [imgRun],
    }));
  }

  const headerLines: { text: string; bold: boolean }[] = [
    { text: "O'ZBEKISTON RESPUBLIKASI MAKTABGACHA VA MAKTAB TA'LIMI VAZIRLIGI", bold: true },
  ];

  if (school?.name) {
    headerLines.push({ text: school.name.toUpperCase(), bold: true });
  }

  for (const hl of headerLines) {
    result.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: LINE_SPACING, before: 0, after: 0 },
      children: [new TextRun({ text: hl.text, font: FONT, size: FONT_SIZE, bold: hl.bold })],
    }));
  }

  return result;
}

function parseRenderedText(text: string): ParsedLine[] {
  const lines = text.split('\n');
  const result: ParsedLine[] = [];
  let isFirstContentLine = true;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      result.push({ type: 'simple', text: '', alignment: AlignmentType.LEFT, bold: false });
      continue;
    }

    if (isFirstContentLine && isAllCaps(line)) {
      isFirstContentLine = false;
      result.push({
        type: 'simple',
        text: line,
        alignment: AlignmentType.CENTER,
        bold: true,
      });
      continue;
    }
    isFirstContentLine = false;

    if (line.includes(SPDelimiter)) {
      const idx = line.indexOf(SPDelimiter);
      const leftText = line.substring(0, idx).trim();
      const rightText = line.substring(idx + SPDelimiter.length).trim();
      result.push({ type: 'split', leftText, rightText, rightFontSize: 24 });
      continue;
    }

    if (isAllCaps(line)) {
      result.push({ type: 'simple', text: line, alignment: AlignmentType.CENTER, bold: true });
      continue;
    }

    if (hasSignature(line)) {
      result.push({ type: 'simple', text: line, alignment: AlignmentType.RIGHT, bold: false });
      continue;
    }

    result.push({ type: 'simple', text: line, alignment: AlignmentType.JUSTIFIED, bold: false });
  }

  return result;
}

export function generateOutputFilename(shablonType: string, userName: string): string {
  const date = new Date();
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const dateStr = `${dd}${mm}${yyyy}`;
  const name = userName
    .toLowerCase()
    .replace(/[ʻ'ʼ`‘’]/g, '')
    .replace(/\s+/g, '_');
  return `${shablonType}_${name}_${dateStr}.docx`;
}

export async function generateDocx(
  renderedText: string,
  outputPath: string,
  school?: { name: string; address?: string | null; phone?: string | null },
): Promise<void> {
  const headerParagraphs = buildHeaderParagraphs(school);
  const parsedBody = parseRenderedText(renderedText);

  const bodyParagraphs = parsedBody.map(p => {
    if (p.type === 'simple') {
      const runs: TextRun[] = [];
      if (p.text) {
        runs.push(new TextRun({
          text: p.text,
          font: FONT,
          size: p.fontSize ?? FONT_SIZE,
          bold: p.bold,
        }));
      }
      return new Paragraph({
        alignment: p.alignment,
        spacing: {
          line: LINE_SPACING,
          before: p.text ? 0 : 60,
          after: p.text ? 60 : 0,
        },
        children: runs,
      });
    }

    const splitRuns: (TextRun | Tab)[] = [
      new TextRun({ text: p.leftText, font: FONT, size: FONT_SIZE }),
      new Tab(),
    ];
    if (p.rightText) {
      splitRuns.push(new TextRun({
        text: p.rightText,
        font: FONT,
        size: p.rightFontSize ?? FONT_SIZE,
      }));
    }
    return new Paragraph({
      alignment: AlignmentType.LEFT,
      tabStops: [
        {
          type: TabStopType.RIGHT,
          position: TabStopPosition.MAX,
        },
      ],
      spacing: {
        line: LINE_SPACING,
        before: 0,
        after: 60,
      },
      children: splitRuns,
    });
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: PAGE_MARGINS,
        },
      },
      children: [...headerParagraphs, ...bodyParagraphs],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  writeFileSync(outputPath, buffer);
}

export function ensureOutputDir(dirPath: string): void {
  mkdirSync(dirPath, { recursive: true });
}
