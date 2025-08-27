import { NextRequest, NextResponse } from 'next/server';
import { SaveProjectRequest, SaveProjectResponse } from '@/lib/projectManager';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 API: Received save project request');

    const body: SaveProjectRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.modelState || !body.layerState || !body.selectedProduct) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // For now, we'll return success since the actual saving will be handled client-side
    // In the future, this could save to a database
    const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('✅ API: Project save validated successfully');

    const response: SaveProjectResponse = {
      success: true,
      projectId
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ API: Error saving project:', error);
    
    const response: SaveProjectResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };

    return NextResponse.json(response, { status: 500 });
  }
}
