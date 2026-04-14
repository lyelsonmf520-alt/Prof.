import pdfParse from 'pdf-parse'

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer)
    return data.text?.trim() || 'PDF carregado mas sem texto extraível.'
  } catch (err) {
    throw new Error('Falha ao processar PDF: ' + (err instanceof Error ? err.message : String(err)))
  }
}
