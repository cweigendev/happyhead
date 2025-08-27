// Model Management Utilities for XTRACT Studio

interface CatalogSubcategory {
  id: string;
  name: string;
  description: string;
  config_file: string;
  model_count: number;
}

interface CatalogCategory {
  id: string;
  name: string;
  description: string;
  subcategories: CatalogSubcategory[];
}

interface Catalog {
  categories: CatalogCategory[];
  supported_formats: Record<string, string[]>;
  upload_limits: Record<string, string | number>;
}

export interface ModelMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  file: string;
  thumbnail: string;
  specifications: Record<string, string | number | boolean>;
  customization_areas: CustomizationArea[];
  created_at: string;
  updated_at: string;
  file_size: number;
  polygon_count?: number;
}

export interface CustomizationArea {
  name: string;
  type: 'color' | 'material' | 'logo';
  uv_map?: string;
  position?: string;
  max_size?: string;
  recommended_size?: string;
}

export interface MaterialVariant {
  id: string;
  name: string;
  maps: {
    diffuse?: string;
    normal?: string;
    roughness?: string;
    metallic?: string;
    ao?: string;
    emission?: string;
  };
  properties: {
    roughness: number;
    metallic: number;
    transparency: number;
    ior?: number;
  };
}

export class ModelManager {
  private static instance: ModelManager;
  private catalog: Catalog | null = null;

  static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager();
    }
    return ModelManager.instance;
  }

  async loadCatalog(): Promise<Catalog> {
    if (!this.catalog) {
      try {
        const response = await fetch('/models/catalog.json');
        this.catalog = await response.json();
      } catch (error) {
        console.error('Failed to load model catalog:', error);
        throw error;
      }
    }
    return this.catalog;
  }

  async getModelsByCategory(categoryId: string, subcategoryId?: string): Promise<ModelMetadata[]> {
    const catalog = await this.loadCatalog();
    const category = catalog.categories.find((cat: CatalogCategory) => cat.id === categoryId);
    
    if (!category) {
      throw new Error(`Category ${categoryId} not found`);
    }

    if (subcategoryId) {
      const subcategory = category.subcategories.find((sub: CatalogSubcategory) => sub.id === subcategoryId);
      if (!subcategory) {
        throw new Error(`Subcategory ${subcategoryId} not found`);
      }

      try {
        const response = await fetch(subcategory.config_file);
        const config = await response.json();
        return config.models;
      } catch (error) {
        console.error(`Failed to load models for ${subcategoryId}:`, error);
        return [];
      }
    }

    // Return all models in category
    const allModels: ModelMetadata[] = [];
    for (const subcategory of category.subcategories) {
      try {
        const response = await fetch(subcategory.config_file);
        const config = await response.json();
        allModels.push(...config.models);
      } catch (error) {
        console.error(`Failed to load models for ${subcategory.id}:`, error);
      }
    }

    return allModels;
  }

  async getModelById(modelId: string): Promise<ModelMetadata | null> {
    const catalog = await this.loadCatalog();
    
    for (const category of catalog.categories) {
      for (const subcategory of category.subcategories) {
        try {
          const response = await fetch(subcategory.config_file);
          const config = await response.json();
          const model = config.models.find((m: ModelMetadata) => m.id === modelId);
          if (model) {
            return model;
          }
        } catch (error) {
          console.error(`Failed to search in ${subcategory.id}:`, error);
        }
      }
    }

    return null;
  }

  async getMaterials(): Promise<MaterialVariant[]> {
    try {
      const response = await fetch('/textures/materials/materials.json');
      const materialsData = await response.json();
      
      const allMaterials: MaterialVariant[] = [];
      for (const material of materialsData.materials) {
        allMaterials.push(...material.variants);
      }
      
      return allMaterials;
    } catch (error) {
      console.error('Failed to load materials:', error);
      return [];
    }
  }

  validateModelFile(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedExtensions = ['.glb', '.gltf'];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum of 10MB`);
    }

    // Check file extension
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      errors.push(`File extension ${extension} not supported. Use: ${allowedExtensions.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateTextureFile(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum of 5MB`);
    }

    // Check file extension
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      errors.push(`File extension ${extension} not supported. Use: ${allowedExtensions.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  generateModelPath(categoryId: string, subcategoryId: string, modelId: string): string {
    return `/models/${categoryId}/${subcategoryId}/${modelId}.glb`;
  }

  generateThumbnailPath(categoryId: string, modelId: string): string {
    return `/images/thumbnails/${categoryId}/${modelId}.jpg`;
  }

  generateTexturePath(materialType: string, variant: string, mapType: string): string {
    return `/textures/materials/${materialType}/${variant}-${mapType}.jpg`;
  }
}

// Export singleton instance
export const modelManager = ModelManager.getInstance();
