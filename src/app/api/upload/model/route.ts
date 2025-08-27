import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { modelManager } from '@/lib/modelManager';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('model') as File;
    const categoryId = formData.get('categoryId') as string;
    const subcategoryId = formData.get('subcategoryId') as string;
    const modelId = formData.get('modelId') as string;
    const modelName = formData.get('modelName') as string;
    const description = formData.get('description') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = modelManager.validateModelFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'File validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Create directory structure
    const uploadDir = join(process.cwd(), 'public', 'models', categoryId, subcategoryId);
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadDir, `${modelId}.glb`);
    await writeFile(filePath, buffer);

    // Create model metadata
    const metadata = {
      id: modelId,
      name: modelName,
      description: description,
      category: categoryId,
      subcategory: subcategoryId,
      file: `${modelId}.glb`,
      thumbnail: `/images/thumbnails/${categoryId}/${modelId}.jpg`,
      specifications: {},
      customization_areas: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      file_size: file.size
    };

    return NextResponse.json({
      success: true,
      message: 'Model uploaded successfully',
      metadata: metadata,
      path: modelManager.generateModelPath(categoryId, subcategoryId, modelId)
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Model upload endpoint',
    supported_formats: ['.glb', '.gltf'],
    max_size: '10MB',
    required_fields: ['model', 'categoryId', 'subcategoryId', 'modelId', 'modelName', 'description']
  });
}
