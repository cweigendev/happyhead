// Model State Management for XTRACT Studio
// Handles model-specific state like scaling, materials, and other properties

export interface ModelState {
  productId: string;
  modelPath: string;
  scale: [number, number, number];
  cameraDistance: number;
  cameraY: number;
  modelHeight: number;
  materialState: Map<string, any>; // Stores original materials per mesh
  customizationState: {
    selectedColor: string;
    hasColorChanged: boolean;
    selectedArtwork: string;
    targetPart: string;
    reflectiveness: number;
  };
  timestamp: number;
}

// SINGLE SOURCE OF TRUTH for model configurations
const MODEL_SCALES: { [key: string]: number } = {
  'glassjar.glb': 1,
  'glassjar1.glb': 1,
  'glassjar2.glb': 1,
  'glassjar3.glb': 1,
  'jar.glb': 5, // Child resistant jar - reduced from 55
  'blkjar.glb': 8.4, // Black jar
  'pouch.glb': 2, // Child resistant pouch - smaller scale
};

const MODEL_CAMERA_DISTANCES: { [key: string]: number } = {
  'glassjar.glb': 4,
  'glassjar1.glb': 4,
  'glassjar2.glb': 4,
  'glassjar3.glb': 4,
  'jar.glb': 4, // Child resistant jar
  'blkjar.glb': 4, // Black jar
  'pouch.glb': 40, // Child resistant pouch - zoomed out further
};

const MODEL_HEIGHTS: { [key: string]: number } = {
  'glassjar.glb': 0.2,
  'glassjar1.glb': 0.2,
  'glassjar2.glb': 0.2,
  'glassjar3.glb': 0.2,
  'jar.glb': 0.2, // Child resistant jar
  'blkjar.glb': 0.2, // Black jar
  'pouch.glb': -1.5, // Child resistant pouch - positioned lower
};

const CAMERA_Y_POSITIONS: { [key: string]: number } = {
  'glassjar.glb': 0,
  'glassjar1.glb': 0,
  'glassjar2.glb': 0,
  'glassjar3.glb': 0,
  'jar.glb': 0, // Child resistant jar
  'blkjar.glb': 0, // Black jar
  'pouch.glb': 0, // Child resistant pouch - camera at same level (horizontal view)
};

const DEFAULT_SCALE = 5.25; // For unknown models
const DEFAULT_CAMERA_DISTANCE = 4; // For unknown models
const DEFAULT_MODEL_HEIGHT = 0.2; // For unknown models
const DEFAULT_CAMERA_Y = 0; // For unknown models

export class ModelStateManager {
  private static instance: ModelStateManager;
  private currentState: ModelState | null = null;
  private listeners: Array<(state: ModelState | null) => void> = [];

  static getInstance(): ModelStateManager {
    if (!ModelStateManager.instance) {
      ModelStateManager.instance = new ModelStateManager();
    }
    return ModelStateManager.instance;
  }

  // Subscribe to model state changes
  subscribe(listener: (state: ModelState | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners of state changes
  private notify(): void {
    console.log(`🔔 ModelStateManager notify: ${this.listeners.length} listeners`);
    this.listeners.forEach(listener => listener(this.currentState));
  }

  // Initialize state for a new product
  initializeForProduct(productId: string, modelPath: string): ModelState {
    console.log(`🏗️ ModelStateManager: Initializing state for product "${productId}"`);
    console.log(`🏗️ ModelStateManager: Model path: "${modelPath}"`);
    
    // Get model configuration from single source of truth
    const fullFileName = modelPath.split('/').pop() || '';
    const modelFileName = fullFileName.split('?')[0]; // Remove query parameters like ?v=123456
    console.log(`🏗️ ModelStateManager: Extracted filename: "${fullFileName}" → "${modelFileName}"`);
    
    const scaleValue = MODEL_SCALES[modelFileName] || DEFAULT_SCALE;
    const cameraDistance = MODEL_CAMERA_DISTANCES[modelFileName] || DEFAULT_CAMERA_DISTANCE;
    const cameraY = CAMERA_Y_POSITIONS[modelFileName] || DEFAULT_CAMERA_Y;
    const modelHeight = MODEL_HEIGHTS[modelFileName] || DEFAULT_MODEL_HEIGHT;
    
    console.log(`🏗️ ModelStateManager: Selected scale for "${modelFileName}": ${scaleValue}`);
    console.log(`🏗️ ModelStateManager: Selected camera distance for "${modelFileName}": ${cameraDistance}`);
    console.log(`🏗️ ModelStateManager: Selected camera Y for "${modelFileName}": ${cameraY}`);
    console.log(`🏗️ ModelStateManager: Selected model height for "${modelFileName}": ${modelHeight}`);

    const newState: ModelState = {
      productId,
      modelPath,
      scale: [scaleValue, scaleValue, scaleValue],
      cameraDistance,
      cameraY,
      modelHeight,
      materialState: new Map(),
      customizationState: {
        selectedColor: '#ff4444',
        hasColorChanged: false,
        selectedArtwork: '',
        targetPart: 'all',
        reflectiveness: 0.5,
      },
      timestamp: Date.now(),
    };

    this.currentState = newState;
    this.notify();

    console.log(`✅ ModelStateManager: Initialized state for "${productId}":`, {
      scale: newState.scale,
      cameraDistance: newState.cameraDistance,
      modelFileName,
    });

    return newState;
  }

  // Switch to a new product (clears current state and initializes new)
  switchToProduct(productId: string, modelPath: string): ModelState {
    console.log(`🔄 ModelStateManager: Switching from "${this.currentState?.productId}" to "${productId}"`);
    
    // Force clear current state first to ensure fresh start
    this.currentState = null;
    this.notify();
    
    // Always create fresh state for product switches to avoid carryover
    const newState = this.initializeForProduct(productId, modelPath);
    
    // Force log the scale, camera distance, camera Y, and height being applied for debugging
    const debugFullFileName = modelPath.split('/').pop() || '';
    const debugModelFileName = debugFullFileName.split('?')[0]; // Remove query parameters
    const appliedScale = MODEL_SCALES[debugModelFileName] || DEFAULT_SCALE;
    const appliedCameraDistance = MODEL_CAMERA_DISTANCES[debugModelFileName] || DEFAULT_CAMERA_DISTANCE;
    const appliedCameraY = CAMERA_Y_POSITIONS[debugModelFileName] || DEFAULT_CAMERA_Y;
    const appliedHeight = MODEL_HEIGHTS[debugModelFileName] || DEFAULT_MODEL_HEIGHT;
    console.log(`🎯 FORCE DEBUG - "${debugModelFileName}": Scale=${appliedScale}, Camera=${appliedCameraDistance}, CameraY=${appliedCameraY}, Height=${appliedHeight}`);
    
    console.log(`✅ ModelStateManager: Switched to product "${productId}" with fresh state`);
    return newState;
  }

  // Update customization state
  updateCustomizationState(updates: Partial<ModelState['customizationState']>): void {
    if (!this.currentState) {
      console.warn('⚠️ ModelStateManager: No current state to update');
      return;
    }

    this.currentState.customizationState = {
      ...this.currentState.customizationState,
      ...updates,
    };

    this.currentState.timestamp = Date.now();
    this.notify();

    console.log(`🎨 ModelStateManager: Updated customization state:`, updates);
  }

  // Update model scale
  updateScale(scale: [number, number, number]): void {
    if (!this.currentState) {
      console.warn('⚠️ ModelStateManager: No current state to update scale');
      return;
    }

    this.currentState.scale = scale;
    this.currentState.timestamp = Date.now();
    this.notify();

    console.log(`📏 ModelStateManager: Updated scale:`, scale);
  }

  // Update camera distance
  updateCameraDistance(distance: number): void {
    if (!this.currentState) {
      console.warn('⚠️ ModelStateManager: No current state to update camera distance');
      return;
    }

    this.currentState.cameraDistance = distance;
    this.currentState.timestamp = Date.now();
    this.notify();

    console.log(`📷 ModelStateManager: Updated camera distance:`, distance);
  }

  // Store material state for a mesh
  storeMaterialState(meshName: string, material: any): void {
    if (!this.currentState) {
      console.warn('⚠️ ModelStateManager: No current state to store material');
      return;
    }

    this.currentState.materialState.set(meshName, material);
    console.log(`💾 ModelStateManager: Stored material state for mesh: ${meshName}`);
  }

  // Get material state for a mesh
  getMaterialState(meshName: string): any {
    if (!this.currentState) {
      return null;
    }

    return this.currentState.materialState.get(meshName) || null;
  }

  // Get current state
  getCurrentState(): ModelState | null {
    return this.currentState;
  }

  // Reset all state
  reset(): void {
    console.log(`🔄 ModelStateManager: Resetting all state`);
    this.currentState = null;
    this.notify();
  }

  // Check if we have state for a specific product
  hasStateForProduct(productId: string): boolean {
    return this.currentState?.productId === productId;
  }

  // Get default values for a model
  getDefaultValuesForModel(modelPath: string): { scale: [number, number, number]; cameraDistance: number } {
    const fullFileName = modelPath.split('/').pop() || '';
    const modelFileName = fullFileName.split('?')[0]; // Remove query parameters like ?v=123456
    
    const scaleValue = MODEL_SCALES[modelFileName] || DEFAULT_SCALE;
    const cameraDistance = MODEL_CAMERA_DISTANCES[modelFileName] || DEFAULT_CAMERA_DISTANCE;

    return {
      scale: [scaleValue, scaleValue, scaleValue],
      cameraDistance,
    };
  }

  // Comprehensive reset function that clears all model-specific state
  // This is the main function that fixes the carryover bug
  resetAllProductState(): void {
    console.log(`🧹 ModelStateManager: Comprehensive reset of all product state`);
    
    // Clear current state
    this.currentState = null;
    
    // Notify all listeners that state has been cleared
    this.notify();
    
    console.log(`✅ ModelStateManager: All product state cleared successfully`);
  }

  // Get default customization state
  getDefaultCustomizationState(): ModelState['customizationState'] {
    return {
      selectedColor: '#ff4444',
      hasColorChanged: false,
      selectedArtwork: '',
      targetPart: 'all',
      reflectiveness: 0.5,
    };
  }
}

// Export singleton instance
export const modelStateManager = ModelStateManager.getInstance();
