import { createWorker } from 'tesseract.js'

export async function performOCR(imageFile: File): Promise<string> {
  const worker = await createWorker()
  
  // Convert File to base64
  const buffer = await imageFile.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  const imageData = `data:${imageFile.type};base64,${base64}`
  
  await worker.loadLanguage('eng')
  await worker.initialize('eng')
  
  const { data: { text } } = await worker.recognize(imageData)
  
  await worker.terminate()
  
  return text
}

