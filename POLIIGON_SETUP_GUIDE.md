# Poliigon PBR Materials Setup Guide

## 🎯 Overview
This guide will help you integrate your high-resolution Poliigon textures into the XTRACT Studio for applying to specific parts of your 3D models.

## 📁 Directory Structure

Your Poliigon textures should be organized in the following structure:

```
public/textures/materials/poliigon/
├── materials.json          # Material definitions
├── wood/
│   ├── Wood001_2K_Color.jpg
│   ├── Wood001_2K_Normal.jpg
│   ├── Wood001_2K_Roughness.jpg
│   ├── Wood001_2K_Displacement.jpg
│   └── Wood001_2K_AO.jpg
├── metal/
│   ├── Metal001_2K_Color.jpg
│   ├── Metal001_2K_Normal.jpg
│   ├── Metal001_2K_Roughness.jpg
│   ├── Metal001_2K_Metallic.jpg
│   └── Metal001_2K_AO.jpg
└── fabric/
    ├── Fabric001_2K_Color.jpg
    ├── Fabric001_2K_Normal.jpg
    ├── Fabric001_2K_Roughness.jpg
    └── Fabric001_2K_AO.jpg
```

## 🔧 Adding Your Poliigon Materials

### Step 1: Copy Your Textures
1. Create subdirectories in `/public/textures/materials/poliigon/` for each material category
2. Copy your Poliigon texture files into the appropriate subdirectories
3. Ensure file names match Poliigon's naming convention

### Step 2: Update materials.json
Edit `/public/textures/materials/poliigon/materials.json` and add your materials:

```json
{
  "version": "1.0.0",
  "description": "High-quality PBR materials from Poliigon",
  "materials": [
    {
      "id": "wood-oak-001",
      "name": "Premium Oak Wood",
      "category": "wood",
      "description": "High-quality oak wood with realistic grain",
      "resolution": "2K",
      "maps": {
        "diffuse": "/textures/materials/poliigon/wood/Wood001_2K_Color.jpg",
        "normal": "/textures/materials/poliigon/wood/Wood001_2K_Normal.jpg",
        "roughness": "/textures/materials/poliigon/wood/Wood001_2K_Roughness.jpg",
        "displacement": "/textures/materials/poliigon/wood/Wood001_2K_Displacement.jpg",
        "ao": "/textures/materials/poliigon/wood/Wood001_2K_AO.jpg"
      },
      "properties": {
        "roughness": 0.8,
        "metallic": 0.0,
        "transparency": 0.0,
        "displacementScale": 0.1,
        "normalScale": 1.0
      },
      "tiling": {
        "repeatU": 1.0,
        "repeatV": 1.0
      },
      "targetParts": ["top", "middle", "base", "all"]
    }
  ]
}
```

### Step 3: Material Properties Guide

#### Common Poliigon Map Types:
- **Color/Diffuse**: `*_Color.jpg` - Base color information
- **Normal**: `*_Normal.jpg` - Surface detail and bumps
- **Roughness**: `*_Roughness.jpg` - Surface roughness/smoothness
- **Metallic**: `*_Metallic.jpg` - Metallic vs non-metallic areas
- **Displacement**: `*_Displacement.jpg` - Height information for geometry displacement
- **AO (Ambient Occlusion)**: `*_AO.jpg` - Self-shadowing details

#### Material Property Values:
- **Wood**: `roughness: 0.7-0.9`, `metallic: 0.0`
- **Metal**: `roughness: 0.1-0.4`, `metallic: 1.0`
- **Fabric**: `roughness: 0.8-0.95`, `metallic: 0.0`
- **Plastic**: `roughness: 0.2-0.6`, `metallic: 0.0`
- **Concrete**: `roughness: 0.8-0.95`, `metallic: 0.0`

## 🎨 Using Materials in the Studio

### Accessing PBR Materials:
1. **Select a product** from the left sidebar
2. **Open the bottom panel** (customization area)
3. **Click the "PBR Materials" tab** (🧱 icon)
4. **Choose your target part**: Top/Cap, Middle/Body, Base/Bottom, or All Parts
5. **Filter by category** if needed (Wood, Metal, Fabric, etc.)
6. **Click on a material** to apply it

### Material Application:
- Materials are applied as **layers** in the layer management system
- Each material creates a new layer that can be toggled on/off
- Materials can be applied to specific parts of the model
- Multiple materials can be layered (last applied takes precedence)

## 🔧 Advanced Configuration

### Custom Tiling:
Adjust the `tiling` values to control texture repetition:
```json
"tiling": {
  "repeatU": 2.0,  // Horizontal repetition
  "repeatV": 2.0   // Vertical repetition
}
```

### Displacement Settings:
For materials with displacement maps:
```json
"properties": {
  "displacementScale": 0.05,  // Lower values for subtle displacement
  "normalScale": 1.5          // Higher values for more pronounced normals
}
```

### Part Targeting:
Control which parts can use the material:
```json
"targetParts": ["top", "middle", "base", "all"]
```

## 🚀 Performance Tips

1. **Use appropriate resolutions**: 2K for most cases, 4K for hero shots
2. **Optimize file sizes**: Use compressed JPG for color maps, PNG for normal maps
3. **Consider texture streaming**: Large textures may take time to load
4. **Test on target devices**: Ensure performance on intended hardware

## 🐛 Troubleshooting

### Material Not Appearing:
- Check file paths in `materials.json` are correct
- Ensure texture files exist at specified locations
- Verify material ID is unique
- Check browser console for loading errors

### Poor Quality:
- Increase texture resolution if needed
- Adjust `normalScale` and `displacementScale` values
- Ensure proper gamma correction for diffuse maps

### Performance Issues:
- Reduce texture resolution
- Limit number of active materials
- Use texture compression

## 📝 Example Materials

Here are some example configurations for common Poliigon materials:

### Wood Material:
```json
{
  "id": "poliigon-wood-planks-001",
  "name": "Wood Planks",
  "category": "wood",
  "description": "Realistic wood planks with natural grain",
  "resolution": "2K",
  "maps": {
    "diffuse": "/textures/materials/poliigon/wood/WoodPlanks001_2K_Color.jpg",
    "normal": "/textures/materials/poliigon/wood/WoodPlanks001_2K_Normal.jpg",
    "roughness": "/textures/materials/poliigon/wood/WoodPlanks001_2K_Roughness.jpg",
    "ao": "/textures/materials/poliigon/wood/WoodPlanks001_2K_AO.jpg"
  },
  "properties": {
    "roughness": 0.85,
    "metallic": 0.0,
    "transparency": 0.0,
    "normalScale": 1.2
  },
  "tiling": {
    "repeatU": 1.0,
    "repeatV": 1.0
  },
  "targetParts": ["all"]
}
```

### Metal Material:
```json
{
  "id": "poliigon-metal-brushed-001",
  "name": "Brushed Metal",
  "category": "metal",
  "description": "Brushed aluminum with directional grain",
  "resolution": "2K",
  "maps": {
    "diffuse": "/textures/materials/poliigon/metal/MetalBrushed001_2K_Color.jpg",
    "normal": "/textures/materials/poliigon/metal/MetalBrushed001_2K_Normal.jpg",
    "roughness": "/textures/materials/poliigon/metal/MetalBrushed001_2K_Roughness.jpg",
    "metallic": "/textures/materials/poliigon/metal/MetalBrushed001_2K_Metallic.jpg"
  },
  "properties": {
    "roughness": 0.3,
    "metallic": 1.0,
    "transparency": 0.0,
    "normalScale": 0.8
  },
  "tiling": {
    "repeatU": 2.0,
    "repeatV": 2.0
  },
  "targetParts": ["top", "middle", "base"]
}
```

## 🎯 Next Steps

1. **Copy your Poliigon textures** to the appropriate directories
2. **Update the materials.json** file with your material definitions
3. **Test materials** in the studio interface
4. **Fine-tune properties** for optimal appearance
5. **Create material presets** for commonly used combinations

Your high-quality Poliigon materials will now be available in the PBR Materials tab, ready to apply to specific parts of your 3D models with full physically-based rendering!
