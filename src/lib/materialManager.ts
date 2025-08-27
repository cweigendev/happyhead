import * as THREE from 'three';

export interface PBRMaterial {
  id: string;
  name: string;
  category: string;
  description: string;
  resolution: string;
  maps: {
    diffuse?: string;
    normal?: string;
    roughness?: string;
    metallic?: string;
    displacement?: string;
    ao?: string;
    emission?: string;
  };
  properties: {
    roughness: number;
    metallic: number;
    transparency: number;
    displacementScale?: number;
    normalScale?: number;
    emissiveIntensity?: number;
  };
  tiling: {
    repeatU: number;
    repeatV: number;
  };
  targetParts: string[];
}

export interface MaterialSet {
  version: string;
  description: string;
  materials: PBRMaterial[];
}

class MaterialManager {
  private materials: Map<string, PBRMaterial> = new Map();
  private loadedTextures: Map<string, THREE.Texture> = new Map();
  private textureLoader = new THREE.TextureLoader();

  async loadMaterialSet(jsonPath: string): Promise<void> {
    try {
      const response = await fetch(jsonPath);
      const materialSet: MaterialSet = await response.json();
      
      materialSet.materials.forEach(material => {
        this.materials.set(material.id, material);
      });
      
      console.log(`📦 Loaded ${materialSet.materials.length} materials from ${jsonPath}`);
    } catch (error) {
      console.error(`❌ Failed to load material set from ${jsonPath}:`, error);
    }
  }

  getMaterial(id: string): PBRMaterial | undefined {
    return this.materials.get(id);
  }

  getAllMaterials(): PBRMaterial[] {
    return Array.from(this.materials.values());
  }

  getMaterialsByCategory(category: string): PBRMaterial[] {
    return Array.from(this.materials.values()).filter(
      material => material.category === category
    );
  }

  getMaterialsForPart(targetPart: string): PBRMaterial[] {
    return Array.from(this.materials.values()).filter(
      material => material.targetParts.includes(targetPart) || material.targetParts.includes('all')
    );
  }

  async loadTexture(url: string): Promise<THREE.Texture> {
    // Check if texture is already loaded
    if (this.loadedTextures.has(url)) {
      return this.loadedTextures.get(url)!;
    }

    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          // Configure texture for high quality
          texture.magFilter = THREE.LinearFilter;
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          texture.anisotropy = 16;
          texture.generateMipmaps = true;
          texture.flipY = false;
          
          this.loadedTextures.set(url, texture);
          resolve(texture);
        },
        undefined,
        (error) => {
          console.error(`❌ Failed to load texture: ${url}`, error);
          reject(error);
        }
      );
    });
  }

  async createThreeMaterial(materialId: string): Promise<THREE.MeshStandardMaterial | null> {
    const material = this.getMaterial(materialId);
    if (!material) {
      console.error(`❌ Material not found: ${materialId}`);
      return null;
    }

    const threeMaterial = new THREE.MeshStandardMaterial();
    
    try {
      // Load and apply textures
      if (material.maps.diffuse) {
        const diffuseTexture = await this.loadTexture(material.maps.diffuse);
        diffuseTexture.wrapS = diffuseTexture.wrapT = THREE.RepeatWrapping;
        diffuseTexture.repeat.set(material.tiling.repeatU, material.tiling.repeatV);
        threeMaterial.map = diffuseTexture;
      }

      if (material.maps.normal) {
        const normalTexture = await this.loadTexture(material.maps.normal);
        normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping;
        normalTexture.repeat.set(material.tiling.repeatU, material.tiling.repeatV);
        threeMaterial.normalMap = normalTexture;
        threeMaterial.normalScale = new THREE.Vector2(
          material.properties.normalScale || 1.0,
          material.properties.normalScale || 1.0
        );
      }

      if (material.maps.roughness) {
        const roughnessTexture = await this.loadTexture(material.maps.roughness);
        roughnessTexture.wrapS = roughnessTexture.wrapT = THREE.RepeatWrapping;
        roughnessTexture.repeat.set(material.tiling.repeatU, material.tiling.repeatV);
        threeMaterial.roughnessMap = roughnessTexture;
      }

      if (material.maps.metallic) {
        const metallicTexture = await this.loadTexture(material.maps.metallic);
        metallicTexture.wrapS = metallicTexture.wrapT = THREE.RepeatWrapping;
        metallicTexture.repeat.set(material.tiling.repeatU, material.tiling.repeatV);
        threeMaterial.metalnessMap = metallicTexture;
      }

      if (material.maps.ao) {
        const aoTexture = await this.loadTexture(material.maps.ao);
        aoTexture.wrapS = aoTexture.wrapT = THREE.RepeatWrapping;
        aoTexture.repeat.set(material.tiling.repeatU, material.tiling.repeatV);
        threeMaterial.aoMap = aoTexture;
        threeMaterial.aoMapIntensity = 1.0;
      }

      // Displacement maps are disabled to prevent mesh deformation
      // Use normal maps for surface detail instead
      // if (material.maps.displacement) {
      //   const displacementTexture = await this.loadTexture(material.maps.displacement);
      //   displacementTexture.wrapS = displacementTexture.wrapT = THREE.RepeatWrapping;
      //   displacementTexture.repeat.set(material.tiling.repeatU, material.tiling.repeatV);
      //   threeMaterial.displacementMap = displacementTexture;
      //   threeMaterial.displacementScale = material.properties.displacementScale || 0.1;
      // }

      if (material.maps.emission) {
        const emissionTexture = await this.loadTexture(material.maps.emission);
        emissionTexture.wrapS = emissionTexture.wrapT = THREE.RepeatWrapping;
        emissionTexture.repeat.set(material.tiling.repeatU, material.tiling.repeatV);
        threeMaterial.emissiveMap = emissionTexture;
        threeMaterial.emissiveIntensity = material.properties.emissiveIntensity || 1.0;
      }

      // Apply material properties
      threeMaterial.roughness = material.properties.roughness;
      threeMaterial.metalness = material.properties.metallic;
      threeMaterial.transparent = material.properties.transparency > 0;
      threeMaterial.opacity = 1.0 - material.properties.transparency;

      threeMaterial.needsUpdate = true;
      
      console.log(`✅ Created Three.js material for: ${material.name}`);
      return threeMaterial;
      
    } catch (error) {
      console.error(`❌ Failed to create Three.js material for ${materialId}:`, error);
      return null;
    }
  }

  dispose(): void {
    // Dispose of all loaded textures
    this.loadedTextures.forEach(texture => {
      texture.dispose();
    });
    this.loadedTextures.clear();
    this.materials.clear();
  }
}

// Export singleton instance
export const materialManager = new MaterialManager();

// Load default material sets
materialManager.loadMaterialSet('/textures/materials/poliigon/materials.json');
