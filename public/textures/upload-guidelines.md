# Texture Upload Guidelines

## Supported Formats
- **Images**: JPG, PNG, WebP
- **Resolution**: 512x512, 1024x1024, 2048x2048 (power of 2)
- **File Size**: Maximum 5MB per texture

## PBR Material Maps

### Required Maps
1. **Diffuse/Albedo** - Base color information
2. **Normal** - Surface detail and bumps

### Optional Maps
3. **Roughness** - Surface roughness/smoothness
4. **Metallic** - Metallic vs non-metallic surfaces
5. **Ambient Occlusion** - Self-shadowing details
6. **Emission** - Self-illuminating areas

## Naming Convention
- `{material-name}-{variant}-{map-type}.{extension}`
- Examples:
  - `plastic-white-diffuse.jpg`
  - `fabric-cotton-normal.png`
  - `metal-aluminum-roughness.jpg`

## Quality Requirements
- High contrast for normal maps
- Proper gamma correction for diffuse maps
- Linear color space for roughness/metallic maps
- Seamless tiling for repeating patterns

## Upload Process
1. Prepare textures according to guidelines
2. Name files using convention above
3. Upload to appropriate material folder
4. Update materials.json configuration
5. Test in 3D viewer before publishing
