'use client';

import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Center } from '@react-three/drei';
import { Product } from '@/app/studio/page';
import { layerManager, LayerState } from '@/lib/layerManager';
import { materialManager } from '@/lib/materialManager';
import { modelStateManager, ModelState } from '@/lib/modelStateManager';

import CameraHeightController from './CameraHeightController';

import * as THREE from 'three';

// Model scaling is now handled by ModelStateManager - no hardcoded defaults



interface ModelViewerProps {
  selectedProduct: Product | null;
  selectedColor?: string;
  selectedArtwork?: string;
  targetPart?: string;
  hasColorChanged?: boolean;
  reflectiveness?: number;
}

// 3D Model Component with dynamic materials
const Model = React.memo(function Model({
  modelPath,
  selectedColor = '#ffffff',
  selectedArtwork,
  targetPart = 'all',
  hasColorChanged = false,
  reflectiveness = 0.5
}: {
  modelPath: string;
  selectedColor?: string;
  selectedArtwork?: string;
  targetPart?: string;
  hasColorChanged?: boolean;
  reflectiveness?: number;
}) {
  console.log('🏗️ Model component RE-RENDERING with reflectiveness:', reflectiveness, 'for path:', modelPath); // Debug log

  // Initialize all hooks first, before any early returns

  const [layerState, setLayerState] = useState<LayerState>({ layers: [], activeLayerId: null });
  const [loadedTextures, setLoadedTextures] = useState<Map<string, THREE.Texture>>(new Map());
  const [previewTexture, setPreviewTexture] = useState<THREE.Texture | null>(null);

  const [originalMaterials, setOriginalMaterials] = useState<Map<string, THREE.MeshStandardMaterial>>(new Map());
  const [modelScale, setModelScale] = useState<[number, number, number]>([1, 1, 1]); // Default until ModelStateManager provides the correct scale

  // Conditionally load GLTF only if modelPath exists
  const gltfResult = modelPath ? useGLTF(modelPath, true) : null; // Enable DRACO compression for large files
  const scene = gltfResult?.scene;

  if (!modelPath) {
    console.error('No model path provided');
    return <ModelLoader />;
  }

  // Subscribe to layer changes
  useEffect(() => {
    console.log(`📺 ModelViewer: Subscribing to layer changes`);
    const unsubscribe = layerManager.subscribe((newState) => {
      console.log(`📺 ModelViewer: Received layer state update with ${newState.layers.length} layers`);
      console.log(`📺 Layer details:`, newState.layers.map(l => ({ id: l.id, name: l.name, position: l.position, scale: l.scale })));
      setLayerState(newState);
    });
    setLayerState(layerManager.getState());
    return unsubscribe;
  }, []);

  // Enhanced function to determine if a mesh should be modified based on its name and target part
  const shouldModifyMesh = (meshName: string, targetPart: string): boolean => {
    console.log(`🔍 shouldModifyMesh: meshName="${meshName}", targetPart="${targetPart}"`);
    
    if (targetPart === 'all') {
      console.log(`🔍 targetPart is 'all', returning true`);
      return true;
    }

    const name = meshName.toLowerCase();

    switch (targetPart) {
      case 'top':
        // Enhanced detection for top/cap parts
        const isTop = name.includes('top') || name.includes('cap') || name.includes('lid') || 
                name.includes('cover') || name.includes('upper') || name.includes('head') ||
                name.includes('cork') || name.includes('closure') || name.includes('stopper') ||
                // Glass jar specific names
                name.includes('jar_top') || name.includes('jartop') || name.includes('jar.top') ||
                name.includes('glass_top') || name.includes('glasstop') ||
                // Generic mesh names that might indicate top part
                (name.includes('001') && name.includes('jar')) || // Often the first mesh is the top
                name.includes('_001') || name.endsWith('001') ||
                // Common Blender export names for top parts
                name.includes('cylinder.001') || name.includes('sphere.001');
        
        console.log(`🔍 Checking for 'top': ${isTop}`);
        return isTop;
      case 'middle':
        const isMiddle = name.includes('middle') || name.includes('body') || name.includes('main') || 
                        name.includes('center') || name.includes('container') || name.includes('vessel') ||
                        name.includes('inner') || name.includes('interior') ||
                        name.includes('jar_body') || name.includes('jarbody') || name.includes('jar.body');
        console.log(`🔍 Checking for 'middle': ${isMiddle}`);
        return isMiddle;
      case 'base':
        // Enhanced detection for base/bottom parts
        const isBase = name.includes('base') || name.includes('bottom') || name.includes('foundation') || 
                 name.includes('foot') || name.includes('lower') || name.includes('floor') ||
                 name.includes('jar_base') || name.includes('jarbase') || name.includes('jar.base') ||
                 name.includes('glass_base') || name.includes('glassbase') ||
                 // Generic mesh names that might indicate base part  
                 (name.includes('002') && name.includes('jar')) || // Often the second mesh is the base
                 name.includes('_002') || name.endsWith('002') ||
                 // Common Blender export names for base parts
                 name.includes('cylinder.002') || name.includes('sphere.002') ||
                 name.includes('cylinder_002') || name.includes('sphere_002') ||
                 // BlkJar specific mesh names
                 name.includes('blkjar') || name.includes('blk_jar') || name.includes('blk-jar') ||
                 name.includes('glass') || name.includes('vessel') || name.includes('container') ||
                 // Pouch specific mesh names
                 name === 'plane001' || (name.includes('plane') && !name.includes('_1')) ||
                 name.includes('pouch') || name.includes('bag') || name.includes('packet') ||
                 // Sometimes the main jar body is considered the base
                 (name.includes('jar') && !name.includes('top') && !name.includes('cap') && !name.includes('lid')) ||
                 // If it's the only mesh or main mesh, treat as base
                 (name.includes('mesh') && !name.includes('top') && !name.includes('cap')) ||
                 // Common default mesh names that should be treated as base
                 name === 'mesh' || name === 'object' || name === 'group' || name === 'scene';
        
        console.log(`🔍 Checking for 'base': ${isBase}`);
        return isBase;
      case 'artwork':
        // Artwork targeting - specifically for artwork/logo material areas
        // Plane001_1 is the artwork layer in the pouch model
        const isArtwork = name === 'plane001_1' || name.includes('_1') ||
                         name.includes('artwork') || name.includes('logo_area') || 
                         name.includes('label');
        console.log(`🔍 Checking for 'artwork': ${isArtwork}`);
        return isArtwork;
      default:
        console.log(`🔍 Unknown targetPart, returning false`);
        return false;
    }
  };

  // Load textures for all artwork layers
  useEffect(() => {
    const artworkLayers = layerState.layers.filter(layer =>
      layer.type === 'artwork' && layer.isVisible && layer.value
    );

    const loadTextures = async () => {
      const newTextures = new Map<string, THREE.Texture>();
      const loader = new THREE.TextureLoader();

      // Load all textures concurrently for better performance
      const texturePromises = artworkLayers.map(async (layer) => {
        // Check if we already have this texture loaded
        const existingTexture = loadedTextures.get(layer.id);
        if (existingTexture && existingTexture.image?.src === layer.value) {
          newTextures.set(layer.id, existingTexture);
          return { layerId: layer.id, success: true, cached: true };
        }

        try {
          console.log(`🔄 Loading texture for layer "${layer.name}" (${layer.id}): ${layer.value}`);
          const texture = await new Promise<THREE.Texture>((resolve, reject) => {
            loader.load(
              layer.value, 
              (loadedTexture) => {
                console.log(`✅ Texture loaded successfully for layer "${layer.name}" (${layer.id})`);
                resolve(loadedTexture);
              }, 
              (progress) => {
                console.log(`📥 Loading texture progress for "${layer.name}": ${(progress.loaded / progress.total * 100).toFixed(1)}%`);
              },
              (error) => {
                console.error(`❌ Failed to load texture for layer "${layer.name}" (${layer.id}):`, error);
                reject(error);
              }
            );
          });
          
          // For logos, use ClampToEdgeWrapping to prevent tiling/repeating
          // For other artwork, use RepeatWrapping to allow patterns
          const isLogo = layer.name.toLowerCase().includes('logo');
          if (isLogo) {
            texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
          } else {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          }
          
          // High-quality texture filtering for crisp zoom
          texture.magFilter = THREE.LinearFilter;
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          texture.anisotropy = 16; // Maximum anisotropic filtering
          texture.generateMipmaps = true;
          texture.flipY = false;
          
          newTextures.set(layer.id, texture);
          return { layerId: layer.id, success: true, cached: false };
        } catch (error) {
          console.error(`❌ Error loading texture for layer ${layer.id}:`, error);
          return { layerId: layer.id, success: false, error, cached: false };
        }
      });

      // Wait for all textures to load before updating state
      const results = await Promise.allSettled(texturePromises);
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;
      
      console.log(`🖼️ Texture loading complete: ${successful} successful, ${failed} failed. Total textures: ${loadedTextures.size} → ${newTextures.size}`);
      
      // Only update textures state after all have loaded (or failed)
      setLoadedTextures(newTextures);
    };

    if (artworkLayers.length > 0) {
      loadTextures();
    } else {
      // Clear all textures when no artwork layers exist
      if (loadedTextures.size > 0) {
        console.log(`🗑️ Clearing all ${loadedTextures.size} textures - no artwork layers`);
        setLoadedTextures(new Map());
      }
    }
  }, [JSON.stringify(layerState.layers.map(l => ({ id: l.id, value: l.value, isVisible: l.isVisible, position: l.position, scale: l.scale })))]);

  // Load preview texture for selectedArtwork
  useEffect(() => {
    if (selectedArtwork) {
      const loader = new THREE.TextureLoader();
      loader.load(
        selectedArtwork,
        (texture) => {
          // For preview textures, default to ClampToEdgeWrapping to prevent unwanted tiling
          // Users can adjust this through layer controls if they want repeating patterns
          texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
          
          // High-quality texture filtering for crisp zoom
          texture.magFilter = THREE.LinearFilter;
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          texture.anisotropy = 16; // Maximum anisotropic filtering
          texture.generateMipmaps = true;
          texture.flipY = false;
          setPreviewTexture(texture);
        },
        undefined,
        (error) => {
          console.error('Error loading preview texture:', error);
          setPreviewTexture(null);
        }
      );
    } else {
      setPreviewTexture(null);
    }
  }, [selectedArtwork]);

  // Set appropriate scale based on model state manager (prevents carryover issues)
  useEffect(() => {
    if (scene && modelPath) {
      // Get scale from model state manager to ensure clean state per product
      const defaultValues = modelStateManager.getDefaultValuesForModel(modelPath);
      const newScale = defaultValues.scale;
      
      setModelScale(newScale);
      
      // Store the scale in model state manager for consistency
      modelStateManager.updateScale(newScale);
      
      console.log(`📏 Model scaling (via ModelStateManager):`, {
        modelPath,
        modelFileName: modelPath.split('/').pop(),
        appliedScale: newScale[0],
        finalScale: newScale,
        isPouch: modelPath.includes('pouch.glb'),
        isJar: modelPath.includes('jar.glb'),
        isChildResistantJar: modelPath.includes('/child-resistant-jars/jar.glb')
      });
    }
  }, [scene, modelPath]);

  // Store original materials when scene first loads
  useEffect(() => {
    if (scene && originalMaterials.size === 0) {
      const materials = new Map<string, THREE.MeshStandardMaterial>();
      
      // Debug: Log the complete model structure for glassjar2.glb and blkjar.glb
      if (modelPath.includes('glassjar2.glb') || modelPath.includes('blkjar.glb')) {
        const modelName = modelPath.includes('blkjar.glb') ? 'BLKJAR.GLB' : 'GLASSJAR2.GLB';
        console.log(`🔍 === ${modelName} MESH STRUCTURE DEBUG ===`);
        console.log(`📦 Scene children count: ${scene.children.length}`);
        console.log(`📦 Scene name: ${scene.name || 'unnamed'}`);
        
        let meshCount = 0;
        const logObject = (obj: THREE.Object3D, level = 0) => {
          const indent = '  '.repeat(level);
          console.log(`${indent}Object: "${obj.name}" (${obj.type})`);
          
          if (obj instanceof THREE.Mesh) {
            meshCount++;
            console.log(`${indent}  └─ MESH #${meshCount}`);
            console.log(`${indent}     ├─ Mesh Name: "${obj.name}"`);
            console.log(`${indent}     ├─ Mesh Name (lowercase): "${obj.name.toLowerCase()}"`);
            
            // Test current layer detection logic with the shouldModifyMesh function
            const name = obj.name.toLowerCase();
            let detectedPart = 'unknown';
            
            // Use the same logic as shouldModifyMesh function for base detection
            if (name.includes('base') || name.includes('bottom') || name.includes('foundation') || 
                name.includes('foot') || name.includes('lower') || name.includes('floor') ||
                name.includes('jar_base') || name.includes('jarbase') || name.includes('jar.base') ||
                name.includes('glass_base') || name.includes('glassbase') ||
                (name.includes('002') && name.includes('jar')) ||
                name.includes('_002') || name.endsWith('002') ||
                name.includes('cylinder.002') || name.includes('sphere.002') ||
                (name.includes('jar') && !name.includes('top') && !name.includes('cap') && !name.includes('lid'))) {
              detectedPart = 'base';
            } else if (name.includes('top') || name.includes('cap') || name.includes('lid') || name.includes('cover')) {
              detectedPart = 'top';
            } else if (name.includes('middle') || name.includes('body') || name.includes('main') || name.includes('center')) {
              detectedPart = 'middle';
            }
            
            console.log(`${indent}     └─ 🎯 DETECTED AS: "${detectedPart}"`);
            
            // Test shouldModifyMesh function specifically for base part
            if (modelName === 'BLKJAR.GLB') {
              const wouldModifyForBase = shouldModifyMesh(obj.name, 'base');
              console.log(`${indent}     └─ 🔬 shouldModifyMesh('${obj.name}', 'base') = ${wouldModifyForBase}`);
            }
          }
          
          obj.children.forEach(child => logObject(child, level + 1));
        };
        
        scene.traverse((child) => logObject(child));
        console.log(`🔍 Total meshes found: ${meshCount}`);
        console.log(`🔍 === END ${modelName} DEBUG ===`);
      }
      
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          // Clone the original material to preserve it
          const originalMat = child.material as THREE.MeshStandardMaterial;
          const clonedMaterial = originalMat.clone();
          materials.set(child.name, clonedMaterial);
          
          // Also store in model state manager for product-specific persistence
          modelStateManager.storeMaterialState(child.name, clonedMaterial);
          
          // Log material properties for debugging blkjar issues
          if (modelPath.includes('blkjar.glb') && child.name.toLowerCase().includes('base')) {
            console.log(`💾 Stored original material for blkjar base mesh: ${child.name}`, {
              color: originalMat.color.getHexString(),
              roughness: originalMat.roughness,
              metalness: originalMat.metalness,
              transparent: originalMat.transparent,
              opacity: originalMat.opacity,
              hasMap: !!originalMat.map,
              emissive: originalMat.emissive.getHexString(),
              emissiveIntensity: originalMat.emissiveIntensity
            });
          } else {
            console.log(`💾 Stored original material for mesh: ${child.name}`);
          }
        }
      });
      setOriginalMaterials(materials);
      console.log(`💾 Stored ${materials.size} original materials in both local state and ModelStateManager`);
    }
  }, [scene, originalMaterials.size, modelPath]);

  useEffect(() => {
    console.log('🎯 ModelViewer useEffect triggered - applying layers to scene');
    
    if (scene) {
      console.log(`🎯 Applying ${layerState.layers.length} layers to 3D model`);

      // First, clean up any existing logo overlay meshes
      const logoMeshesToRemove: THREE.Object3D[] = [];
      scene.traverse((child) => {
        if (child.name.includes('_logo_')) {
          logoMeshesToRemove.push(child);
        }
      });
      logoMeshesToRemove.forEach(logoMesh => {
        if (logoMesh.parent) {
          logoMesh.parent.remove(logoMesh);
          // Dispose of geometry and material to free memory
          if (logoMesh instanceof THREE.Mesh) {
            logoMesh.geometry?.dispose();
            if (logoMesh.material instanceof THREE.Material) {
              logoMesh.material.dispose();
            }
          }
        }
      });
      console.log(`🗑️ Cleaned up ${logoMeshesToRemove.length} old logo meshes`);

      // Apply layers to meshes directly
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh && !child.name.includes('_logo_')) {
          
          // Get all visible layers that apply to this mesh
          const applicableLayers = layerState.layers.filter(layer =>
            layer.isVisible && shouldModifyMesh(child.name, layer.targetPart)
          ).sort((a, b) => a.order - b.order); // Apply in order
          

          
          console.log(`🎨 Mesh "${child.name}" has ${applicableLayers.length} applicable layers`);

          // Always create new material from the stored original to ensure clean state
          const storedOriginal = originalMaterials.get(child.name);
          // For pouch model, use MeshPhysicalMaterial to support clearcoat and advanced properties
          const isPouch = modelPath.includes('pouch');
          let newMaterial: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;
          
          if (isPouch) {
            // Convert to MeshPhysicalMaterial for pouch to support clearcoat
            const baseMaterial = storedOriginal ? storedOriginal : (child.material as THREE.MeshStandardMaterial);
            newMaterial = new THREE.MeshPhysicalMaterial();
            // Copy basic properties from the original material
            newMaterial.color = baseMaterial.color.clone();
            newMaterial.map = baseMaterial.map;
            newMaterial.normalMap = baseMaterial.normalMap;
            newMaterial.roughness = baseMaterial.roughness;
            newMaterial.metalness = baseMaterial.metalness;
            // Ensure environment map is enabled
            newMaterial.envMapIntensity = 1.0;
            console.log(`🔧 Created MeshPhysicalMaterial for pouch mesh: ${child.name}`);
          } else {
            newMaterial = storedOriginal ? storedOriginal.clone() : (child.material as THREE.MeshStandardMaterial).clone();
          }
          

          
          if (!storedOriginal) {
            console.warn(`⚠️ No stored original material for mesh: ${child.name}, using current material`);
          }
          
          if (applicableLayers.length > 0) {
            // Separate different layer types for different handling
            const artworkLayers = applicableLayers.filter(layer => 
              layer.type === 'artwork' && !layer.name.toLowerCase().includes('logo')
            );
            const logoLayers = applicableLayers.filter(layer => 
              layer.type === 'artwork' && layer.name.toLowerCase().includes('logo')
            );
            const colorLayers = applicableLayers.filter(layer => layer.type === 'color');
            const materialLayers = applicableLayers.filter(layer => layer.type === 'material');
            
            // Apply color layers first
            for (const layer of colorLayers) {
              newMaterial.color = new THREE.Color(layer.value);
            }

            // Apply PBR material layers (highest priority)
            for (const layer of materialLayers) {
              if (layer.materialId && layer.materialType === 'pbr') {
                console.log(`🧱 Processing PBR material layer "${layer.name}" (${layer.id})`);
                try {
                  // Create PBR material asynchronously
                  materialManager.createThreeMaterial(layer.materialId).then(pbrMaterial => {
                    if (pbrMaterial && child.material) {
                      // Copy PBR properties to the existing material
                      const currentMaterial = child.material as THREE.MeshStandardMaterial;
                      
                      // Copy textures
                      if (pbrMaterial.map) currentMaterial.map = pbrMaterial.map;
                      if (pbrMaterial.normalMap) {
                        currentMaterial.normalMap = pbrMaterial.normalMap;
                        currentMaterial.normalScale = pbrMaterial.normalScale;
                      }
                      if (pbrMaterial.roughnessMap) currentMaterial.roughnessMap = pbrMaterial.roughnessMap;
                      if (pbrMaterial.metalnessMap) currentMaterial.metalnessMap = pbrMaterial.metalnessMap;
                      if (pbrMaterial.aoMap) {
                        currentMaterial.aoMap = pbrMaterial.aoMap;
                        currentMaterial.aoMapIntensity = pbrMaterial.aoMapIntensity;
                      }
                      // Displacement maps disabled to prevent mesh deformation
                      // if (pbrMaterial.displacementMap) {
                      //   currentMaterial.displacementMap = pbrMaterial.displacementMap;
                      //   currentMaterial.displacementScale = pbrMaterial.displacementScale;
                      // }
                      if (pbrMaterial.emissiveMap) {
                        currentMaterial.emissiveMap = pbrMaterial.emissiveMap;
                        currentMaterial.emissiveIntensity = pbrMaterial.emissiveIntensity;
                      }
                      
                      // Copy material properties
                      currentMaterial.roughness = pbrMaterial.roughness;
                      currentMaterial.metalness = pbrMaterial.metalness;
                      currentMaterial.transparent = pbrMaterial.transparent;
                      currentMaterial.opacity = pbrMaterial.opacity;
                      
                      currentMaterial.needsUpdate = true;
                      console.log(`✅ Applied PBR material "${layer.name}" to mesh "${child.name}"`);
                    }
                  }).catch(error => {
                    console.error(`❌ Failed to apply PBR material "${layer.name}":`, error);
                  });
                } catch (error) {
                  console.error(`❌ Error processing PBR material layer "${layer.name}":`, error);
                }
              }
            }
            
            // Apply artwork layers as base textures (only the last one will be visible)
            // In the future, we could implement texture blending here
            for (const layer of artworkLayers) {
              if (layer.type === 'artwork') {
                const texture = loadedTextures.get(layer.id);
                console.log(`🖼️ Processing artwork layer "${layer.name}" (${layer.id})`);
                console.log(`🖼️ Texture exists:`, !!texture);
                console.log(`🖼️ Layer position:`, layer.position);
                console.log(`🖼️ Layer scale:`, layer.scale);
                
                if (texture) {
                  // Verify texture is fully loaded
                  if (!texture.image || !texture.image.complete) {
                    console.log(`⏳ Texture for layer "${layer.name}" is still loading, skipping application`);
                    continue;
                  }
                  
                  // Clone the texture to avoid modifying the original
                  const layerTexture = texture.clone();
                  
                  // Apply position and scale transformations for artwork (not logos)
                  const scale = layer.scale !== undefined ? layer.scale : 0.3;
                  const position = layer.position || { x: 0, y: 0, z: 0 };
                  
                  console.log(`🎨 Processing artwork layer "${layer.name}" (${layer.id})`);
                  console.log(`🎨 Texture image size: ${texture.image?.width || 'unknown'}x${texture.image?.height || 'unknown'}`);
                  
                  // For artwork patterns: allow repeating and scaling
                  layerTexture.wrapS = THREE.RepeatWrapping;
                  layerTexture.wrapT = THREE.RepeatWrapping;
                  
                  // Apply scale to texture repeat for patterns
                  const textureScale = 1 / Math.max(scale, 0.05);
                  layerTexture.repeat.set(textureScale, textureScale);
                  
                  // Apply position to texture offset
                  const offsetSensitivity = 0.1;
                  const offsetX = (position.x || 0) * offsetSensitivity;
                  const offsetY = -(position.y || 0) * offsetSensitivity;
                  layerTexture.offset.set(offsetX, offsetY);
                  
                  // Center the texture
                  layerTexture.center.set(0.5, 0.5);
                  
                  layerTexture.needsUpdate = true;
                  
                  // Check if this is a pouch model and handle material-specific targeting
                  const isArtworkLayer = layer.targetPart === 'artwork' || layer.name.toLowerCase().includes('artwork');
                  
                  if (isPouch && isArtworkLayer) {
                    console.log(`🎨 Pouch artwork detected - targeting Artwork material area for layer "${layer.name}"`);
                    console.log(`🎨 Layer targetPart: ${layer.targetPart}, mesh: ${child.name}`);
                    console.log(`🎨 Using scale: ${scale}, position: ${position.x}, ${position.y}`);
                    
                    // Don't reset transforms - keep the user-adjusted scale and position
                    // The scale and position have already been applied above
                    
                    // Ensure we're not applying color interference
                    newMaterial.color = new THREE.Color(0xffffff);
                  }
                  
                  newMaterial.map = layerTexture;
                  
                  // Apply reflectiveness to artwork on pouch model (global approach)
                  if (isPouch && newMaterial instanceof THREE.MeshPhysicalMaterial) {
                    const physicalMaterial = newMaterial as THREE.MeshPhysicalMaterial;
                    console.log(`🔍 BEFORE applying reflectiveness to layer "${layer.name}":`, {
                      roughness: physicalMaterial.roughness,
                      metalness: physicalMaterial.metalness,
                      envMapIntensity: physicalMaterial.envMapIntensity,
                      clearcoat: physicalMaterial.clearcoat,
                      clearcoatRoughness: physicalMaterial.clearcoatRoughness,
                      reflectivenessValue: reflectiveness
                    });
                    
                    physicalMaterial.roughness = 1.0 - (reflectiveness * 0.9);
                    physicalMaterial.metalness = reflectiveness * 0.4;
                    physicalMaterial.envMapIntensity = reflectiveness * 1.5;
                    physicalMaterial.clearcoat = reflectiveness * 0.5;
                    physicalMaterial.clearcoatRoughness = 1.0 - reflectiveness;
                    // Additional physical properties for better glossy effect
                    physicalMaterial.reflectivity = reflectiveness * 0.5;
                    physicalMaterial.ior = 1.33 + (reflectiveness * 0.2); // Index of refraction
                    
                    console.log(`✨ AFTER applying reflectiveness ${reflectiveness} to layer "${layer.name}":`, {
                      roughness: physicalMaterial.roughness,
                      metalness: physicalMaterial.metalness,
                      envMapIntensity: physicalMaterial.envMapIntensity,
                      clearcoat: physicalMaterial.clearcoat,
                      clearcoatRoughness: physicalMaterial.clearcoatRoughness,
                      reflectivity: physicalMaterial.reflectivity,
                      ior: physicalMaterial.ior
                    });
                  }
                  
                  // For blkjar base, ensure the material color doesn't interfere
                  if (modelPath.includes('blkjar.glb') && child.name.toLowerCase().includes('base')) {
                    newMaterial.color = new THREE.Color(0xffffff); // White to show texture colors
                    console.log(`🎨 Reset blkjar base color to white for texture visibility`);
                  }
                  
                  newMaterial.needsUpdate = true;
                  
                  console.log(`✅ Applied artwork texture "${layer.name}" to mesh "${child.name}"`);
                  console.log(`🎨 Final material & texture properties:`, {
                    textureRepeat: `${layerTexture.repeat.x}x${layerTexture.repeat.y}`,
                    textureOffset: `${layerTexture.offset.x}, ${layerTexture.offset.y}`,
                    textureWrapS: layerTexture.wrapS,
                    textureWrapT: layerTexture.wrapT,
                    materialColor: newMaterial.color.getHexString(),
                    materialRoughness: newMaterial.roughness,
                    materialMetalness: newMaterial.metalness,
                    materialTransparent: newMaterial.transparent,
                    materialOpacity: newMaterial.opacity,
                    imageLoaded: !!texture.image?.complete,
                    imageSize: texture.image ? `${texture.image.width}x${texture.image.height}` : 'unknown'
                  });
                } else {
                  console.log(`⚠️ No texture found for layer "${layer.name}" (${layer.id}) - texture may still be loading`);
                }
              }
            }
            
            // Handle logo layers as overlay materials on the same mesh
            // We'll apply logos as additional materials using opacity/transparency
            for (const layer of logoLayers) {
              const texture = loadedTextures.get(layer.id);
              console.log(`🏷️ Processing logo layer "${layer.name}" (${layer.id})`);
              
              if (texture) {
                // Clone the texture to avoid modifying the original
                const logoTexture = texture.clone();
                
                // Apply position and scale transformations for logos
                const scale = layer.scale !== undefined ? layer.scale : 0.3;
                const position = layer.position || { x: 0, y: 0, z: 0 };
                
                // Check if this is BlkJar model to apply specific handling if needed
                const isBlkJar = modelPath.includes('blkjar.glb');
                
                console.log(`🏷️ Logo layer transform:`, { 
                  layerName: layer.name,
                  scale, 
                  position,
                  hasTexture: !!texture,
                  isBlkJar,
                  modelPath
                });
                
                // For logos: use ClampToEdgeWrapping to prevent tiling
                logoTexture.wrapS = THREE.ClampToEdgeWrapping;
                logoTexture.wrapT = THREE.ClampToEdgeWrapping;
                
                // For logos: maintain aspect ratio and center properly
                const userLogoScale = Math.max(scale, 0.01);
                
                // Get texture dimensions to calculate aspect ratio
                const textureAspect = logoTexture.image ? logoTexture.image.width / logoTexture.image.height : 1;

                
                const effectiveLogoScale = userLogoScale;
                
                // Invert the scale for texture coordinates
                const baseScale = 1 / effectiveLogoScale;
                
                // Apply aspect ratio correction to prevent stretching
                let scaleX, scaleY;
                if (textureAspect > 1) {
                  // Logo is wider than tall - constrain by width
                  scaleX = baseScale;
                  scaleY = baseScale * textureAspect;
                } else {
                  // Logo is taller than wide - constrain by height  
                  scaleX = baseScale / textureAspect;
                  scaleY = baseScale;
                }
                
                // CRITICAL FIX: For small logos, don't clamp - allow proper scaling
                // Only clamp when values would cause tiling (> 1.0) AND logo is not intentionally small
                if (effectiveLogoScale > 0.5) {
                  // For normal/large logos, prevent tiling
                  scaleX = Math.min(scaleX, 1.0);
                  scaleY = Math.min(scaleY, 1.0);
                }
                // For small logos (< 0.5), allow natural scaling to work
                
                console.log(`🏷️ Logo scaling debug:`, {
                  effectiveLogoScale,
                  baseScale,
                  scaleX,
                  scaleY,
                  willClamp: effectiveLogoScale > 0.5
                });
                
                // Use repeat to scale the texture
                logoTexture.repeat.set(scaleX, scaleY);
                
                // Center the logo by offsetting based on the scale
                const centerOffsetX = (1 - scaleX) * 0.5;
                const centerOffsetY = (1 - scaleY) * 0.5;
                
                // Apply position offsets for user positioning, plus centering
                const offsetSensitivity = 0.1;
                const userOffsetX = (position.x || 0) * offsetSensitivity;
                const userOffsetY = -(position.y || 0) * offsetSensitivity;
                
                logoTexture.offset.set(
                  centerOffsetX + userOffsetX,
                  centerOffsetY + userOffsetY
                );
                
                // Center the texture
                logoTexture.center.set(0.5, 0.5);
                logoTexture.needsUpdate = true;
                

                
                                  // Create a logo overlay mesh that matches the original mesh geometry
                if (child.geometry) {
                  // Clone the mesh geometry for the logo overlay
                  const logoMesh = new THREE.Mesh(
                    child.geometry.clone(),
                    new THREE.MeshStandardMaterial({
                      map: logoTexture,
                      transparent: true,
                      opacity: 1.0,
                      alphaTest: 0.1, // Only render pixels above this alpha threshold
                      side: THREE.DoubleSide,
                      depthWrite: false, // Don't write to depth buffer to avoid z-fighting
                    })
                  );
                  
                  // Position the logo mesh slightly in front of the original
                  logoMesh.position.copy(child.position);
                  logoMesh.rotation.copy(child.rotation);
                  logoMesh.scale.copy(child.scale);
                  
                  // Offset slightly forward to avoid z-fighting
                  const offset = new THREE.Vector3(0, 0, 0.001);
                  logoMesh.position.add(offset);
                  
                  // Add the logo mesh to the scene
                  logoMesh.name = `${child.name}_logo_${layer.id}`;
                  child.parent?.add(logoMesh);
                  
                  console.log(`✅ Applied logo overlay "${layer.name}" to mesh "${child.name}"`);
                }
              } else {
                console.log(`No texture found for logo layer ${layer.id}`);
              }
            }

            // Only apply preview effects if there are NO saved layers for this mesh
            // This prevents preview from interfering with layer management
            const meshHasLayers = applicableLayers.length > 0;
            
            if (!meshHasLayers && shouldModifyMesh(child.name, targetPart)) {
              console.log(`🔍 Applying preview effects to mesh "${child.name}" (no layers)`);
              
              // Only apply color if user has actually changed it
              if (hasColorChanged) {
                newMaterial.color = new THREE.Color(selectedColor);
                console.log(`🎨 Applied user-selected color: ${selectedColor}`);
              }

              // Apply preview texture if available
              if (previewTexture && selectedArtwork) {
                // Clone the preview texture to avoid modifying the original
                const previewTextureClone = previewTexture.clone();
                
                // Apply default transformations for preview
                previewTextureClone.repeat.set(1, 1);
                previewTextureClone.offset.set(0, 0);
                previewTextureClone.needsUpdate = true;
                
                newMaterial.map = previewTextureClone;
                console.log(`🖼️ Applied preview texture: ${selectedArtwork}`);
                
                // Apply reflectiveness to preview on pouch model
                if (isPouch && newMaterial instanceof THREE.MeshPhysicalMaterial) {
                  const physicalMaterial = newMaterial as THREE.MeshPhysicalMaterial;
                  physicalMaterial.roughness = 1.0 - (reflectiveness * 0.9);
                  physicalMaterial.metalness = reflectiveness * 0.4;
                  physicalMaterial.envMapIntensity = reflectiveness * 1.5;
                  physicalMaterial.clearcoat = reflectiveness * 0.5;
                  physicalMaterial.clearcoatRoughness = 1.0 - reflectiveness;
                  physicalMaterial.reflectivity = reflectiveness * 0.5;
                  physicalMaterial.ior = 1.33 + (reflectiveness * 0.2);
                  console.log(`✨ Applied reflectiveness ${reflectiveness} to preview texture on pouch`);
                }
              }
            } else if (meshHasLayers) {
              console.log(`🚫 Skipping preview effects for mesh "${child.name}" (has ${applicableLayers.length} layers)`);
            }

          }

          // Check if this is the blkjar model and if we're applying to the base
          const isBlkJar = modelPath.includes('blkjar.glb');
          const isBaseMesh = child.name.toLowerCase().includes('base');
          
          // For pouch model with layers but no reflectiveness applied in layer loop
          // (e.g., color layers or materials without explicit reflectiveness)
          if (isPouch && applicableLayers.length > 0 && newMaterial instanceof THREE.MeshPhysicalMaterial) {
            const hasArtworkLayer = applicableLayers.some(layer => layer.type === 'artwork');
            const hasMaterialLayer = applicableLayers.some(layer => layer.type === 'material');
            
            // Apply reflectiveness to any pouch mesh that didn't get it in the layer loop
            if (!hasArtworkLayer && !hasMaterialLayer) {
              const physicalMaterial = newMaterial as THREE.MeshPhysicalMaterial;
              physicalMaterial.roughness = 1.0 - (reflectiveness * 0.9);
              physicalMaterial.metalness = reflectiveness * 0.4;
              physicalMaterial.envMapIntensity = reflectiveness * 1.5;
              physicalMaterial.clearcoat = reflectiveness * 0.5;
              physicalMaterial.clearcoatRoughness = 1.0 - reflectiveness;
              physicalMaterial.reflectivity = reflectiveness * 0.5;
              physicalMaterial.ior = 1.33 + (reflectiveness * 0.2);
              console.log(`✨ Applied reflectiveness ${reflectiveness} to pouch mesh with non-artwork layers: ${child.name}`);
            }
          } 
          // For blkjar base with artwork, we need specific material settings
          else if (isBlkJar && isBaseMesh && applicableLayers.length > 0) {
            // For black glass with artwork, we need to ensure the texture is visible
            const hasArtwork = applicableLayers.some(layer => layer.type === 'artwork');
            
            if (hasArtwork) {
              // Make the material more opaque when artwork is applied
              newMaterial.transparent = true;
              newMaterial.opacity = 1.0; // Full opacity for artwork visibility
              newMaterial.roughness = 0.3; // Less rough for glass-like appearance
              newMaterial.metalness = 0.0; // No metalness for glass
              // Reset color to white to not interfere with texture
              newMaterial.color = new THREE.Color(0xffffff);
              console.log(`🎨 Applied special blkjar base material settings for artwork visibility`);
            } else {
              // Default black glass settings
              newMaterial.roughness = 0.1;
              newMaterial.metalness = 0.0;
              newMaterial.transparent = true;
              newMaterial.opacity = 0.9;
            }
          } else {
            // Default material optimization for other models
            newMaterial.roughness = 0.7; // Slightly matte for even lighting response
            newMaterial.metalness = 0.05; // Minimal metallic properties
          }
          
          // Apply user color only when explicitly changed and no layers are present
          if (applicableLayers.length === 0 && hasColorChanged) {
            newMaterial.color = new THREE.Color(selectedColor);
          }
          
          // For pouch models without layers, also apply reflectiveness to base material
          if (isPouch && applicableLayers.length === 0 && newMaterial instanceof THREE.MeshPhysicalMaterial) {
            const physicalMaterial = newMaterial as THREE.MeshPhysicalMaterial;
            physicalMaterial.roughness = 1.0 - (reflectiveness * 0.9);
            physicalMaterial.metalness = reflectiveness * 0.4;
            physicalMaterial.envMapIntensity = reflectiveness * 1.5;
            physicalMaterial.clearcoat = reflectiveness * 0.5;
            physicalMaterial.clearcoatRoughness = 1.0 - reflectiveness;
            physicalMaterial.reflectivity = reflectiveness * 0.5;
            physicalMaterial.ior = 1.33 + (reflectiveness * 0.2);
            console.log(`✨ Applied reflectiveness ${reflectiveness} to base pouch mesh: ${child.name}`);
          }
          
          // Always apply the new material (even if no layers - this resets the mesh)
          newMaterial.needsUpdate = true;
          child.material = newMaterial;
          child.material.needsUpdate = true;
          
          // FINAL CHECK: Ensure reflectiveness is applied to ALL pouch meshes
          if (isPouch && child.material instanceof THREE.MeshPhysicalMaterial) {
            const physicalMaterial = child.material as THREE.MeshPhysicalMaterial;
            // Log current material state
            console.log(`🔍 FINAL CHECK for pouch mesh "${child.name}":`, {
              currentRoughness: physicalMaterial.roughness,
              currentMetalness: physicalMaterial.metalness,
              currentClearcoat: physicalMaterial.clearcoat,
              currentEnvMapIntensity: physicalMaterial.envMapIntensity,
              reflectivenessValue: reflectiveness,
              hasTexture: !!physicalMaterial.map,
              materialType: physicalMaterial.type
            });
            
            // Force update if values don't match expected  
            const expectedRoughness = 1.0 - (reflectiveness * 0.9);
            if (Math.abs(physicalMaterial.roughness - expectedRoughness) > 0.01) {
              console.log(`⚠️ Roughness mismatch! Forcing update from ${physicalMaterial.roughness} to ${expectedRoughness}`);
              physicalMaterial.roughness = expectedRoughness;
              physicalMaterial.metalness = reflectiveness * 0.4;
              physicalMaterial.envMapIntensity = reflectiveness * 1.5;
              physicalMaterial.clearcoat = reflectiveness * 0.5;
              physicalMaterial.clearcoatRoughness = 1.0 - reflectiveness;
              physicalMaterial.reflectivity = reflectiveness * 0.5;
              physicalMaterial.ior = 1.33 + (reflectiveness * 0.2);
            }
          }
          
          // Force Three.js to update the material
          if (child.material && 'needsUpdate' in child.material) {
            child.material.needsUpdate = true;
            console.log(`🔄 Material updated for mesh: ${child.name}, type: ${child.material.type}, reflectiveness applied: ${isPouch}`);
          }

          if (applicableLayers.length > 0) {
            console.log(`✅ Applied ${applicableLayers.length} layers to mesh: ${child.name}`);
          } else {
            console.log(`🔄 Reset mesh "${child.name}" to original material (no layers)`, {
              hasStoredOriginal: !!storedOriginal,
              materialColor: newMaterial.color?.getHexString(),
              hasTexture: !!newMaterial.map
            });
          }
        }
      });
    }
  }, [scene, layerState.layers, layerState.activeLayerId, loadedTextures, selectedColor, targetPart, previewTexture, selectedArtwork, hasColorChanged, originalMaterials, modelScale, reflectiveness]);





  if (!scene) {
    return null;
  }

  return (
    <>
      <primitive object={scene} scale={modelScale} position={[0, 0, 0]} />
    </>
  );
}, (prevProps, nextProps) => {
  // Re-render Model if modelPath or reflectiveness changes
  return prevProps.modelPath === nextProps.modelPath && 
         prevProps.reflectiveness === nextProps.reflectiveness;
});



// Loading fallback component with animation for large files
function ModelLoader() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#4ade80" transparent opacity={0.7} />
    </mesh>
  );
}

const ModelViewer: React.FC<ModelViewerProps> = React.memo(function ModelViewer({ selectedProduct, selectedColor, selectedArtwork, targetPart, hasColorChanged, reflectiveness = 0.5 }) {
  console.log('🎯 ModelViewer received props:', { 
    product: selectedProduct?.name, 
    targetPart, 
    selectedColor, 
    hasColorChanged,
    artworkUrl: selectedArtwork,
    reflectiveness // Add reflectiveness to debug log
  });


  const [modelHeight, setModelHeight] = useState(0.2); // Default model height
  const [cameraDistance, setCameraDistance] = useState(10); // Default camera distance
  const [cameraY, setCameraY] = useState(0); // Default camera Y position
  
  // Debug log when targetPart changes
  useEffect(() => {
    console.log(`🎯 TARGET PART CHANGED TO: "${targetPart}"`);
  }, [targetPart]);



  // Handle product switching - this is the key fix for the carryover bug
  useEffect(() => {
    if (selectedProduct?.id && selectedProduct?.modelPath) {
      console.log(`🔄 ModelViewer: Product changed to "${selectedProduct.id}" (${selectedProduct.name})`);
      
      // Reset layer manager for new product
      layerManager.switchToProduct(selectedProduct.id);
      
      // Reset model state manager for new product  
      const newModelState = modelStateManager.switchToProduct(selectedProduct.id, selectedProduct.modelPath);
      
      // Update camera distance, camera Y, and model height from the new model state
      setCameraDistance(newModelState.cameraDistance);
      setCameraY(newModelState.cameraY);
      setModelHeight(newModelState.modelHeight);
      
      console.log(`🔄 ModelViewer: Applied camera distance ${newModelState.cameraDistance}, camera Y ${newModelState.cameraY}, and model height ${newModelState.modelHeight} for "${selectedProduct.modelPath}"`);
      console.log(`✅ ModelViewer: Successfully switched to product "${selectedProduct.id}" with clean state`);
    }
  }, [selectedProduct?.id]); // Only trigger when product ID changes

  // Handle model height changes from the camera controller
  const handleModelHeightChange = (height: number) => {
    setModelHeight(height);
  };

  // Camera distance is now handled by the product switching logic above
  // This ensures clean state when switching between products

  // Check if there are any draggable layers (disabled - logos now applied to mesh)
  const hasDraggableArtwork = false;

  return (
    <div className="h-full relative" style={{ backgroundColor: '#09090b' }}>
      {selectedProduct && selectedProduct.modelPath ? (
        <>
          {/* 3D Canvas */}
          <Canvas
            camera={{ 
              position: [0, cameraY, cameraDistance], 
              fov: 50 
            }}
            style={{ width: '100%', height: '100%' }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: "high-performance",
              preserveDrawingBuffer: false, // Disable for better memory management with large files
              logarithmicDepthBuffer: true, // Better depth precision for complex models
            }}
            dpr={[1, 1.5]} // Reduce DPR slightly for better performance with large models
            performance={{ min: 0.5 }} // Allow frame rate to drop for complex scenes
          >
            {/* Professional Product Photography Studio Lighting */}
            
            {/* Soft ambient base lighting - like overhead studio lighting */}
            <ambientLight intensity={0.6} color="#ffffff" />
            
            {/* Key light - main soft light from front-top (like a large softbox) */}
            <directionalLight 
              position={[2, 6, 4]} 
              intensity={0.8} 
              color="#ffffff"
              castShadow={false}
            />
            
            {/* Fill lights - multiple soft sources to eliminate shadows */}
            <pointLight position={[-3, 3, 3]} intensity={0.5} color="#ffffff" />
            <pointLight position={[3, 3, 3]} intensity={0.5} color="#ffffff" />
            <pointLight position={[0, 3, -3]} intensity={0.4} color="#ffffff" />
            
            {/* Side lights for even coverage (like studio strip lights) */}
            <pointLight position={[-6, 2, 0]} intensity={0.3} color="#ffffff" />
            <pointLight position={[6, 2, 0]} intensity={0.3} color="#ffffff" />
            
            {/* Bottom fill light to eliminate under-shadows */}
            <pointLight position={[0, -2, 0]} intensity={0.4} color="#ffffff" />
            
            {/* Clean studio environment for product visualization */}
            <Environment
              preset="studio"      // Clean studio HDRI without distracting elements
              background={false}   // Don't use as background, just for reflections
              blur={0.5}          // Moderate blur for subtle reflections
            />



            {/* 3D Model */}
            <Suspense fallback={<ModelLoader />}>
              {selectedProduct.modelPath ? (
                <Center>
                  <group position={[0, modelHeight, 0]}>
                    <Model
                      modelPath={selectedProduct.modelPath}
                      selectedColor={selectedColor}
                      selectedArtwork={selectedArtwork}
                      targetPart={targetPart}
                      hasColorChanged={hasColorChanged}
                      reflectiveness={reflectiveness}
                    />
                  </group>
                </Center>
              ) : (
                <ModelLoader />
              )}
            </Suspense>

            {/* Camera Controls - Rotation and zoom enabled */}
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              target={[0, 0, 0]}
              minDistance={0.5}
              maxDistance={20}
              mouseButtons={{
                LEFT: 0, // Left button for rotation
                MIDDLE: 1, // Middle button for zoom
                RIGHT: -1 // Disable right button to allow CameraHeightController
              }}
            />

            {/* Custom Camera Height Controller - Right-click for vertical movement */}
            <CameraHeightController
              enabled={true}
              minHeight={-2}
              maxHeight={2}
              sensitivity={0.005}
              onModelHeightChange={handleModelHeightChange}
            />
          </Canvas>





          {/* Artwork Control Instructions Overlay */}
          {hasDraggableArtwork && (
            <div className="absolute top-4 right-4 bg-blue-800/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-blue-600 max-w-xs">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-white text-sm font-medium">Logo Controls</p>
                  <p className="text-blue-200 text-xs">Click & drag to move • Scroll to resize</p>
                </div>
              </div>
            </div>
          )}


        </>
      ) : (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-700 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-400 mb-2">Select a Product</h3>
            <p className="text-gray-500">Choose a product from the sidebar to view its 3D model</p>
          </div>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if essential props change, not if layer state changes internally
  return (
    prevProps.selectedProduct?.id === nextProps.selectedProduct?.id &&
    prevProps.selectedColor === nextProps.selectedColor &&
    prevProps.selectedArtwork === nextProps.selectedArtwork &&
    prevProps.reflectiveness === nextProps.reflectiveness &&
    prevProps.targetPart === nextProps.targetPart &&
    prevProps.hasColorChanged === nextProps.hasColorChanged
  );
});

export default ModelViewer;
