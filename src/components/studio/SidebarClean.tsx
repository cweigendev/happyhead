'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/app/studio/page';
import { layerManager, CustomizationLayer, LayerState } from '@/lib/layerManager';
import { modelStateManager } from '@/lib/modelStateManager';
import { projectManager, SaveProjectRequest } from '@/lib/projectManager';
import { screenshotCapture } from '@/lib/screenshotUtils';
import PartSelector from './PartSelector';
import { ButtonCta } from '../ui/ButtonCta';

interface LayerItemProps {
  layer: CustomizationLayer;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onNameChange: (newName: string) => void;
}

const LayerItemWithControls: React.FC<LayerItemProps> = ({ layer, isActive, onSelect, onDelete, onNameChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(layer.name);
  const [showControls, setShowControls] = useState(false);

  const handleNameSave = () => {
    if (editName.trim() && editName !== layer.name) {
      onNameChange(editName.trim());
    }
    setIsEditing(false);
  };

  const handleNameCancel = () => {
    setEditName(layer.name);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      handleNameCancel();
    }
  };

  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const currentPosition = layer.position || { x: 0, y: 0, z: 0 };
    const newPosition = { ...currentPosition, [axis]: value };
    console.log(`🎛️ SLIDER UPDATE: Position ${axis} = ${value} for layer ${layer.id} (${layer.name})`);
    console.log(`🎛️ New position:`, newPosition);
    const result = layerManager.updateLayerPosition(layer.id, newPosition);
    console.log(`🎛️ LayerManager update result:`, result);
  };

  const handleScaleChange = (value: number) => {
    console.log(`🎛️ SLIDER UPDATE: Scale = ${value} for layer ${layer.id} (${layer.name})`);
    const result = layerManager.updateLayerScale(layer.id, value);
    console.log(`🎛️ LayerManager update result:`, result);
  };

  const resetTransform = () => {
    // Both logos and artwork now use mesh surface positioning
    const defaultPosition = { x: 0, y: 0, z: 0.1 };
    const defaultScale = 1.0; // 100% scale - auto-scale determines optimal base size
    layerManager.updateLayerTransform(layer.id, defaultPosition, defaultScale);
  };

  const getThumbnail = () => {
    if (layer.type === 'color') {
      return (
        <div 
          className="w-6 h-6 rounded-md border border-gray-500 shadow-sm flex-shrink-0"
          style={{ backgroundColor: layer.value }}
        />
      );
    } else if (layer.type === 'artwork') {
      return (
        <div className="w-6 h-6 rounded-md border border-gray-500 shadow-sm overflow-hidden flex-shrink-0 bg-gray-600">
          <img
            src={layer.value}
            alt={layer.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center">
                    <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                `;
              }
            }}
          />
        </div>
      );
    }
    return null;
  };

  const getTypeIcon = () => {
    if (layer.type === 'color') {
      return (
        <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3V1m0 20v-2m8-10a4 4 0 014 4v4a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4a4 4 0 014-4z" />
        </svg>
      );
    } else if (layer.type === 'artwork') {
      return (
        <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div
      className={`group relative rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md ${
        isActive
          ? 'border border-red-500/40' : ''
      }`}
      style={{
        backgroundColor: isActive ? '#2e2e2e' : '#2e2e2e',
        borderColor: isActive ? 'rgba(239, 68, 68, 0.4)' : '#2e2e2e'
      }}
      onClick={onSelect}
    >
      <div className="p-2">
        <div className="flex items-center space-x-2">
          {/* Thumbnail */}
          {getThumbnail()}
          
          {/* Layer Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1 mb-1">
              {getTypeIcon()}
              {isEditing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyDown={handleKeyPress}
                  className="bg-gray-600 border border-gray-500 rounded px-1 py-0.5 text-white text-xs font-medium flex-1 min-w-0"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span 
                  className="text-white text-xs font-medium truncate flex-1 cursor-text"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  title={layer.name}
                >
                  {layer.name}
                </span>
              )}
            </div>
            
            {/* Layer Details */}
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="truncate">
                {layer.targetPart === 'all' ? 'All Parts' :
                 layer.targetPart === 'top' ? 'Top/Cap' :
                 layer.targetPart === 'middle' ? 'Middle/Body' :
                 layer.targetPart === 'base' ? 'Base/Bottom' : layer.targetPart}
              </span>
              <div className="flex items-center space-x-1">
                {/* Transform Controls Button - only show for artwork/logo layers */}
                {layer.type === 'artwork' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowControls(!showControls);
                    }}
                    className={`p-0.5 rounded transition-colors ${
                      showControls ? 'text-blue-400 bg-blue-500/20' : 'text-gray-400 hover:text-blue-400'
                    }`}
                    title="Size & Position Controls"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                )}

                {/* Visibility Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    layerManager.toggleLayerVisibility(layer.id);
                  }}
                  className={`p-0.5 rounded transition-colors ${
                    layer.isVisible ? 'text-white hover:text-gray-300' : 'text-gray-500 hover:text-gray-400'
                  }`}
                  title={layer.isVisible ? 'Hide layer' : 'Show layer'}
                >
                  {layer.isVisible ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  )}
                </button>
                
                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this layer?')) {
                      onDelete();
                    }
                  }}
                  className="p-0.5 rounded text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete layer"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transform Controls Dropdown - INSIDE the layer card */}
        {showControls && layer.type === 'artwork' && (
          <div className="mt-3 pt-3 border-t rounded-b-md -mx-2 -mb-2 px-2 pb-2" style={{ borderTopColor: '#2e2e2e', backgroundColor: '#1a1a1a' }}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-white">Size & Position</h4>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetTransform();
                }}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                title="Reset to defaults"
              >
                Reset
              </button>
            </div>

            {/* Size Control */}
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-300 mb-1">Size</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0.01"
                  max="7.5"
                  step="0.01"
                  value={layer.scale || 1.0}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleScaleChange(parseFloat(e.target.value));
                  }}
                  className="flex-1 slider"
                />
                <span className="text-xs text-gray-400 w-12 text-right">
                  {((layer.scale || 1.0) * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Position Controls */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-300">Position</label>
              
              {/* X Position */}
              <div className="flex items-center space-x-2">
                <label className="text-xs text-gray-400 w-3">X</label>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.2"
                  value={layer.position?.x || 0}
                  onChange={(e) => {
                    e.stopPropagation();
                    handlePositionChange('x', parseFloat(e.target.value));
                  }}
                  className="flex-1 slider"
                />
                <span className="text-xs text-gray-400 w-10 text-right">
                  {(layer.position?.x || 0).toFixed(1)}
                </span>
              </div>

              {/* Y Position */}
              <div className="flex items-center space-x-2">
                <label className="text-xs text-gray-400 w-3">Y</label>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.2"
                  value={layer.position?.y || 0}
                  onChange={(e) => {
                    e.stopPropagation();
                    handlePositionChange('y', parseFloat(e.target.value));
                  }}
                  className="flex-1 slider"
                />
                <span className="text-xs text-gray-400 w-10 text-right">
                  {(layer.position?.y || 0).toFixed(1)}
                </span>
              </div>

              {/* Z Position */}
              <div className="flex items-center space-x-2">
                <label className="text-xs text-gray-400 w-3">Z</label>
                <input
                  type="range"
                  min="-1"
                  max="2"
                  step="0.1"
                  value={layer.position?.z || 0}
                  onChange={(e) => {
                    e.stopPropagation();
                    handlePositionChange('z', parseFloat(e.target.value));
                  }}
                  className="flex-1 slider"
                />
                <span className="text-xs text-gray-400 w-10 text-right">
                  {(layer.position?.z || 0).toFixed(1)}
                </span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mt-2 pt-2 border-t" style={{ borderTopColor: '#2e2e2e' }}>
              <label className="block text-xs font-medium text-gray-300 mb-1">Quick Presets</label>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    layerManager.updateLayerTransform(layer.id, { x: 0, y: 0, z: 0 }, 0.3);
                  }}
                  className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs text-white rounded transition-colors"
                >
                  Center
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    layerManager.updateLayerTransform(layer.id, { x: -2, y: 2, z: 0 }, 0.25);
                  }}
                  className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs text-white rounded transition-colors"
                >
                  Top Left
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    layerManager.updateLayerTransform(layer.id, { x: 2, y: 2, z: 0 }, 0.25);
                  }}
                  className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs text-white rounded transition-colors"
                >
                  Top Right
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    layerManager.updateLayerTransform(layer.id, { x: 0, y: -2, z: 0 }, 0.3);
                  }}
                  className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs text-white rounded transition-colors"
                >
                  Bottom
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Active indicator */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-orange-500 rounded-l-lg"></div>
      )}
    </div>
  );
};

interface CustomizationSidebarProps {
  isVisible: boolean;
  selectedProduct: Product | null;
  onColorChange: (color: string, targetPart?: string) => void;
  onArtworkChange: (artwork: string, targetPart?: string) => void;
  onWidthChange?: (width: number) => void;
  bottomPanelHeight?: number;
  selectedPart: string;
  onPartSelect: (part: string) => void;
  onToggleCollapse?: (isCollapsed: boolean) => void;
  reflectiveness?: number;
  onReflectivenessChange?: (value: number) => void;
}

const CustomizationSidebar: React.FC<CustomizationSidebarProps> = ({
  isVisible,
  selectedProduct,
  onColorChange,
  onArtworkChange,
  onWidthChange,
  bottomPanelHeight = 48,
  selectedPart,
  onPartSelect,
  onToggleCollapse,
  reflectiveness = 0.5,
  onReflectivenessChange
}) => {

  const [selectedColor, setSelectedColor] = useState('#ff4444');
  const [selectedArtwork, setSelectedArtwork] = useState<string>('');
  const [layerState, setLayerState] = useState<LayerState>({ layers: [], activeLayerId: null });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  // Debug log for bottom panel height changes
  useEffect(() => {
    console.log('Sidebar: Bottom panel height changed to:', bottomPanelHeight);
  }, [bottomPanelHeight]);

  // Debug selectedProduct changes
  useEffect(() => {
    console.log('🎯 SIDEBAR: selectedProduct changed:', selectedProduct);
  }, [selectedProduct]);
  
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [layersHeight, setLayersHeight] = useState(200);
  const [partSelectorHeight, setPartSelectorHeight] = useState(280);
  const [isResizingVertical, setIsResizingVertical] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = layerManager.subscribe(setLayerState);
    setLayerState(layerManager.getState());
    return unsubscribe;
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleVerticalMouseDown = (section: string) => (e: React.MouseEvent) => {
    setIsResizingVertical(section);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = window.innerWidth - e.clientX;
        const minWidth = 280;
        const maxWidth = 600;
        
        if (newWidth >= minWidth && newWidth <= maxWidth) {
          setSidebarWidth(newWidth);
          onWidthChange?.(newWidth);
        }
      } else if (isResizingVertical) {
        const sidebarRect = document.querySelector('[data-sidebar="true"]')?.getBoundingClientRect();
        if (!sidebarRect) return;
        
        const relativeY = e.clientY - sidebarRect.top;
        const minHeight = 100;
        const maxHeight = 400;
        
        if (isResizingVertical === 'layers') {
          const newHeight = Math.max(minHeight, Math.min(maxHeight, relativeY - 20));
          setLayersHeight(newHeight);
        } else if (isResizingVertical === 'partSelector') {
          const layersBottom = layersHeight + 80;
          const newHeight = Math.max(minHeight, Math.min(maxHeight, relativeY - layersBottom));
          setPartSelectorHeight(newHeight);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setIsResizingVertical(null);
    };

    if (isResizing || isResizingVertical) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isResizing ? 'ew-resize' : 'ns-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, isResizingVertical, layersHeight, onWidthChange]);

  const modelParts = [
    { id: 'all', name: 'All Parts', description: 'Apply to entire model' },
    { id: 'top', name: 'Top/Cap', description: 'Upper part of the jar' },
    { id: 'middle', name: 'Middle/Body', description: 'Main body of the jar' },
    { id: 'base', name: 'Base/Bottom', description: 'Bottom part of the jar' },
  ];

  const handleToggleCollapse = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onToggleCollapse) {
      onToggleCollapse(newCollapsedState);
    }
  };

  // Save project functionality
  const handleSaveProject = async () => {
    if (!selectedProduct) {
      alert('Please select a product first');
      return;
    }

    if (isSaving) {
      return;
    }

    // Generate default project name if none provided
    const defaultName = projectName.trim() || `${selectedProduct.name} Project ${new Date().toLocaleDateString()}`;
    
    try {
      setIsSaving(true);

      // Get current model state
      const currentModelState = modelStateManager.getCurrentState();
      
      if (!currentModelState) {
        // If no model state exists, create a basic one
        modelStateManager.initializeForProduct(selectedProduct.id, selectedProduct.modelPath || '');
      }

      // Try again to get model state
      const finalModelState = modelStateManager.getCurrentState();
      if (!finalModelState) {
        throw new Error('Unable to create or retrieve model state');
      }

      // Get current layer state
      const currentLayerState = layerManager.getState();

      // Capture screenshot for thumbnail
      let finalThumbnail: string;
      try {
        const thumbnail = await screenshotCapture.captureWithRetry(3, 1000, {
          width: 300,
          height: 300,
          quality: 0.8,
          format: 'image/jpeg'
        });
        finalThumbnail = thumbnail || screenshotCapture.generatePlaceholderThumbnail(selectedProduct.name);
      } catch (screenshotError) {
        console.warn('Screenshot failed, using placeholder:', screenshotError);
        finalThumbnail = screenshotCapture.generatePlaceholderThumbnail(selectedProduct.name);
      }

      // Prepare save request
      const saveRequest: SaveProjectRequest = {
        name: defaultName,
        description: projectDescription.trim() || undefined,
        modelState: finalModelState,
        layerState: currentLayerState,
        selectedProduct: {
          id: selectedProduct.id,
          name: selectedProduct.name,
          modelPath: selectedProduct.modelPath || ''
        },
        thumbnail: finalThumbnail
      };

      // Save project using project manager
      const result = await projectManager.saveProject(saveRequest);

      if (result.success) {
        console.log('✅ Project saved successfully!', result.projectId);
        alert(`✅ Project "${defaultName}" saved successfully!`);
        
        // Reset modal state
        setSaveModalOpen(false);
        setProjectName('');
        setProjectDescription('');
      } else {
        throw new Error(result.error || 'Failed to save project');
      }

    } catch (error) {
      console.error('❌ Save failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`❌ Failed to save project: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Quick save without modal
  const handleQuickSave = async () => {
    if (!selectedProduct) {
      alert('Please select a product first');
      return;
    }

    if (isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      
      // Use product name and timestamp for quick save
      const quickName = `${selectedProduct.name} - ${new Date().toLocaleString()}`;
      
      // Get current states
      const currentModelState = modelStateManager.getCurrentState();
      const currentLayerState = layerManager.getState();
      
      if (!currentModelState) {
        // If no model state exists, create a basic one
        modelStateManager.initializeForProduct(selectedProduct.id, selectedProduct.modelPath || '');
      }

      // Try again to get model state
      const finalModelState = modelStateManager.getCurrentState();
      if (!finalModelState) {
        throw new Error('Unable to create or retrieve model state');
      }

      // Capture thumbnail with fallback
      let thumbnail: string;
      try {
        thumbnail = await screenshotCapture.captureThreeJSScreenshot({
          width: 300,
          height: 300,
          quality: 0.7
        }) || screenshotCapture.generatePlaceholderThumbnail(selectedProduct.name);
      } catch (screenshotError) {
        console.warn('Screenshot failed, using placeholder:', screenshotError);
        thumbnail = screenshotCapture.generatePlaceholderThumbnail(selectedProduct.name);
      }

      const saveRequest: SaveProjectRequest = {
        name: quickName,
        modelState: finalModelState,
        layerState: currentLayerState,
        selectedProduct: {
          id: selectedProduct.id,
          name: selectedProduct.name,
          modelPath: selectedProduct.modelPath || ''
        },
        thumbnail
      };

      const result = await projectManager.saveProject(saveRequest);

      if (result.success) {
        console.log('✅ Project saved successfully!', result.projectId);
        alert(`✅ Project saved successfully as "${quickName}"`);
      } else {
        throw new Error(result.error || 'Failed to save project');
      }

    } catch (error) {
      console.error('❌ Save failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`❌ Failed to save project: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      data-sidebar="true"
      className={`fixed rounded-lg shadow-lg transform transition-all duration-300 ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
      } z-10`}
      style={{
        top: '80px',
        right: '20px',
        width: `${sidebarWidth}px`,
        height: `calc(100vh - 100px - ${bottomPanelHeight}px - 20px)`,
        backgroundColor: '#09090b',
        border: '1px solid #2e2e2e',
        transition: 'transform 0.5s ease-in-out, height 0.3s ease-in-out, width 0.3s ease-in-out'
      }}
    >
      {/* Resize handle - only show when not collapsed */}
      {!isCollapsed && (
        <div
          className={`absolute left-0 top-0 w-1 h-full cursor-ew-resize hover:bg-gray-600 transition-colors ${
            isResizing ? 'bg-gray-600' : 'bg-transparent'
          }`}
          onMouseDown={handleMouseDown}
        />
      )}



      <div className="h-full flex flex-col pl-1 overflow-y-auto">
        <div className="border-b flex-shrink-0" style={{ minHeight: '150px', maxHeight: `${layersHeight}px`, borderBottomColor: '#2e2e2e' }}>
          <div className="p-1 h-full flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between mb-1 flex-shrink-0">
              <h2 className="text-xs font-semibold text-white">
                Layers
              </h2>
              <div className="flex items-center space-x-1">
                {/* Save button moved to navigation bar */}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {layerState.layers.length === 0 ? (
                <div className="text-center text-gray-400 py-2">
                  <p className="text-xs">No layers yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {layerState.layers.map((layer) => (
                    <LayerItemWithControls
                      key={layer.id}
                      layer={layer}
                      isActive={layerState.activeLayerId === layer.id}
                      onSelect={() => layerManager.setActiveLayer(layer.id)}
                      onDelete={() => layerManager.deleteLayer(layer.id)}
                      onNameChange={(newName) => layerManager.updateLayer(layer.id, { name: newName })}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className={`h-1 cursor-ns-resize hover:bg-gray-600 transition-colors border-b ${
            isResizingVertical === 'layers' ? 'bg-gray-600' : 'bg-transparent'
          }`}
          style={{ borderBottomColor: '#2e2e2e' }}
          onMouseDown={handleVerticalMouseDown('layers')}
        />

        <div className="p-1 border-b flex-shrink-0" style={{ borderBottomColor: '#2e2e2e' }}>
          <h2 className="text-xs font-semibold text-white mb-0.5">Select Part to Customize</h2>
        </div>

        <div className="flex-shrink-0" style={{ minHeight: '200px', maxHeight: `${partSelectorHeight}px` }}>
          <div className="p-1 h-full overflow-y-auto">
            {selectedProduct?.modelPath ? (
              <PartSelector
                modelPath={selectedProduct.modelPath}
                selectedPart={selectedPart}
                onPartSelect={onPartSelect}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-400">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <p className="text-xs">No model selected</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reflectiveness Control for Pouch Model (Global) */}
        {(selectedProduct?.modelPath?.includes('pouch') || selectedProduct?.id === 'pouch') && (
          <div className="p-3 border-t" style={{ borderTopColor: '#2e2e2e' }}>
            <h2 className="text-xs font-semibold text-white mb-3">Material Properties</h2>
            
            <div className="space-y-3">
              {/* Reflectiveness/Shininess Control */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-300">Reflectiveness / Shininess</label>
                  <span className="text-xs text-gray-400 w-12 text-right">
                    {Math.round(reflectiveness * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={reflectiveness}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    console.log(`🎛️ Reflectiveness slider changed to: ${value}`);
                    onReflectivenessChange?.(value);
                  }}
                  className="w-full slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Matte</span>
                  <span>Glossy</span>
                </div>
              </div>

              {/* Helper text */}
              <p className="text-xs text-gray-400 italic">
                Adjust to simulate glossy prints and reflective stickers on the pouch material.
              </p>
            </div>
          </div>
        )}


      </div>

      {/* Save Project Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw] border border-gray-600">
            <h3 className="text-lg font-semibold text-white mb-4">Save Project</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Project Name*
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder={`${selectedProduct?.name || 'Model'} Project ${new Date().toLocaleDateString()}`}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Add a description for this project..."
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setSaveModalOpen(false);
                  setProjectName('');
                  setProjectDescription('');
                }}
                disabled={isSaving}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <ButtonCta
                onClick={handleSaveProject}
                label={isSaving ? "Saving..." : "Save Project"}
                disabled={isSaving}
                className="px-4 py-2"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomizationSidebar;
