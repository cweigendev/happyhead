# Troubleshooting glassjar2.glb Layer Detection

## Problem
The glassjar2.glb model is not recognizing its separate layers (base and top parts) for customization.

## Investigation Steps Taken

### 1. Enhanced Layer Detection Logic
- Updated `shouldModifyMesh()` function in `ModelViewer.tsx` with comprehensive mesh name detection
- Added support for common naming patterns:
  - Top/Cap: `top`, `cap`, `lid`, `cover`, `upper`, `head`, `cork`, `closure`, `stopper`
  - Glass-specific: `jar_top`, `jartop`, `jar.top`, `glass_top`, `glasstop`
  - Numeric patterns: `_001`, `001`, `cylinder.001`, `sphere.001`
  - Base/Bottom: `base`, `bottom`, `foundation`, `foot`, `lower`, `floor`
  - Glass-specific: `jar_base`, `jarbase`, `jar.base`, `glass_base`, `glassbase`
  - Numeric patterns: `_002`, `002`, `cylinder.002`, `sphere.002`
  - Fallback: Any mesh containing `jar` but not `top`/`cap`/`lid` → treated as base

### 2. Consistent Detection Across Components
- Updated `PartSelector.tsx` with the same enhanced detection logic
- Ensures consistent part identification in both main viewer and part selector

### 3. Debugging Tools Added
- Created `MeshDebugPanel.tsx` component that displays:
  - All mesh names found in the model
  - Detected part for each mesh
  - Mesh properties (type, vertex count, position)
  - Visual indicators for part types (green=top, orange=base, red=unknown)

### 4. Enhanced Model Configuration
- Updated `models.json` with explicit mesh mapping configuration
- Added `target_part` information for customization areas
- Documented mesh naming patterns and detection rules

## How to Use the Debug Panel

1. Load the glassjar2.glb model in the studio
2. The debug panel will appear in the top-left corner
3. Click to expand and see all detected meshes
4. Check if meshes are correctly identified as "top" or "base"
5. If meshes show as "unknown", the actual mesh names don't match our detection patterns

## Next Steps if Issue Persists

### Check Browser Console
Look for these debug messages when loading glassjar2.glb:
```
🔍 === GLASSJAR2.GLB MESH STRUCTURE DEBUG ===
📦 Scene children count: X
📦 Scene name: ...
Object: "mesh_name" (Mesh)
  └─ MESH #1
     ├─ Mesh Name: "actual_mesh_name"
     └─ 🎯 DETECTED AS: "part_type"
```

### Common Solutions

1. **If mesh names are completely different:**
   - Update the detection keywords in `shouldModifyMesh()` function
   - Add the actual mesh names to the appropriate detection logic

2. **If model has unusual structure:**
   - Check if meshes are nested in groups
   - Verify that meshes are actual `THREE.Mesh` objects

3. **If model was exported incorrectly:**
   - Re-export from Blender with proper mesh naming
   - Ensure separate objects for base and top
   - Apply transformations before export

### Model Export Guidelines
For future models, ensure:
- Base/body mesh contains keywords: `base`, `body`, `jar`, `main`, `container`
- Top/cap mesh contains keywords: `top`, `cap`, `lid`, `cover`, `upper`
- Use descriptive mesh names in Blender before export
- Keep meshes as separate objects, not merged

## Files Modified
- `src/components/studio/ModelViewer.tsx` - Enhanced mesh detection
- `src/components/studio/PartSelector.tsx` - Consistent detection logic  
- `src/components/studio/MeshDebugPanel.tsx` - New debugging component
- `public/models/glass-plastic-containers/child-resistant-glass-jar/models.json` - Enhanced configuration

## Testing
1. Open the studio with glassjar2.glb loaded
2. Check the debug panel to see detected parts
3. Try applying materials/colors to "top" and "base" parts separately
4. Verify that each part can be customized independently
