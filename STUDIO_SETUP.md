# XTRACT Studio - Model Storage Structure

## 📁 Complete Directory Structure

```
V2/xtract-process/public/
├── models/                           # 3D Models Storage
│   ├── README.md                     # Comprehensive setup guide
│   ├── catalog.json                  # Master catalog index
│   ├── glass-plastic-containers/     # Container Products
│   │   ├── child-resistant-jars/
│   │   │   ├── models.json          # Product configurations
│   │   │   ├── child-resistant-jar-small.glb
│   │   │   ├── child-resistant-jar-medium.glb
│   │   │   └── child-resistant-jar-large.glb
│   │   ├── child-resistant-bottles/
│   │   ├── pet-containers/
│   │   └── preroll-tubes/
│   └── apparel-clothing/             # Apparel Products
│       ├── tshirts/
│       │   ├── models.json          # Product configurations
│       │   ├── tshirt-basic-crew.glb
│       │   ├── tshirt-v-neck.glb
│       │   └── tshirt-long-sleeve.glb
│       ├── polos/
│       ├── hoodies/
│       └── hats/
├── textures/                         # Texture & Material Storage
│   ├── materials/                    # Predefined Materials
│   │   ├── materials.json           # Material configurations
│   │   ├── plastic/
│   │   │   ├── plastic-white-diffuse.jpg
│   │   │   ├── plastic-white-normal.jpg
│   │   │   └── plastic-white-roughness.jpg
│   │   ├── metal/
│   │   ├── glass/
│   │   ├── fabric/
│   │   ├── leather/
│   │   └── wood/
│   ├── user-uploads/                 # User Custom Uploads
│   │   ├── materials/               # Custom textures
│   │   └── logos/                   # User logos
│   └── upload-guidelines.md         # Upload specifications
└── images/                          # Product Images
    ├── products/                    # High-res product images
    │   ├── glass-plastic-containers/
    │   └── apparel-clothing/
    └── thumbnails/                  # Thumbnail images
        ├── glass-plastic-containers/
        └── apparel-clothing/
```

## 🚀 Quick Start Guide

### 1. Upload Your First 3D Model

**Step 1**: Prepare your model
- Format: `.glb` or `.gltf`
- Size: Maximum 10MB
- Polygons: Under 50,000 triangles
- UV mapped for textures

**Step 2**: Choose category and subcategory
- Glass & Plastic Containers: `child-resistant-jars`, `child-resistant-bottles`, `pet-containers`, `preroll-tubes`
- Apparel & Clothing: `tshirts`, `polos`, `hoodies`, `hats`

**Step 3**: Upload via API
```bash
curl -X POST http://localhost:3000/api/upload/model \
  -F "model=@your-model.glb" \
  -F "categoryId=apparel-clothing" \
  -F "subcategoryId=tshirts" \
  -F "modelId=custom-tshirt-001" \
  -F "modelName=Custom T-Shirt Design" \
  -F "description=Premium cotton t-shirt with custom branding areas"
```

### 2. Upload Textures/Materials

**Step 1**: Prepare texture maps
- Diffuse (base color)
- Normal (surface details)
- Roughness (surface finish)
- Metallic (metallic properties)

**Step 2**: Upload each map
```bash
curl -X POST http://localhost:3000/api/upload/texture \
  -F "texture=@cotton-blue-diffuse.jpg" \
  -F "materialType=fabric" \
  -F "variant=cotton-blue" \
  -F "mapType=diffuse"
```

### 3. Add Product Images

**Thumbnails**: 512x512px for sidebar display
**Products**: 1024x1024px for detailed views

Place in:
- `/images/thumbnails/{category}/{product-id}.jpg`
- `/images/products/{category}/{product-id}.jpg`

## 🛠️ Technical Integration

### Model Loading in Studio
```typescript
import { modelManager } from '@/lib/modelManager';

// Load all models in a category
const models = await modelManager.getModelsByCategory('apparel-clothing', 'tshirts');

// Load specific model
const model = await modelManager.getModelById('tshirt-basic-crew');

// Get available materials
const materials = await modelManager.getMaterials();
```

### File Validation
```typescript
// Validate model file
const validation = modelManager.validateModelFile(file);
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}

// Validate texture file
const textureValidation = modelManager.validateTextureFile(textureFile);
```

## 📋 Upload Checklist

### For 3D Models:
- [ ] Model is in .glb or .gltf format
- [ ] File size under 10MB
- [ ] Polygon count under 50,000
- [ ] UV coordinates properly mapped
- [ ] Model centered at origin (0,0,0)
- [ ] Materials properly assigned
- [ ] Normals correctly oriented

### For Textures:
- [ ] Resolution is power of 2 (512, 1024, 2048)
- [ ] File size under 5MB
- [ ] Format is JPG, PNG, or WebP
- [ ] Proper naming convention followed
- [ ] Maps are in correct color space

### For Product Images:
- [ ] Thumbnails are 512x512px
- [ ] Product images are 1024x1024px
- [ ] Clean background (preferably transparent)
- [ ] Good lighting and composition
- [ ] Consistent style across products

## 🔧 Configuration Files

### models.json Structure
Each subcategory has a `models.json` file defining:
- Model metadata
- Customization areas
- Material properties
- Default colors
- Specifications

### materials.json Structure
Defines available materials with:
- Material variants
- Texture map paths
- PBR properties
- Categories

### catalog.json Structure
Master index containing:
- All categories and subcategories
- Model counts
- Configuration file paths
- Upload limits

## 🎯 Next Steps

1. **Upload your first model** using the API endpoints
2. **Add corresponding textures** for material customization
3. **Include product images** for better user experience
4. **Test in the studio** to ensure proper loading
5. **Update configuration files** as needed

## 📞 Support

- Check model requirements in `/models/README.md`
- Review texture guidelines in `/textures/upload-guidelines.md`
- Use the validation functions before uploading
- Test models in external 3D viewers first

The structure is now ready for you to upload and organize your 3D models for the XTRACT Studio customization platform!
