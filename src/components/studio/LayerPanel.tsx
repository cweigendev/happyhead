import React, { useState, useEffect } from 'react';
import { layerManager, LayerState } from '@/lib/layerManager';
import { ButtonCta } from '../ui/ButtonCta';

interface LayerPanelProps {
  isVisible: boolean;
  onCreateLayer: () => void;
}

const LayerPanel: React.FC<LayerPanelProps> = ({ isVisible, onCreateLayer }) => {
  const [layerState, setLayerState] = useState<LayerState>({ layers: [], activeLayerId: null });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLayerName, setNewLayerName] = useState('');

  useEffect(() => {
    const unsubscribe = layerManager.subscribe(setLayerState);
    setLayerState(layerManager.getState());
    return unsubscribe;
  }, []);

  const handleCreateLayer = () => {
    setShowCreateForm(true);
    setNewLayerName(`Layer ${layerState.layers.length + 1}`);
  };

  const handleSaveNewLayer = () => {
    if (newLayerName.trim()) {
      onCreateLayer();
      setShowCreateForm(false);
      setNewLayerName('');
    }
  };

  const handleDeleteLayer = (layerId: string) => {
    if (confirm('Are you sure you want to delete this layer?')) {
      layerManager.deleteLayer(layerId);
    }
  };

  const getLayerIcon = (type: string) => {
    switch (type) {
      case 'color':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3V1m0 20v-2m8-10a4 4 0 014 4v4a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4a4 4 0 014-4z" />
          </svg>
        );
      case 'artwork':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getPartDisplayName = (part: string) => {
    switch (part) {
      case 'all': return 'All Parts';
      case 'top': return 'Top/Cap';
      case 'middle': return 'Middle/Body';
      case 'base': return 'Base/Bottom';
      default: return part;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed left-0 top-20 h-[calc(100vh-80px)] w-80 border-r z-20" style={{ backgroundColor: '#09090b', borderColor: '#2e2e2e' }}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b" style={{ borderBottomColor: '#2e2e2e' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Layers</h2>
            <ButtonCta
              label="Save"
              onClick={handleCreateLayer}
              className="h-8"
            />
          </div>
          
          {showCreateForm && (
            <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: '#1a1a1a' }}>
              <input
                type="text"
                value={newLayerName}
                onChange={(e) => setNewLayerName(e.target.value)}
                placeholder="Layer name"
                className="w-full p-2 border rounded text-white text-sm mb-2" style={{ backgroundColor: '#2e2e2e', borderColor: '#4a4a4a' }}
                autoFocus
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveNewLayer}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Layers List */}
        <div className="flex-1 overflow-y-auto p-4">
          {layerState.layers.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-sm">No layers yet</p>
              <p className="text-xs mt-1">Create a layer to start customizing</p>
            </div>
          ) : (
            <div className="space-y-2">
              {layerState.layers.map((layer) => (
                <div
                  key={layer.id}
                  className={`p-3 rounded-lg border transition-all cursor-pointer hover:bg-gray-700/50 ${
                    layerState.activeLayerId === layer.id
                      ? 'border-red-500/40'
                      : 'hover:border-gray-500'
                  }`}
                  style={{
                    backgroundColor: '#2e2e2e',
                    borderColor: layerState.activeLayerId === layer.id ? 'rgba(239, 68, 68, 0.4)' : '#2e2e2e'
                  }}
                  onClick={() => layerManager.setActiveLayer(layer.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          layerManager.toggleLayerVisibility(layer.id);
                        }}
                        className={`p-1 rounded ${layer.isVisible ? 'text-white' : 'text-gray-500'}`}
                      >
                        {layer.isVisible ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        )}
                      </button>
                      <div className="text-white">{getLayerIcon(layer.type)}</div>
                      <span className="text-white font-medium text-sm">{layer.name}</span>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLayer(layer.id);
                      }}
                      className="text-gray-400 hover:text-red-400 p-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    <div className="flex items-center justify-between">
                      <span>{getPartDisplayName(layer.targetPart)}</span>
                      <span className="capitalize">{layer.type}</span>
                    </div>
                    {layer.type === 'color' && (
                      <div className="flex items-center space-x-2 mt-1">
                        <div 
                          className="w-3 h-3 rounded border border-gray-500"
                          style={{ backgroundColor: layer.value }}
                        ></div>
                        <span>{layer.value}</span>
                      </div>
                    )}
                    {layer.type === 'artwork' && (
                      <div className="mt-1 text-gray-500 truncate">
                        {layer.value ? 'Custom artwork' : 'No artwork'}
                      </div>
                    )}
                  </div>

                  {/* Artwork Controls - Show only for active artwork layers */}
                  {layerState.activeLayerId === layer.id && layer.type === 'artwork' && (
                    <div className="mt-3 pt-3 border-t border-gray-600 space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-white text-xs font-medium">Layer Settings</div>
                        <div className="group relative">
                          <svg className="w-3 h-3 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-gray-900 text-gray-300 text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <p>Use these controls to adjust how your artwork appears on the 3D model:</p>
                            <ul className="mt-1 space-y-1">
                              <li>• <strong>Size:</strong> Scale the artwork</li>
                              <li>• <strong>Position X/Y:</strong> Move horizontally/vertically</li>
                              <li>• <strong>Position Z:</strong> Depth/distance from surface</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      {/* Size Control */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-gray-300 text-xs">Size</label>
                          <input
                            type="number"
                            min="0.01"
                            max="3"
                            step="0.01"
                            value={(layer.scale || 1.0).toFixed(2)}
                            onChange={(e) => {
                              e.stopPropagation();
                              const value = parseFloat(e.target.value);
                              if (!isNaN(value) && value >= 0.01 && value <= 3) {
                                layerManager.updateLayerScale(layer.id, value);
                              }
                            }}
                            className="w-12 px-1 py-0.5 bg-gray-700 border border-gray-600 rounded text-gray-300 text-xs text-center"
                          />
                        </div>
                        <input
                          type="range"
                          min="0.01"
                          max="3"
                          step="0.01"
                          value={layer.scale || 1.0}
                          onChange={(e) => {
                            e.stopPropagation();
                            layerManager.updateLayerScale(layer.id, parseFloat(e.target.value));
                          }}
                          className="w-full slider"
                        />
                      </div>

                      {/* Position X Control */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-gray-300 text-xs">Position X</label>
                          <span className="text-gray-400 text-xs">{(layer.position?.x || 0).toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min="-5"
                          max="5"
                          step="0.2"
                          value={layer.position?.x || 0}
                          onChange={(e) => {
                            e.stopPropagation();
                            const newPosition = {
                              x: parseFloat(e.target.value),
                              y: layer.position?.y || 0,
                              z: layer.position?.z || 0.1
                            };
                            layerManager.updateLayerPosition(layer.id, newPosition);
                          }}
                          className="w-full slider"
                        />
                      </div>

                      {/* Position Y Control */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-gray-300 text-xs">Position Y</label>
                          <span className="text-gray-400 text-xs">{(layer.position?.y || 0).toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min="-5"
                          max="5"
                          step="0.2"
                          value={layer.position?.y || 0}
                          onChange={(e) => {
                            e.stopPropagation();
                            const newPosition = {
                              x: layer.position?.x || 0,
                              y: parseFloat(e.target.value),
                              z: layer.position?.z || 0.1
                            };
                            layerManager.updateLayerPosition(layer.id, newPosition);
                          }}
                          className="w-full slider"
                        />
                      </div>

                      {/* Position Z Control */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-gray-300 text-xs">Position Z</label>
                          <span className="text-gray-400 text-xs">{(layer.position?.z || 0.1).toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min="-1"
                          max="2"
                          step="0.1"
                          value={layer.position?.z || 0.1}
                          onChange={(e) => {
                            e.stopPropagation();
                            const newPosition = {
                              x: layer.position?.x || 0,
                              y: layer.position?.y || 0,
                              z: parseFloat(e.target.value)
                            };
                            layerManager.updateLayerPosition(layer.id, newPosition);
                          }}
                          className="w-full slider"
                        />
                      </div>

                      {/* Reset Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          layerManager.updateLayerTransform(layer.id, { x: 0, y: 0, z: 0.1 }, 0.3);
                        }}
                        className="w-full mt-2 bg-gray-600 hover:bg-gray-500 text-white py-1 px-2 rounded text-xs"
                      >
                        Reset Position & Size
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {layerState.layers.length > 0 && (
          <div className="p-4 border-t" style={{ borderTopColor: '#2e2e2e' }}>
            <button
              onClick={() => {
                if (confirm('Clear all layers?')) {
                  layerManager.clearAllLayers();
                }
              }}
              className="w-full bg-gray-600 hover:bg-gray-500 text-white py-2 rounded text-sm"
            >
              Clear All Layers
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LayerPanel;
