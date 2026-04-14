import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from 'pdf-lib'

// Brand colours (RGB 0-1)
const PRIMARY = rgb(0.31, 0.275, 0.898)   // #4F46E5
const PRIMARY_DARK = rgb(0.216, 0.188, 0.639) // #3730A3
const WHITE = rgb(1, 1, 1)
const TEXT_DARK = rgb(0.118, 0.161, 0.235) // #1E293B
const TEXT_MUTED = rgb(0.392, 0.455, 0.545) // #64748B
const ACCENT = rgb(0.863, 0.878, 1)        // #DCE1FF (light indigo)

const A4_W = 595.28
const A4_H = 841.89
const MARGIN = 50
const CONTENT_W = A4_W - MARGIN * 2

interface PdfSection {
  heading: string
  body: string
}

interface PdfInput {
  title: string
  subject?: string
  teacher?: string
  school?: string
  topic?: string
  classInfo?: string
  date?: string
  sections: PdfSection[]
}

function drawHeader(
  page: PDFPage,
  boldFont: PDFFont,
  regularFont: PDFFont,
  data: PdfInput
): void {
  const { title, teacher, subject, school, date } = data

  // Top bar background
  page.drawRectangle({
    x: 0,
    y: A4_H - 90,
    width: A4_W,
    height: 90,
    color: PRIMARY_DARK,
  })

  // Decorative accent strip
  page.drawRectangle({
    x: 0,
    y: A4_H - 94,
    width: A4_W,
    height: 4,
    color: PRIMARY,
  })

  // Title
  const titleSize = title.length > 50 ? 16 : 20
  page.drawText(title, {
    x: MARGIN,
    y: A4_H - 42,
    size: titleSize,
    font: boldFont,
    color: WHITE,
    maxWidth: CONTENT_W - 80,
  })

  // Meta info row
  const meta = [teacher, subject, school, date].filter(Boolean).join('  ·  ')
  if (meta) {
    page.drawText(meta, {
      x: MARGIN,
      y: A4_H - 70,
      size: 9,
      font: regularFont,
      color: rgb(0.8, 0.83, 1),
      maxWidth: CONTENT_W,
    })
  }
}

function drawFooter(
  page: PDFPage,
  regularFont: PDFFont,
  pageNum: number,
  totalPages: number
): void {
  // Footer bar
  page.drawRectangle({
    x: 0,
    y: 0,
    width: A4_W,
    height: 32,
    color: PRIMARY,
  })

  page.drawText('Prof. Raposo — Assistente Educacional com IA', {
    x: MARGIN,
    y: 10,
    size: 8,
    font: regularFont,
    color: ACCENT,
  })

  const pageLabel = `${pageNum} / ${totalPages}`
  page.drawText(pageLabel, {
    x: A4_W - MARGIN - 30,
    y: 10,
    size: 8,
    font: regularFont,
    color: ACCENT,
  })
}

function splitTextIntoLines(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number
): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const width = font.widthOfTextAtSize(testLine, fontSize)
    if (width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) lines.push(currentLine)
  return lines
}

export async function generateLessonPlanPDF(data: PdfInput): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()
  pdfDoc.setTitle(data.title)
  pdfDoc.setAuthor(data.teacher || 'Prof. Raposo')
  pdfDoc.setCreator('Prof. Raposo IA')

  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

  // We'll track pages and content position
  const pages: PDFPage[] = []

  function addPage(): PDFPage {
    const page = pdfDoc.addPage([A4_W, A4_H])
    pages.push(page)
    drawHeader(page, boldFont, regularFont, data)
    return page
  }

  let currentPage = addPage()
  let yPos = A4_H - 110 // below header

  function ensureSpace(needed: number): void {
    if (yPos - needed < 40) {
      currentPage = addPage()
      yPos = A4_H - 110
    }
  }

  // Topic banner (if provided)
  if (data.topic) {
    ensureSpace(36)
    currentPage.drawRectangle({
      x: MARGIN,
      y: yPos - 28,
      width: CONTENT_W,
      height: 28,
      color: ACCENT,
    })
    currentPage.drawText(`Tema: ${data.topic}`, {
      x: MARGIN + 10,
      y: yPos - 19,
      size: 11,
      font: boldFont,
      color: PRIMARY_DARK,
    })
    if (data.classInfo) {
      currentPage.drawText(data.classInfo, {
        x: A4_W - MARGIN - 120,
        y: yPos - 19,
        size: 10,
        font: regularFont,
        color: TEXT_MUTED,
      })
    }
    yPos -= 40
  }

  // Render each section
  for (const section of data.sections) {
    ensureSpace(50)

    // Section heading bar
    currentPage.drawRectangle({
      x: MARGIN,
      y: yPos - 22,
      width: CONTENT_W,
      height: 22,
      color: PRIMARY,
    })
    currentPage.drawText(section.heading.toUpperCase(), {
      x: MARGIN + 8,
      y: yPos - 15,
      size: 10,
      font: boldFont,
      color: WHITE,
    })
    yPos -= 30

    // Section body — split by newlines first, then word-wrap
    const paragraphs = section.body.split('\n').filter((l) => l.trim() !== '')
    const BODY_SIZE = 10.5
    const LINE_H = 16

    for (const para of paragraphs) {
      const isBullet = para.trim().startsWith('-') || para.trim().startsWith('•')
      const indent = isBullet ? 16 : 0
      const cleanPara = isBullet
        ? para.replace(/^[\s\-•]+/, '• ').trim()
        : para.trim()

      const lines = splitTextIntoLines(
        cleanPara,
        regularFont,
        BODY_SIZE,
        CONTENT_W - indent - 4
      )

      for (const line of lines) {
        ensureSpace(LINE_H)
        currentPage.drawText(line, {
          x: MARGIN + indent,
          y: yPos - BODY_SIZE,
          size: BODY_SIZE,
          font: regularFont,
          color: TEXT_DARK,
        })
        yPos -= LINE_H
      }
      yPos -= 4 // paragraph spacing
    }

    yPos -= 14 // section spacing
  }

  // Draw footers on all pages
  const totalPages = pages.length
  pages.forEach((p, i) => drawFooter(p, regularFont, i + 1, totalPages))

  const uint8Array = await pdfDoc.save()
  return Buffer.from(uint8Array)
}

/** Parse markdown-like content into sections for PDF generation */
export function parseContentToSections(
  content: string,
  title: string
): PdfSection[] {
  const lines = content.split('\n')
  const sections: PdfSection[] = []
  let currentHeading = title
  let currentBody: string[] = []

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)/)
    const h3 = line.match(/^###\s+(.+)/)

    if (h2 || h3) {
      if (currentBody.length > 0) {
        sections.push({ heading: currentHeading, body: currentBody.join('\n') })
        currentBody = []
      }
      currentHeading = (h2 || h3)![1].trim()
    } else {
      // Strip single # headings, keep content
      const cleaned = line.replace(/^#\s+/, '').replace(/\*\*/g, '').replace(/\*/g, '')
      currentBody.push(cleaned)
    }
  }

  if (currentBody.length > 0) {
    sections.push({ heading: currentHeading, body: currentBody.join('\n') })
  }

  return sections.filter((s) => s.body.trim().length > 0)
}
