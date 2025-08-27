# Product Switching Fix Implementation

## Problem
When switching between products in the studio, model sizing and customization state (layers, colors, artwork, materials) were carrying over from the previous product, causing a confusing user experience where the new product would appear with the wrong scale and previous customizations applied.

## Solution Overview
Implemented a comprehensive backend refresh system that automatically resets all product-specific state when switching between products. The solution includes:

1. **Product-Specific State Management**
2. **Automatic State Reset on Product Switch**
3. **Clean Initialization for New Products**
4. **Prevention of Unnecessary Resets**

## Components Modified

### 1. LayerManager (`/src/lib/layerManager.ts`)
**Changes:**
- Added `currentProductId` tracking
- Added `switchToProduct()` method to handle product switches
- Added `resetForProductSwitch()` for force resets
- Only clears layers when switching to a different product

**Key Methods:**
```typescript
switchToProduct(productId: string): void
resetForProductSwitch(productId: string): void
setCurrentProduct(productId: string | null): void
```

### 2. ModelStateManager (`/src/lib/modelStateManager.ts`)
**New File - Centralized Model State Management:**
- Manages model-specific properties (scale, camera distance, materials)
- Handles product-specific customization state
- Provides default values for different model types
- Automatically initializes clean state for new products

**Key Features:**
```typescript
interface ModelState {
  productId: string;
  modelPath: string;
  scale: [number, number, number];
  cameraDistance: number;
  materialState: Map<string, any>;
  customizationState: {
    selectedColor: string;
    hasColorChanged: boolean;
    selectedArtwork: string;
    targetPart: string;
    reflectiveness: number;
  };
  timestamp: number;
}
```

### 3. ModelViewer (`/src/components/studio/ModelViewer.tsx`)
**Changes:**
- Added subscription to ModelStateManager
- Added product switching detection (triggers on `selectedProduct?.id` change)
- Updated scaling logic to use ModelStateManager defaults
- Enhanced material storage to use ModelStateManager
- Automatic reset of LayerManager and ModelStateManager on product switch

**Key Logic:**
```typescript
// Handle product switching - this is the key fix for the carryover bug
useEffect(() => {
  if (selectedProduct?.id && selectedProduct?.modelPath) {
    // Reset layer manager for new product
    layerManager.switchToProduct(selectedProduct.id);
    
    // Reset model state manager for new product  
    const newModelState = modelStateManager.switchToProduct(selectedProduct.id, selectedProduct.modelPath);
    
    // Update camera distance from the new model state
    setCameraDistance(newModelState.cameraDistance);
  }
}, [selectedProduct?.id]); // Only trigger when product ID changes
```

### 4. Studio Page (`/src/app/studio/page.tsx`)
**Changes:**
- Enhanced product selection handler with state reset logic
- Added product ID comparison to prevent unnecessary resets
- Reset all React state variables when switching products
- Added utility function for manual state reset (debugging)

**Enhanced Product Selection:**
```typescript
const handleProductSelect = (product: Product) => {
  const isDifferentProduct = selectedProduct?.id !== product.id;
  
  if (isDifferentProduct) {
    // Reset all customization state to defaults for the new product
    setSelectedColor('#ff4444');
    setSelectedArtwork('');
    setTargetPart('all');
    setSelectedPart('all');
    setHasColorChanged(false);
    setReflectiveness(0.5);
  }
  
  setSelectedProduct(product);
};
```

## Model-Specific Defaults

The system now properly handles different default values for each model type:

### Scaling
```typescript
const defaultScales = {
  'glassjar.glb': 5.25,
  'glassjar1.glb': 5.25,
  'glassjar2.glb': 5.25,
  'jar.glb': 8.4,      // 5.25 * 2 * 0.8
  'blkjar.glb': 8.4,   // 5.25 * 2 * 0.8
  'pouch.glb': 2.1,    // 5.25 * 0.4
};
```

### Camera Distance
```typescript
const defaultCameraDistances = {
  'glassjar.glb': 10,
  'glassjar1.glb': 10,
  'glassjar2.glb': 10,
  'jar.glb': 12,
  'blkjar.glb': 12,
  'pouch.glb': 15,     // Further back to see full model
};
```

## How It Works

1. **Product Selection**: User clicks on a product in the ProductSidebar
2. **State Comparison**: Studio page checks if this is a different product
3. **React State Reset**: All React state variables reset to defaults (if different product)
4. **Manager Reset**: ModelViewer detects product ID change and resets both managers
5. **Clean Initialization**: ModelStateManager creates fresh state with correct defaults
6. **Layer Clearing**: LayerManager clears all existing layers
7. **Fresh Start**: New product loads with clean, product-specific state

## Benefits

✅ **No More Size Carryover**: Each product loads with its correct default scale
✅ **Clean Customization State**: No layers, colors, or artwork carry over
✅ **Product-Specific Defaults**: Each model type gets appropriate camera distance and scale
✅ **Performance Optimized**: Only resets when actually switching products
✅ **Debugging Support**: Manual reset function available in console (`window.resetStudioState()`)

## Testing

To test the fix:
1. Load a product (e.g., Glass Jar)
2. Apply some customizations (color, artwork, layers)
3. Change the model scale/camera position
4. Switch to a different product (e.g., Pouch)
5. Verify that:
   - New product loads with correct default scale
   - No customizations carry over
   - Camera is positioned correctly for the new product
   - All previous layers are cleared

## Debug Logging

The implementation includes comprehensive console logging to track the reset process:
- `🔄` Product switching
- `🧹` State clearing
- `✅` Successful operations
- `📏` Scaling operations
- `📷` Camera operations
- `💾` Material storage

Check the browser console to see the reset process in action.
