import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('artwork') as File;
    const sessionId = formData.get('sessionId') as string || 'default';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Generate filename and path for Vercel Blob Storage
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const fileName = `artwork_${timestamp}.${extension}`;
    const blobPath = `textures/user-uploads/artwork/${sessionId}/${fileName}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();

    // Upload to Vercel Blob Storage
    console.log('☁️ Uploading artwork to Vercel Blob Storage:', blobPath);
    const blob = await put(blobPath, bytes, {
      access: 'public',
      contentType: file.type,
    });

    console.log('✅ Artwork uploaded successfully:', blob.url);

    return NextResponse.json({
      success: true,
      message: 'Artwork uploaded successfully',
      url: blob.url,
      fileName: fileName,
      originalName: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      storage: {
        provider: 'vercel-blob',
        path: blobPath
      }
    });

  } catch (error) {
    console.error('Artwork upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Artwork upload endpoint',
    supported_formats: ['image/jpeg', 'image/png', 'image/webp'],
    max_size: '5MB',
    required_fields: ['artwork', 'sessionId (optional)']
  });
}
