'use client';

import React, { useState, useEffect } from 'react';
import { materialManager, PBRMaterial } from '@/lib/materialManager';
import { layerManager } from '@/lib/layerManager';

interface MaterialSelectorProps {
  selectedPart: string;
  onMaterialApply?: (materialId: string, targetPart: string) => void;
}

const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  selectedPart,
  onMaterialApply
}) => {
  const [materials, setMaterials] = useState<PBRMaterial[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMaterials = async () => {
      setIsLoading(true);
      // Wait a bit for materials to load
      setTimeout(() => {
        const allMaterials = materialManager.getAllMaterials();
        setMaterials(allMaterials);
        setIsLoading(false);
      }, 500);
    };

    loadMaterials();
  }, []);

  const categories = ['all', 'wood', 'metal', 'fabric', 'plastic', 'concrete', 'leather'];

  const filteredMaterials = materials.filter(material => {
    const categoryMatch = selectedCategory === 'all' || material.category === selectedCategory;
    const partMatch = material.targetParts.includes(selectedPart) || material.targetParts.includes('all');
    return categoryMatch && partMatch;
  });

  const handleMaterialSelect = async (material: PBRMaterial) => {
    try {
      // Create a new layer with the PBR material
      const layerName = `${material.name} (${getPartName(selectedPart)})`;
      
      // For now, we'll use the diffuse map as the layer texture
      // The full PBR rendering will be handled by the ModelViewer
      const textureUrl = material.maps.diffuse || '';
      
      if (textureUrl) {
        layerManager.createLayer(layerName, 'material', selectedPart, textureUrl, {
          materialId: material.id,
          materialType: 'pbr'
        });
        
        onMaterialApply?.(material.id, selectedPart);
        console.log(`✅ Applied material "${material.name}" to ${selectedPart}`);
      }
    } catch (error) {
      console.error('❌ Failed to apply material:', error);
    }
  };

  const getPartName = (part: string): string => {
    switch (part) {
      case 'top': return 'Top/Cap';
      case 'middle': return 'Middle/Body';
      case 'base': return 'Base/Bottom';
      case 'all': return 'All Parts';
      default: return part;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'wood':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 2h16v2H4zm0 4h16v2H4zm0 4h16v2H4zm0 4h16v2H4zm0 4h16v2H4z" opacity="0.8"/>
          </svg>
        );
      case 'metal':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" opacity="0.3"/>
            <circle cx="12" cy="12" r="6" opacity="0.6"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
        );
      case 'fabric':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2 2h20v20H2z" opacity="0.3"/>
            <path d="M4 4h16v16H4z" opacity="0.6"/>
            <path d="M6 6h12v12H6z" opacity="0.9"/>
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <rect x="2" y="2" width="20" height="20" rx="2" opacity="0.6"/>
          </svg>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-gray-400 text-sm">Loading materials...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-white text-sm font-semibold mb-2">
          Apply to: {getPartName(selectedPart)}
        </h3>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-1 mb-3">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
        {filteredMaterials.length === 0 ? (
          <div className="col-span-2 text-center py-8">
            <p className="text-gray-400 text-sm">
              {materials.length === 0 
                ? 'No materials loaded. Add your Poliigon textures to get started.'
                : 'No materials found for this category and part.'
              }
            </p>
          </div>
        ) : (
          filteredMaterials.map(material => (
            <button
              key={material.id}
              onClick={() => handleMaterialSelect(material)}
              className="flex flex-col items-center p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-all group"
              title={`${material.name} - ${material.description}`}
            >
              <div className="text-gray-400 group-hover:text-white mb-2 transition-colors">
                {getCategoryIcon(material.category)}
              </div>
              <span className="text-xs text-gray-300 group-hover:text-white font-medium text-center transition-colors">
                {material.name}
              </span>
              <span className="text-xs text-gray-500 group-hover:text-gray-400 text-center mt-1 transition-colors">
                {material.resolution}
              </span>
            </button>
          ))
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
        <p className="text-blue-300 text-xs">
          <strong>💡 Tip:</strong> Place your Poliigon textures in the <code>/public/textures/materials/poliigon/</code> folder and update the materials.json file to add new materials.
        </p>
      </div>
    </div>
  );
};

export default MaterialSelector;
