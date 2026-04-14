import Anthropic from '@anthropic-ai/sdk'
import type { Response } from 'express'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' })
const MODEL = 'claude-opus-4-6'

/** Stream text generation to Express response using SSE */
export async function streamGenerateText(
  prompt: string,
  res: Response
): Promise<void> {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 8192,
      thinking: { type: 'adaptive' },
      messages: [{ role: 'user', content: prompt }],
    })

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        // Escape newlines in SSE data field
        const text = event.delta.text.replace(/\n/g, '\u2028')
        res.write(`data: ${text}\n\n`)
      }
    }

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI generation failed'
    res.write(`data: Erro: ${message}\n\n`)
    res.write('data: [DONE]\n\n')
    res.end()
  }
}

/** Generate JSON response (e.g. slides structure) */
export async function generateJSON<T>(prompt: string): Promise<T> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8192,
    thinking: { type: 'adaptive' },
    messages: [
      {
        role: 'user',
        content:
          prompt +
          '\n\nResponda APENAS com JSON válido, sem markdown, sem explicações. Não inclua ```json ou ``` ao redor.',
      },
    ],
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Empty response from Claude')
  }

  // Strip markdown code fences if present
  const raw = textBlock.text.trim()
  const jsonStr = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()

  return JSON.parse(jsonStr) as T
}

/** Describe an image using Claude Vision */
export async function describeImage(
  imageBase64: string,
  mimeType: string
): Promise<string> {
  const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const safeMime = validMimeTypes.includes(mimeType)
    ? (mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp')
    : 'image/jpeg'

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: safeMime,
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: 'Descreva em detalhes o conteúdo desta imagem em português. Identifique conceitos, textos, diagramas ou informações relevantes para uso em material didático.',
          },
        ],
      },
    ],
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  return textBlock?.type === 'text' ? textBlock.text : 'Imagem carregada com sucesso.'
}
