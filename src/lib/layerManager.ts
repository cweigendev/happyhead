// Layer Management System for XTRACT Studio

export interface CustomizationLayer {
  id: string;
  name: string;
  type: 'color' | 'artwork' | 'material';
  targetPart: string;
  value: string; // Color hex, artwork URL, or material texture URL
  isVisible: boolean;
  order: number;
  createdAt: string;
  position?: { x: number; y: number; z: number }; // 3D position for draggable elements
  scale?: number; // Scale factor for logos/artwork
  materialId?: string; // ID of the PBR material for 'material' type layers
  materialType?: 'pbr' | 'simple'; // Type of material
  reflectiveness?: number; // Reflectiveness/shininess value (0-1) for this layer
}

export interface LayerState {
  layers: CustomizationLayer[];
  activeLayerId: string | null;
}

export class LayerManager {
  private static instance: LayerManager;
  private layers: CustomizationLayer[] = [];
  private activeLayerId: string | null = null;
  private listeners: Array<(state: LayerState) => void> = [];
  private currentProductId: string | null = null; // Track current product

  static getInstance(): LayerManager {
    if (!LayerManager.instance) {
      LayerManager.instance = new LayerManager();
    }
    return LayerManager.instance;
  }

  // Subscribe to layer changes
  subscribe(listener: (state: LayerState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners of state changes
  private notify(): void {
    const state: LayerState = {
      layers: [...this.layers],
      activeLayerId: this.activeLayerId
    };
    console.log(`🔔 LayerManager notify: ${this.listeners.length} listeners, ${this.layers.length} layers`);
    console.log(`🔔 Current layers:`, this.layers.map(l => ({ id: l.id, name: l.name, position: l.position, scale: l.scale })));
    this.listeners.forEach(listener => listener(state));
  }

  // Create a new layer
  createLayer(
    name: string,
    type: 'color' | 'artwork' | 'material',
    targetPart: string,
    value: string,
    options?: {
      position?: { x: number; y: number; z: number };
      scale?: number;
      materialId?: string;
      materialType?: 'pbr' | 'simple';
      reflectiveness?: number;
    }
  ): CustomizationLayer {
    const layer: CustomizationLayer = {
      id: `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      targetPart,
      value,
      isVisible: true,
      order: this.layers.length,
      createdAt: new Date().toISOString(),
      position: options?.position,
      scale: options?.scale,
      materialId: options?.materialId,
      materialType: options?.materialType,
      reflectiveness: options?.reflectiveness ?? (type === 'artwork' || type === 'material' ? 0.5 : undefined)
    };

    this.layers.push(layer);
    this.activeLayerId = layer.id;
    this.notify();
    return layer;
  }

  // Update an existing layer
  updateLayer(layerId: string, updates: Partial<CustomizationLayer>): boolean {
    const layerIndex = this.layers.findIndex(l => l.id === layerId);
    if (layerIndex === -1) return false;

    this.layers[layerIndex] = { ...this.layers[layerIndex], ...updates };
    this.notify();
    return true;
  }

  // Update layer name specifically
  updateLayerName(layerId: string, newName: string): boolean {
    return this.updateLayer(layerId, { name: newName });
  }

  // Update layer position
  updateLayerPosition(layerId: string, position: { x: number; y: number; z: number }): boolean {
    return this.updateLayer(layerId, { position });
  }

  // Update layer scale
  updateLayerScale(layerId: string, scale: number): boolean {
    return this.updateLayer(layerId, { scale });
  }

  // Update layer transform (position and scale together)
  updateLayerTransform(layerId: string, position?: { x: number; y: number; z: number }, scale?: number): boolean {
    const updates: Partial<CustomizationLayer> = {};
    if (position) updates.position = position;
    if (scale !== undefined) updates.scale = scale;
    return this.updateLayer(layerId, updates);
  }

  // Delete a layer
  deleteLayer(layerId: string): boolean {
    console.log(`🗑️ Deleting layer ${layerId}`);
    const layerToDelete = this.layers.find(l => l.id === layerId);
    console.log(`🗑️ Layer to delete:`, layerToDelete);
    
    const initialLength = this.layers.length;
    this.layers = this.layers.filter(l => l.id !== layerId);
    
    console.log(`🗑️ Layers after deletion: ${this.layers.length} (was ${initialLength})`);
    
    if (this.activeLayerId === layerId) {
      this.activeLayerId = this.layers.length > 0 ? this.layers[0].id : null;
      console.log(`🗑️ Updated active layer to: ${this.activeLayerId}`);
    }

    if (this.layers.length !== initialLength) {
      this.reorderLayers();
      this.notify();
      console.log(`🗑️ Layer deletion successful - notified subscribers`);
      return true;
    }
    console.log(`🗑️ Layer deletion failed - no change in layer count`);
    return false;
  }

  // Reorder layers
  reorderLayers(): void {
    this.layers.forEach((layer, index) => {
      layer.order = index;
    });
  }

  // Move layer up in order
  moveLayerUp(layerId: string): boolean {
    const layerIndex = this.layers.findIndex(l => l.id === layerId);
    if (layerIndex <= 0) return false;

    [this.layers[layerIndex], this.layers[layerIndex - 1]] = 
    [this.layers[layerIndex - 1], this.layers[layerIndex]];
    
    this.reorderLayers();
    this.notify();
    return true;
  }

  // Move layer down in order
  moveLayerDown(layerId: string): boolean {
    const layerIndex = this.layers.findIndex(l => l.id === layerId);
    if (layerIndex >= this.layers.length - 1) return false;

    [this.layers[layerIndex], this.layers[layerIndex + 1]] = 
    [this.layers[layerIndex + 1], this.layers[layerIndex]];
    
    this.reorderLayers();
    this.notify();
    return true;
  }

  // Toggle layer visibility
  toggleLayerVisibility(layerId: string): boolean {
    const layer = this.layers.find(l => l.id === layerId);
    if (!layer) return false;

    layer.isVisible = !layer.isVisible;
    this.notify();
    return true;
  }

  // Set active layer
  setActiveLayer(layerId: string | null): void {
    this.activeLayerId = layerId;
    this.notify();
  }

  // Get all layers
  getLayers(): CustomizationLayer[] {
    return [...this.layers].sort((a, b) => a.order - b.order);
  }

  // Get active layer
  getActiveLayer(): CustomizationLayer | null {
    return this.layers.find(l => l.id === this.activeLayerId) || null;
  }

  // Get visible layers for a specific part
  getVisibleLayersForPart(targetPart: string): CustomizationLayer[] {
    return this.layers
      .filter(l => l.isVisible && (l.targetPart === targetPart || l.targetPart === 'all'))
      .sort((a, b) => a.order - b.order);
  }

  // Clear all layers
  clearAllLayers(): void {
    this.layers = [];
    this.activeLayerId = null;
    this.notify();
  }

  // Export layers to JSON
  exportLayers(): string {
    return JSON.stringify({
      layers: this.layers,
      activeLayerId: this.activeLayerId,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  // Import layers from JSON
  importLayers(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.layers && Array.isArray(data.layers)) {
        this.layers = data.layers;
        this.activeLayerId = data.activeLayerId || null;
        this.notify();
        return true;
      }
    } catch (error) {
      console.error('Failed to import layers:', error);
    }
    return false;
  }

  // Get current state
  getState(): LayerState {
    return {
      layers: [...this.layers],
      activeLayerId: this.activeLayerId
    };
  }

  // Set current product (for tracking product switches)
  setCurrentProduct(productId: string | null): void {
    this.currentProductId = productId;
  }

  // Get current product ID
  getCurrentProduct(): string | null {
    return this.currentProductId;
  }

  // Switch to a new product - clears all existing layers and resets state
  switchToProduct(productId: string): void {
    console.log(`🔄 LayerManager: Switching from product "${this.currentProductId}" to "${productId}"`);
    
    // Only clear if switching to a different product
    if (this.currentProductId !== productId) {
      console.log(`🧹 LayerManager: Product changed - clearing all layers and state`);
      this.clearAllLayers();
      this.currentProductId = productId;
      // Notification is already sent by clearAllLayers()
    } else {
      console.log(`📌 LayerManager: Same product selected - keeping existing layers`);
    }
  }

  // Reset everything (for force refresh scenarios)
  resetForProductSwitch(productId: string): void {
    console.log(`🔄 LayerManager: Force reset for product switch to "${productId}"`);
    this.clearAllLayers();
    this.currentProductId = productId;
    // clearAllLayers() already calls notify()
  }
}

// Export singleton instance
export const layerManager = LayerManager.getInstance();
