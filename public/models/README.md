# 3D Model Storage Structure

This directory contains the organized structure for storing 3D models, textures, and related assets for the XTRACT Studio customization platform.

## Directory Structure

```
public/
├── models/
│   ├── glass-plastic-containers/
│   │   ├── child-resistant-jars/
│   │   ├── child-resistant-bottles/
│   │   ├── pet-containers/
│   │   └── preroll-tubes/
│   └── apparel-clothing/
│       ├── tshirts/
│       ├── polos/
│       ├── hoodies/
│       └── hats/
├── textures/
│   ├── materials/
│   │   ├── plastic/
│   │   ├── metal/
│   │   ├── glass/
│   │   ├── fabric/
│   │   ├── leather/
│   │   └── wood/
│   └── user-uploads/
│       ├── materials/
│       └── logos/
└── images/
    ├── products/
    │   ├── glass-plastic-containers/
    │   └── apparel-clothing/
    └── thumbnails/
        ├── glass-plastic-containers/
        └── apparel-clothing/
```

## File Naming Conventions

### 3D Models
- **Format**: `.glb` (preferred) or `.gltf`
- **Naming**: `{product-id}-{variant}.glb`
- **Examples**:
  - `child-resistant-jar-small.glb`
  - `child-resistant-jar-medium.glb`
  - `tshirt-basic-crew.glb`
  - `hoodie-pullover-standard.glb`

### Textures
- **Format**: `.jpg`, `.png`, `.webp`
- **Resolution**: 1024x1024 or 2048x2048 (power of 2)
- **Naming**: `{material-type}-{variant}-{map-type}.jpg`
- **Examples**:
  - `plastic-white-diffuse.jpg`
  - `fabric-cotton-normal.jpg`
  - `metal-aluminum-roughness.jpg`

### Product Images
- **Format**: `.jpg`, `.png`, `.webp`
- **Resolution**: 512x512 for thumbnails, 1024x1024 for products
- **Naming**: `{product-id}-{view}.jpg`
- **Examples**:
  - `child-resistant-jar-front.jpg`
  - `tshirt-basic-crew-front.jpg`

## Model Requirements

### Technical Specifications
- **File Size**: Maximum 10MB per model
- **Polygon Count**: 
  - Low detail: 1,000-5,000 triangles
  - Medium detail: 5,000-15,000 triangles
  - High detail: 15,000-50,000 triangles
- **UV Mapping**: Required for texture application
- **Materials**: PBR (Physically Based Rendering) preferred

### Model Preparation Checklist
- [ ] Model is properly scaled (real-world units)
- [ ] UV coordinates are unwrapped and non-overlapping
- [ ] Normals are correctly oriented
- [ ] Model is centered at origin (0,0,0)
- [ ] Unnecessary vertices/faces removed
- [ ] Materials are properly assigned
- [ ] Textures are embedded or referenced correctly

## Texture Maps Supported

### PBR Material Maps
1. **Diffuse/Albedo** - Base color information
2. **Normal** - Surface detail and bumps
3. **Roughness** - Surface roughness/smoothness
4. **Metallic** - Metallic vs non-metallic surfaces
5. **Ambient Occlusion** - Self-shadowing details
6. **Emission** - Self-illuminating areas

### File Organization
```
textures/materials/plastic/
├── plastic-white-diffuse.jpg
├── plastic-white-normal.jpg
├── plastic-white-roughness.jpg
├── plastic-white-metallic.jpg
└── plastic-white-ao.jpg
```

## Upload Guidelines

### For Glass & Plastic Containers
- Focus on accurate geometry for threading, caps, and seals
- Include separate materials for different components
- Ensure proper transparency for glass materials
- Consider different size variants

### For Apparel & Clothing
- Model should be in T-pose or A-pose
- Include proper seam lines for printing areas
- Consider fabric draping and realistic proportions
- Separate materials for different fabric areas

## Integration with Studio

### Model Loading
Models are loaded dynamically based on product selection:
```typescript
const modelPath = `/models/${category}/${productId}/${variant}.glb`;
```

### Texture Application
Textures are applied through the customization interface:
```typescript
const texturePath = `/textures/materials/${materialType}/${variant}-diffuse.jpg`;
```

### Logo Placement
User-uploaded logos are stored in:
```
textures/user-uploads/logos/{user-session-id}/{logo-filename}
```

## Performance Optimization

### Model Optimization
- Use Draco compression for geometry
- Optimize texture sizes based on usage
- Implement LOD (Level of Detail) for complex models
- Use instancing for repeated elements

### Loading Strategy
- Preload commonly used models
- Implement progressive loading for large models
- Use texture streaming for high-resolution materials
- Cache models in browser storage

## Quality Assurance

### Testing Checklist
- [ ] Model loads without errors
- [ ] Textures apply correctly
- [ ] Materials respond to lighting
- [ ] Model scales appropriately
- [ ] Performance meets requirements
- [ ] Cross-browser compatibility verified

## Support

For questions about model preparation or upload issues:
- Check model against requirements checklist
- Verify file formats and naming conventions
- Test model in a 3D viewer before upload
- Contact development team for technical support
