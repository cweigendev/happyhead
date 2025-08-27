# Artwork and Logos Implementation Guide

## Overview

The Artwork and Logos sections have been re-implemented to provide comprehensive functionality for adding custom artwork and logos to 3D models. This implementation includes both predefined artwork options and user upload capabilities.

## Features

### Artwork Section
- **Predefined Artwork**: Sample artwork files (pattern, label, logo designs)
- **Custom Upload**: Upload custom artwork files (JPG, PNG, WebP, SVG)
- **Real-time Preview**: See artwork applied to the 3D model instantly
- **Layer Integration**: Add artwork as layers for complex compositions
- **Part-specific Application**: Apply artwork to specific model parts

### Logos Section
- **Custom Logo Upload**: Upload logo files with support for transparent backgrounds
- **Logo Positioning**: Multiple positioning options (center, corners, repeat)
- **Layer Support**: Add logos as separate layers
- **PNG Transparency**: Full support for transparent PNG logos
- **SVG Support**: Vector logo support for crisp scaling

## File Structure

```
V2/xtract-process/
├── src/
│   ├── components/studio/
│   │   └── BottomPanelClean.tsx          # Enhanced bottom panel with artwork/logos
│   │   └── ModelViewer.tsx               # Updated 3D model viewer with texture support
│   ├── app/api/upload/
│   │   ├── artwork/route.ts              # Artwork upload endpoint
│   │   └── logo/route.ts                 # Logo upload endpoint
│   └── lib/
│       └── layerManager.ts               # Layer management system
├── public/
│   ├── models/glass-plastic-containers/child-resistant-jars/artwork/
│   │   ├── pattern1.svg                  # Sample pattern artwork
│   │   ├── label1.svg                    # Sample label design
│   │   └── logo1.svg                     # Sample logo design
│   └── textures/user-uploads/
│       ├── artwork/                      # User uploaded artwork
│       └── logos/                        # User uploaded logos
└── scripts/
    └── create-sample-artwork.js          # Script to generate sample artwork
```

## Usage Instructions

### For Users

1. **Select a 3D Model**: Choose a model from the product catalog
2. **Open Customization**: Click on a model to open the customization interface
3. **Choose Target Part**: Select which part of the model to apply artwork/logos to
4. **Apply Artwork**:
   - Choose from predefined artwork options
   - Upload custom artwork files
   - See real-time preview on the 3D model
5. **Add Logos**:
   - Upload logo files (PNG with transparency recommended)
   - Choose positioning options
   - Apply to specific model parts
6. **Layer Management**:
   - Add artwork/logos as layers for complex designs
   - Reorder layers for different effects
   - Toggle layer visibility

### For Developers

#### Adding New Predefined Artwork

1. Add artwork files to the appropriate directory:
   ```
   public/models/{category}/{product}/artwork/
   ```

2. Update the predefined artwork array in `BottomPanelClean.tsx`:
   ```typescript
   const predefinedArtwork = [
     { id: 'new-artwork', name: 'New Design', url: '/path/to/artwork.svg' }
   ];
   ```

#### Customizing Upload Endpoints

The upload endpoints support the following file types:
- **Artwork**: JPG, PNG, WebP, SVG
- **Logos**: JPG, PNG, WebP, SVG (PNG with transparency recommended)

Maximum file size: 5MB

#### Extending Functionality

To add new features:

1. **New Positioning Options**: Update the logo positioning grid in `BottomPanelClean.tsx`
2. **Additional File Types**: Modify the `allowedTypes` array in upload routes
3. **Custom Filters**: Add image processing in the upload endpoints
4. **Advanced Layering**: Extend the layer manager for new layer types

## Technical Implementation

### Texture Loading
- Uses Three.js TextureLoader for efficient texture management
- Supports both raster (JPG, PNG, WebP) and vector (SVG) formats
- Implements proper texture wrapping and UV mapping

### Layer System
- Integrates with the existing layer management system
- Supports artwork and logo layers
- Maintains layer order and visibility states

### File Upload
- Secure file validation and sanitization
- Session-based file organization
- Automatic filename generation to prevent conflicts

### 3D Model Integration
- Real-time texture application to 3D models
- Part-specific targeting system
- Preview functionality before saving as layers

## API Endpoints

### POST /api/upload/artwork
Upload artwork files for use on 3D models.

**Request:**
- `artwork`: File (required)
- `sessionId`: String (optional)

**Response:**
```json
{
  "success": true,
  "url": "/textures/user-uploads/artwork/session/filename.jpg",
  "fileName": "artwork_timestamp.jpg",
  "originalName": "original.jpg",
  "size": 1024000,
  "uploadedAt": "2024-01-01T00:00:00.000Z"
}
```

### POST /api/upload/logo
Upload logo files for use on 3D models.

**Request:**
- `logo`: File (required)
- `sessionId`: String (optional)

**Response:**
```json
{
  "success": true,
  "url": "/textures/user-uploads/logos/session/filename.png",
  "fileName": "logo_timestamp.png",
  "originalName": "logo.png",
  "size": 512000,
  "uploadedAt": "2024-01-01T00:00:00.000Z",
  "type": "logo"
}
```

## Best Practices

### For Artwork
- Use power-of-2 dimensions (512x512, 1024x1024, 2048x2048)
- Optimize file sizes for web delivery
- Consider UV mapping when creating artwork
- Use appropriate file formats (PNG for transparency, JPG for photos)

### For Logos
- Use PNG format with transparent backgrounds
- Keep file sizes under 1MB for optimal performance
- Design logos to work at various scales
- Consider contrast against different background colors

### For Performance
- Implement texture caching for frequently used artwork
- Use appropriate texture compression
- Consider implementing progressive loading for large files
- Monitor memory usage with multiple textures loaded

## Troubleshooting

### Common Issues

1. **Artwork not appearing**: Check file format and ensure proper UV mapping
2. **Upload failures**: Verify file size limits and supported formats
3. **Performance issues**: Reduce texture sizes or implement texture compression
4. **Layer conflicts**: Check layer order and visibility settings

### Debug Information

Enable debug logging by setting:
```typescript
console.log('Texture loading:', textureUrl);
console.log('Layer state:', layerState);
```

## Future Enhancements

- Texture scaling and positioning controls
- Advanced blending modes for layers
- Batch upload functionality
- Artwork library management
- Integration with external design tools
- Real-time collaborative editing
