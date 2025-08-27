# AI Artwork Generation Integration Guide

## Overview

The app now includes AI-powered artwork generation using Google's Imagen4 model via fal.ai. Users can generate custom seamless tileable textures by entering text prompts in the artwork section.

## Features

### AI Artwork Generation
- **Text-to-Image**: Generate artwork using natural language prompts
- **Seamless Textures**: All generated images are optimized for seamless tiling
- **Automatic Integration**: Generated artwork is automatically added to the artwork library
- **Layer Support**: Generated artwork is automatically applied as a layer to the 3D model

### Specialized Texture Generation
The system uses a specialized prompt enhancement system that:
- Ensures all generated images are seamlessly tileable
- Converts user requests into material texture patterns
- Optimizes for 3D surface application
- Maintains consistent lighting and pattern distribution

## Usage

### For Users

1. **Navigate to Studio**: Open the 3D customization studio
2. **Select Artwork Tab**: Click on the "Artwork" tab in the bottom panel
3. **Enter Prompt**: Type a description of the texture/pattern you want in the text input
4. **Generate**: Click the "Generate Artwork" button
5. **Wait for Generation**: The system will generate and automatically apply the artwork
6. **Use Generated Artwork**: The artwork appears in your artwork library and is applied to the model

### Example Prompts

Good prompts for texture generation:
- "Vintage leather texture with natural grain"
- "Abstract geometric pattern in blue and gold"
- "Wood grain with cherry finish"
- "Marble surface with white and gray veining"
- "Fabric texture with woven pattern"
- "Metal surface with brushed steel finish"

## Technical Implementation

### API Endpoint
- **Route**: `/api/generate/artwork`
- **Method**: POST
- **Input**: `{ prompt: string, sessionId?: string }`
- **Output**: Generated image URL and metadata

### System Prompt Enhancement
The system automatically enhances user prompts with specific instructions for:
- Seamless tiling requirements
- Material texture optimization
- Edge matching and pattern continuity
- Uniform lighting distribution

### File Management
- Generated images are saved to `public/textures/user-uploads/artwork/`
- Files are organized by session ID
- Automatic filename generation prevents conflicts
- Images are saved as PNG format for quality

### Integration Points
- **BottomPanelClean.tsx**: UI for prompt input and generation trigger
- **LayerManager**: Automatic layer creation for generated artwork
- **ModelViewer**: Real-time application to 3D models

## Configuration

### Environment Variables
Set `FAL_KEY` in your environment or `.env.local`:
```
FAL_KEY=your_fal_ai_api_key_here
```

### API Key
The system uses the provided fal.ai API key:
`eebd09d1-8961-4f42-913b-514eecaf2bf7:c00d63092f7b7789d9843503633c5345`

## Error Handling

The system includes comprehensive error handling for:
- Invalid prompts
- API failures
- Network issues
- File system errors
- Image download failures

Users receive clear feedback through the UI with appropriate error messages.

## Performance Considerations

- **Generation Time**: Typical generation takes 10-30 seconds
- **Image Size**: Generated images are optimized for web delivery
- **Caching**: Consider implementing caching for frequently generated patterns
- **Rate Limiting**: Be mindful of API rate limits for high-volume usage

## Future Enhancements

Potential improvements:
- **Style Presets**: Predefined style options (realistic, abstract, vintage, etc.)
- **Aspect Ratio Options**: Support for different image dimensions
- **Batch Generation**: Generate multiple variations at once
- **History**: Save and reuse previous prompts
- **Advanced Controls**: Fine-tune generation parameters

## Troubleshooting

### Common Issues

1. **Generation Fails**
   - Check API key configuration
   - Verify network connectivity
   - Ensure prompt is not empty

2. **Image Not Appearing**
   - Check file permissions in upload directory
   - Verify public URL generation
   - Check browser console for errors

3. **Poor Quality Results**
   - Refine prompt with more specific descriptions
   - Use material/texture-focused language
   - Avoid complex scene descriptions

### Debug Information

Enable debug logging by checking the browser console and server logs for:
- Generation requests and responses
- File save operations
- Layer creation events
- Error messages and stack traces
