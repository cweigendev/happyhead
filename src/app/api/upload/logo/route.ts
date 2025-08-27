import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('logo') as File;
    const sessionId = formData.get('sessionId') as string || 'default';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, WebP, and SVG are allowed.' },
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

    // In serverless environment, we can't save files to local filesystem
    // For now, we'll return an error suggesting to use the artwork generation feature instead
    return NextResponse.json({
      error: 'File upload not supported in serverless environment',
      suggestion: 'Use the AI artwork generation feature instead',
      alternative: 'Generate logos with text prompts like "company logo with text" using the "Generate" button'
    }, { status: 501 });

  } catch (error) {
    console.error('Logo upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Logo upload endpoint',
    supported_formats: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    max_size: '5MB',
    required_fields: ['logo', 'sessionId (optional)']
  });
}
