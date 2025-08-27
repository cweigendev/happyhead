import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, Center } from '@react-three/drei';
import * as THREE from 'three';

interface PartSelectorProps {
  modelPath: string;
  selectedPart: string;
  onPartSelect: (part: string) => void;
}

// Interactive mesh component for individual meshes
function InteractiveMesh({ 
  mesh, 
  selectedPart, 
  hoveredPart, 
  onPartSelect,
  onHover,
  onUnhover,
  getPartFromMeshName 
}: { 
  mesh: THREE.Mesh;
  selectedPart: string;
  hoveredPart: string | null;
  onPartSelect: (part: string) => void;
  onHover: (part: string) => void;
  onUnhover: () => void;
  getPartFromMeshName: (meshName: string) => string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Determine if this mesh should be highlighted
  const meshPart = getPartFromMeshName(mesh.name);
  const isSelected = meshPart === selectedPart || selectedPart === 'all';
  const isHovered = meshPart === hoveredPart;
  
  // Create material based on state
  const originalMaterial = mesh.material as THREE.MeshStandardMaterial;
  const material = originalMaterial.clone();
  
  // Base gray material
  material.color = new THREE.Color(0x666666); // Medium gray
  material.emissive = new THREE.Color(0x000000);
  material.metalness = 0.1;
  material.roughness = 0.8;

  if (isSelected && selectedPart !== 'all') {
    // Highlight selected part with green
    material.color = new THREE.Color(0x44ff44); // Bright green
    material.emissive = new THREE.Color(0x002200); // Dark green emissive
  } else if (isHovered) {
    // Highlight hovered part with light green
    material.color = new THREE.Color(0x88ff88); // Light green
    material.emissive = new THREE.Color(0x001100); // Very dark green emissive
  }

  // Handle click
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onPartSelect(meshPart);
  };

  // Handle hover
  const handleHover = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onHover(meshPart);
    document.body.style.cursor = 'pointer';
  };

  // Handle unhover
  const handleUnhover = () => {
    onUnhover();
    document.body.style.cursor = 'default';
  };

  return (
    <mesh
      ref={meshRef}
      geometry={mesh.geometry}
      material={material}
      position={mesh.position}
      rotation={mesh.rotation}
      scale={mesh.scale}
      onClick={handleClick}
      onPointerOver={handleHover}
      onPointerOut={handleUnhover}
    />
  );
}

// Interactive model component
function InteractiveModel({ 
  modelPath, 
  selectedPart, 
  onPartSelect 
}: { 
  modelPath: string;
  selectedPart: string;
  onPartSelect: (part: string) => void;
}) {
  const { scene } = useGLTF(modelPath);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [meshes, setMeshes] = useState<THREE.Mesh[]>([]);

  // Enhanced function to determine part from mesh name (matches ModelViewer logic)
  const getPartFromMeshName = (meshName: string): string => {
    const name = meshName.toLowerCase();

    // Special handling for pouch model meshes
    // Plane001_1 is typically the artwork layer (second material)
    if (name === 'plane001_1' || name.includes('_1')) {
      return 'artwork';
    }
    
    // Plane001 (without _1) is typically the base/bag color
    if (name === 'plane001' || name.includes('plane001')) {
      return 'base';
    }
    
    // Generic artwork detection
    if (name.includes('artwork') || name.includes('logo') || name.includes('label')) {
      return 'artwork';
    }
    
    // For other pouch-related names
    if (name.includes('pouch') || name.includes('plane') || name.includes('bag') || name.includes('packet')) {
      return 'base';
    }

    // Enhanced detection for top/cap parts
    if (name.includes('top') || name.includes('cap') || name.includes('lid') || 
        name.includes('cover') || name.includes('upper') || name.includes('head') ||
        name.includes('cork') || name.includes('closure') || name.includes('stopper') ||
        // Glass jar specific names
        name.includes('jar_top') || name.includes('jartop') || name.includes('jar.top') ||
        name.includes('glass_top') || name.includes('glasstop') ||
        // Generic mesh names that might indicate top part
        (name.includes('001') && name.includes('jar')) || // Often the first mesh is the top
        name.includes('_001') || name.endsWith('001') ||
        // Common Blender export names for top parts
        name.includes('cylinder.001') || name.includes('sphere.001')) {
      return 'top';
    } else if (name.includes('middle') || name.includes('body') || name.includes('main') || 
               name.includes('center') || name.includes('container') || name.includes('vessel') ||
               name.includes('inner') || name.includes('interior') ||
               name.includes('jar_body') || name.includes('jarbody') || name.includes('jar.body')) {
      return 'middle';
    } else if (name.includes('base') || name.includes('bottom') || name.includes('foundation') || 
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
               // Sometimes the main jar body is considered the base
               (name.includes('jar') && !name.includes('top') && !name.includes('cap') && !name.includes('lid')) ||
               // If it's the only mesh or main mesh, treat as base
               (name.includes('mesh') && !name.includes('top') && !name.includes('cap')) ||
               // Common default mesh names that should be treated as base
               name === 'mesh' || name === 'object' || name === 'group' || name === 'scene') {
      return 'base';
    }
    return 'all';
  };

  // Extract meshes from scene
  useEffect(() => {
    if (scene) {
      const foundMeshes: THREE.Mesh[] = [];
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          foundMeshes.push(child);
        }
      });
      setMeshes(foundMeshes);
    }
  }, [scene]);

  // Handle hover events
  const handleHover = (part: string) => {
    setHoveredPart(part);
  };

  const handleUnhover = () => {
    setHoveredPart(null);
  };

  // Use normalized scaling - all models appear same size in preview
  const getModelScale = (modelPath: string) => {
    const modelFileName = modelPath.split('/').pop() || '';
    // Make all models appear roughly the same size in the preview - 4x larger
    const PREVIEW_SCALE = 32.0; // Unified scale 4x larger for better interaction
    const modelScales: { [key: string]: number } = {
      'glassjar.glb': PREVIEW_SCALE,  // Glass jar
      'glassjar1.glb': PREVIEW_SCALE, // Glass jar 1
      'glassjar2.glb': PREVIEW_SCALE, // Glass jar 2
      'jar.glb': PREVIEW_SCALE,       // Child-resistant jar
      'blkjar.glb': PREVIEW_SCALE,    // BlkJar - same size as others
      'pouch.glb': 0.1, // Child Resistant Pouch - very small scale as requested
    };
    return modelScales[modelFileName] || PREVIEW_SCALE; // Default scale
  };

  const scaleValue = getModelScale(modelPath);

  return (
    <group
      scale={[scaleValue, scaleValue, scaleValue]}
      position={[0, 0, 0]}
      rotation={modelPath.includes('pouch.glb') ? [Math.PI / 2, 0, 0] : [0, 0, 0]}
    >
      {meshes.map((mesh, index) => (
        <InteractiveMesh
          key={`${mesh.name}-${index}`}
          mesh={mesh}
          selectedPart={selectedPart}
          hoveredPart={hoveredPart}
          onPartSelect={onPartSelect}
          onHover={handleHover}
          onUnhover={handleUnhover}
          getPartFromMeshName={getPartFromMeshName}
        />
      ))}
    </group>
  );
}

const PartSelector: React.FC<PartSelectorProps> = ({ modelPath, selectedPart, onPartSelect }) => {
  const getPartDisplayName = (part: string) => {
    switch (part) {
      case 'all': return 'All Parts';
      case 'top': return 'Top/Cap';
      case 'middle': return 'Middle/Body';
      case 'base': return 'Base/Bottom';
      case 'artwork': return 'Artwork Area';
      default: return part;
    }
  };
  
  // Debug log when part selection changes
  React.useEffect(() => {
    console.log(`🎯 PartSelector: Selected part changed to "${selectedPart}"`);
  }, [selectedPart]);

  const getPartColor = (part: string) => {
    switch (part) {
      case 'top': return 'bg-green-500';
      case 'middle': return 'bg-green-500';
      case 'base': return 'bg-green-500';
      case 'artwork': return 'bg-blue-500';
      case 'all': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="mb-2">
      {/* Mini 3D Model Viewer */}
      <div className="h-32 w-full mb-1 mt-1">

        <Canvas
          camera={{ 
            position: modelPath?.includes('pouch.glb') 
              ? [0, 0, 60]  // Much further back for pouch preview
              : [0, 0, 24], // Default distance for other models
            fov: 50 
          }}
          style={{ width: '100%', height: '100%' }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "default"
          }}
        >
          {/* Much brighter lighting for preview */}
          <ambientLight intensity={2.4} color="#ffffff" />
          <directionalLight 
            position={[2, 6, 4]} 
            intensity={3.0} 
            color="#ffffff"
            castShadow={false}
          />
          <pointLight position={[-3, 3, 3]} intensity={2.0} color="#ffffff" />
          <pointLight position={[3, 3, 3]} intensity={2.0} color="#ffffff" />
          <pointLight position={[0, 3, -3]} intensity={1.6} color="#ffffff" />
          <Environment preset="studio" background={false} blur={0.5} intensity={0.3} rotation={[0, Math.PI / 2, 0]} />

          {modelPath && (
            <Center>
              <group position={[
                0, 
                modelPath?.includes('jar.glb') ? -0.65 : modelPath?.includes('blkjar') ? 0 : 0.2, 
                0
              ]}>
                <Suspense fallback={null}>
                  <InteractiveModel
                    modelPath={modelPath}
                    selectedPart={selectedPart}
                    onPartSelect={onPartSelect}
                  />
                </Suspense>
              </group>
            </Center>
          )}

          <OrbitControls
            enabled={false}
            enablePan={false}
            enableZoom={false}
            enableRotate={false}
            autoRotate={false}
          />
        </Canvas>
      </div>

      {/* Instructions */}
      <div className="mb-1">
        <p className="text-xs text-gray-400 text-center">
          Click on different parts of the model to select them
        </p>
      </div>

      {/* Current Selection Display */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-1 text-xs">
          <div className={`w-2 h-2 rounded-full ${getPartColor(selectedPart)}`}></div>
          <span className="text-gray-300 font-medium">{getPartDisplayName(selectedPart)}</span>
        </div>
      </div>

      {/* Part Selection Buttons */}
      <div className="mt-2 space-y-1">
        {/* All Parts button removed per user request */}
      </div>
    </div>
  );
};

export default PartSelector;