import { NextRequest, NextResponse } from 'next/server';
import { fal } from "@fal-ai/client";

// Configure fal.ai client with API key
fal.config({
  credentials: process.env.FAL_KEY || "eebd09d1-8961-4f42-913b-514eecaf2bf7:c00d63092f7b7789d9843503633c5345"
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, sessionId } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'No prompt provided' },
        { status: 400 }
      );
    }

    // Create the system prompt for seamless tileable textures
    const systemPrompt = {
      "system_prompt": "Create a single seamless texture that can tile perfectly. Generate ONE texture square, not multiple tiles. The edges must wrap seamlessly when repeated.",
      "rules": [
        "Generate only ONE single texture image",
        "Never show the texture repeated or tiled",
        "Edges must connect perfectly to opposite edges",
        "No visible seams when pattern repeats",
        "Think: create the building block, not the wall"
      ],
      "transform_any_request_to": "seamless material texture",
      "user_prompt": prompt,
      "final_instruction": "Output: Single seamless texture square only. Test: if copied 4 times in grid, no seams visible."
    };

    // Create the enhanced prompt for seamless texture generation
    const enhancedPrompt = `${systemPrompt.system_prompt}

Rules:
${systemPrompt.rules.map(rule => `- ${rule}`).join('\n')}

Transform any request to: ${systemPrompt.transform_any_request_to}

User request: "${prompt}"

${systemPrompt.final_instruction}`;

    console.log('🎨 Generating artwork with prompt:', enhancedPrompt);

    // Generate image using fal.ai Imagen4
    const result = await fal.subscribe("fal-ai/imagen4/preview", {
      input: {
        prompt: enhancedPrompt,
        aspect_ratio: "1:1",
        num_images: 1
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log('🎨 Generation result:', result);

    if (!result.data || !result.data.images || result.data.images.length === 0) {
      return NextResponse.json(
        { error: 'No image generated' },
        { status: 500 }
      );
    }

    const generatedImageUrl = result.data.images[0].url;

    // For Vercel deployment, we'll return the direct URL from fal.ai
    // instead of trying to save to local filesystem (which doesn't work in serverless)
    const uploadSessionId = sessionId || `user-session-${Date.now()}`;
    const timestamp = Date.now();
    const fileName = `artwork_${timestamp}.png`;

    return NextResponse.json({
      success: true,
      message: 'Artwork generated successfully',
      url: generatedImageUrl, // Return the direct URL from fal.ai
      fileName: fileName,
      originalPrompt: prompt,
      enhancedPrompt: enhancedPrompt,
      seed: result.data.seed,
      generatedAt: new Date().toISOString(),
      sessionId: uploadSessionId,
      note: 'Image hosted by fal.ai - no local storage in serverless environment'
    });

  } catch (error) {
    console.error('Artwork generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate artwork', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
