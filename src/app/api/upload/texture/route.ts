import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { modelManager } from '@/lib/modelManager';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('texture') as File;
    const materialType = formData.get('materialType') as string;
    const variant = formData.get('variant') as string;
    const mapType = formData.get('mapType') as string; // diffuse, normal, roughness, etc.

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!materialType || !variant || !mapType) {
      return NextResponse.json(
        { error: 'Missing required fields: materialType, variant, mapType' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = modelManager.validateTextureFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'File validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Create directory structure
    const uploadDir = join(process.cwd(), 'public', 'textures', 'materials', materialType);
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${variant}-${mapType}.jpg`;
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const texturePath = modelManager.generateTexturePath(materialType, variant, mapType);

    return NextResponse.json({
      success: true,
      message: 'Texture uploaded successfully',
      path: texturePath,
      metadata: {
        materialType,
        variant,
        mapType,
        fileName,
        fileSize: file.size,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Texture upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Texture upload endpoint',
    supported_formats: ['.jpg', '.png', '.webp'],
    max_size: '5MB',
    map_types: ['diffuse', 'normal', 'roughness', 'metallic', 'ao', 'emission'],
    required_fields: ['texture', 'materialType', 'variant', 'mapType']
  });
}
