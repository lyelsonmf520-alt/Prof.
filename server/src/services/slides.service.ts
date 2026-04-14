import PptxGenJS from 'pptxgenjs'

interface SlideItem {
  title: string
  bullets: string[]
  speakerNotes: string
  imagePrompt: string
  layout: 'title' | 'content' | 'image_text' | 'closing'
}

const PRIMARY = '4F46E5'
const PRIMARY_DARK = '3730A3'
const WHITE = 'FFFFFF'
const LIGHT_BG = 'F8FAFF'
const TEXT_DARK = '1E293B'
const TEXT_MUTED = '64748B'

export async function generatePPTX(slides: SlideItem[], topic: string): Promise<Buffer> {
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_WIDE'
  pptx.author = 'Prof. Raposo'
  pptx.title = topic

  // Define slide master
  pptx.defineSlideMaster({
    title: 'MASTER_SLIDE',
    background: { color: WHITE },
    objects: [
      // Bottom accent bar
      { rect: { x: 0, y: '92%', w: '100%', h: '8%', fill: { color: PRIMARY } } },
      // Footer text
      {
        text: {
          text: 'Prof. Raposo — Assistente Educacional com IA',
          options: {
            x: 0.3,
            y: 6.8,
            w: 8,
            h: 0.3,
            fontSize: 8,
            color: WHITE,
            fontFace: 'Calibri',
          },
        },
      },
    ],
  })

  for (const [i, slide] of slides.entries()) {
    const s = pptx.addSlide()

    if (slide.layout === 'title' || i === 0) {
      // Title slide
      s.background = { color: PRIMARY }

      s.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: '100%', h: '100%',
        fill: { color: PRIMARY_DARK },
      })

      s.addText(slide.title, {
        x: 0.8, y: 1.8, w: 8.4, h: 1.5,
        fontSize: 36,
        bold: true,
        color: WHITE,
        fontFace: 'Calibri',
        align: 'center',
      })

      if (slide.bullets.length > 0) {
        s.addText(slide.bullets[0], {
          x: 1, y: 3.6, w: 8, h: 0.8,
          fontSize: 18,
          color: 'C7D2FE',
          fontFace: 'Calibri',
          align: 'center',
        })
      }

      s.addText(`Prof. Raposo IA`, {
        x: 1, y: 5.8, w: 8, h: 0.4,
        fontSize: 11,
        color: 'A5B4FC',
        fontFace: 'Calibri',
        align: 'center',
      })
    } else if (slide.layout === 'closing') {
      // Closing slide
      s.background = { color: PRIMARY }

      s.addText(slide.title, {
        x: 0.8, y: 2.2, w: 8.4, h: 1.2,
        fontSize: 32,
        bold: true,
        color: WHITE,
        fontFace: 'Calibri',
        align: 'center',
      })

      if (slide.bullets.length > 0) {
        const bulletsText = slide.bullets.map((b) => ({ text: b, options: {} }))
        s.addText(bulletsText, {
          x: 1.5, y: 3.6, w: 7, h: 2,
          fontSize: 14,
          color: 'C7D2FE',
          fontFace: 'Calibri',
          align: 'center',
          bullet: true,
        })
      }
    } else {
      // Content slide (standard)
      s.background = { color: LIGHT_BG }

      // Title bar
      s.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: '100%', h: 1.1,
        fill: { color: PRIMARY },
      })

      s.addText(slide.title, {
        x: 0.4, y: 0.1, w: 9.2, h: 0.9,
        fontSize: 22,
        bold: true,
        color: WHITE,
        fontFace: 'Calibri',
        valign: 'middle',
      })

      // Slide number
      s.addText(`${i + 1}`, {
        x: 9.2, y: 0.1, w: 0.6, h: 0.9,
        fontSize: 11,
        color: 'A5B4FC',
        fontFace: 'Calibri',
        align: 'right',
        valign: 'middle',
      })

      // Bullet content
      if (slide.bullets.length > 0) {
        const bulletsText = slide.bullets.map((b) => ({
          text: b,
          options: { bullet: { indent: 15 } },
        }))

        s.addText(bulletsText, {
          x: 0.5,
          y: 1.3,
          w: slide.layout === 'image_text' ? 5 : 9,
          h: 4.8,
          fontSize: 15,
          color: TEXT_DARK,
          fontFace: 'Calibri',
          valign: 'top',
          lineSpacingMultiple: 1.4,
          bullet: { type: 'bullet', indent: 20 },
        })
      }

      // Image placeholder for image_text layout
      if (slide.layout === 'image_text') {
        s.addShape(pptx.ShapeType.rect, {
          x: 5.8, y: 1.3, w: 3.8, h: 4.5,
          fill: { color: 'E0E7FF' },
          line: { color: 'C7D2FE', width: 1 },
        })

        s.addText('🖼️\n' + (slide.imagePrompt || 'Imagem ilustrativa'), {
          x: 5.8, y: 2.5, w: 3.8, h: 2,
          fontSize: 10,
          color: TEXT_MUTED,
          align: 'center',
          fontFace: 'Calibri',
        })
      }
    }

    // Speaker notes
    if (slide.speakerNotes) {
      s.addNotes(slide.speakerNotes)
    }
  }

  const buffer = await pptx.write({ outputType: 'nodebuffer' }) as Buffer
  return buffer
}
