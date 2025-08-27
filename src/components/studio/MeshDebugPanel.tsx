'use client';

import React, { useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface MeshDebugPanelProps {
  modelPath?: string;
  selectedPart?: string;
  targetPart?: string;
}

interface MeshInfo {
  name: string;
  type: string;
  detectedPart: string;
  position: [number, number, number];
  vertexCount: number;
}

const MeshDebugPanel: React.FC<MeshDebugPanelProps> = ({ modelPath, selectedPart = 'all', targetPart = 'all' }) => {
  const [meshes, setMeshes] = useState<MeshInfo[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Enhanced detection logic (same as ModelViewer)
  const detectPartFromMeshName = (meshName: string): string => {
    const name = meshName.toLowerCase();
    
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
    return 'unknown';
  };

  // Load and analyze model when path changes
  useEffect(() => {
    if (!modelPath) {
      setMeshes([]);
      return;
    }

    try {
      // This will only work if the model is already loaded
      const { scene } = useGLTF(modelPath);
      
      const foundMeshes: MeshInfo[] = [];
      
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          foundMeshes.push({
            name: child.name,
            type: child.type,
            detectedPart: detectPartFromMeshName(child.name),
            position: [child.position.x, child.position.y, child.position.z],
            vertexCount: child.geometry.attributes.position?.count || 0
          });
        }
      });
      
      setMeshes(foundMeshes);
    } catch (error) {
      console.error('Error analyzing model:', error);
      setMeshes([]);
    }
  }, [modelPath]);

  if (!modelPath) {
    return null;
  }

  const getPartColor = (part: string) => {
    switch (part) {
      case 'top': return 'text-green-400';
      case 'middle': return 'text-blue-400';
      case 'base': return 'text-orange-400';
      default: return 'text-red-400';
    }
  };

  const getPartBg = (part: string) => {
    switch (part) {
      case 'top': return 'bg-green-900/20 border-green-600';
      case 'middle': return 'bg-blue-900/20 border-blue-600';
      case 'base': return 'bg-orange-900/20 border-orange-600';
      default: return 'bg-red-900/20 border-red-600';
    }
  };

  return (
    <div className="fixed top-4 left-4 z-50 max-w-md">
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700 shadow-xl">
        {/* Header */}
        <div 
          className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-800/50"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-white text-sm font-medium">Mesh Debug</span>
            <span className="text-gray-400 text-xs">({meshes.length} meshes)</span>
          </div>
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="border-t border-gray-700 p-3 max-h-96 overflow-y-auto">
            <div className="text-xs text-gray-400 mb-3 space-y-1">
              <div>Model: {modelPath.split('/').pop()}</div>
              <div className="flex justify-between">
                <span>Selected Part: <span className="text-blue-400">{selectedPart}</span></span>
              </div>
              <div className="flex justify-between">
                <span>Target Part: <span className="text-green-400">{targetPart}</span></span>
              </div>

            </div>
            
            {meshes.length === 0 ? (
              <div className="text-gray-500 text-sm">No meshes found</div>
            ) : (
              <div className="space-y-2">
                {meshes.map((mesh, index) => {
                  const isTargeted = targetPart === 'all' || mesh.detectedPart === targetPart;
                  const borderClass = isTargeted ? 'border-yellow-400 shadow-yellow-400/20 shadow-lg' : getPartBg(mesh.detectedPart);
                  
                  return (
                    <div key={index} className={`p-2 rounded border ${borderClass} ${isTargeted ? 'ring-1 ring-yellow-400' : ''}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm font-medium">
                          {mesh.name || `Mesh ${index + 1}`}
                          {isTargeted && <span className="ml-2 text-yellow-400 text-xs">● TARGETED</span>}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${getPartColor(mesh.detectedPart)}`}>
                          {mesh.detectedPart}
                        </span>
                      </div>
                    <div className="text-xs text-gray-400 space-y-1">
                      <div>Type: {mesh.type}</div>
                      <div>Vertices: {mesh.vertexCount.toLocaleString()}</div>
                      <div>Position: [{mesh.position.map(p => p.toFixed(2)).join(', ')}]</div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
            
            {/* Legend */}
            <div className="mt-4 pt-3 border-t border-gray-700">
              <div className="text-xs text-gray-400 mb-2">Part Detection:</div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-green-400">● Top/Cap</span>
                <span className="text-blue-400">● Middle/Body</span>
                <span className="text-orange-400">● Base/Bottom</span>
                <span className="text-red-400">● Unknown</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeshDebugPanel;
