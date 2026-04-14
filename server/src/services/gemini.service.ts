import { GoogleGenAI } from '@google/genai'
import type { Response } from 'express'

const apiKey = process.env.GEMINI_API_KEY || ''
const ai = new GoogleGenAI({ apiKey })
const MODEL = 'gemini-2.0-flash'

/** Stream text generation to Express response using SSE */
export async function streamGenerateText(
  prompt: string,
  res: Response
): Promise<void> {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    const response = await ai.models.generateContentStream({
      model: MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    })

    for await (const chunk of response) {
      const text = chunk.text
      if (text) {
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

/** Generate JSON response (for slides) */
export async function generateJSON<T>(prompt: string): Promise<T> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
    },
  })

  const text = response.text
  if (!text) throw new Error('Empty response from Gemini')
  return JSON.parse(text) as T
}

/** Describe an image using Gemini Vision */
export async function describeImage(imageBase64: string, mimeType: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: { data: imageBase64, mimeType },
          },
          {
            text: 'Descreva em detalhes o conteúdo desta imagem em português. Identifique conceitos, textos, diagramas ou informações relevantes para uso em material didático.',
          },
        ],
      },
    ],
  })

  return response.text || 'Imagem carregada com sucesso.'
}
