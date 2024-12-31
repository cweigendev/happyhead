'use server'

import { performOCR } from '../utils/ocr'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function processImages(formData: FormData) {
  try {
    const files = formData.getAll('files') as File[]
    const results: { filename: string; text: string }[] = []
    
    // Process each image
    for (const file of files) {
      const text = await performOCR(file)
      results.push({
        filename: file.name,
        text
      })
    }
    
    // Create output text
    const output = results.map(result => (
      `File: ${result.filename}\n` +
      `----------------------------------------\n` +
      `${result.text}\n\n`
    )).join('\n')
    
    // Generate timestamp for unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const outputPath = path.join(process.cwd(), 'public', 'ocr-results', `ocr-result-${timestamp}.txt`)
    
    await writeFile(outputPath, output, 'utf-8')
    
    return {
      success: true,
      filePath: `/ocr-results/ocr-result-${timestamp}.txt`,
      results
    }
  } catch (error) {
    console.error('OCR Processing Error:', error)
    return {
      success: false,
      error: 'Failed to process images'
    }
  }
}

