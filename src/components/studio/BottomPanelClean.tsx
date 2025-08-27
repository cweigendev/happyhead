'use client';

import React, { useState, useEffect, useRef } from 'react';
import { layerManager } from '@/lib/layerManager';
import MaterialSelector from './MaterialSelector';
import { ButtonCta } from '../ui/ButtonCta';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';



interface BottomPanelProps {
  isVisible: boolean;
  onColorChange: (color: string, targetPart?: string) => void;
  onArtworkChange: (artwork: string, targetPart?: string) => void;
  onPanelStateChange?: (isExpanded: boolean, height: number) => void;
  selectedPart: string;
  onToggleCollapse?: (isCollapsed: boolean) => void;
  sidebarWidth?: number;
  sidebarCollapsed?: boolean;
}

const BottomPanel: React.FC<BottomPanelProps> = ({
  isVisible,
  onColorChange,
  onArtworkChange,
  onPanelStateChange,
  selectedPart,
  onToggleCollapse,
  sidebarWidth = 320,
  sidebarCollapsed = false
}) => {
  const [selectedColor, setSelectedColor] = useState('#ff4444');
  
  // Pantone Shades palette - 6 colors
  const pantoneShades = [
    '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF', '#E6CCFF'
  ];
  
  // High-fidelity material options
  const materials = [
    { 
      id: 'wood', 
      name: 'Wood', 
      category: 'Wood',
      color: '#8B4513',
      description: 'Natural wood texture',
      textureUrl: '/textures/materials/wood/oak-diffuse.svg',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 2h16v2H4zm0 4h16v2H4zm0 4h16v2H4zm0 4h16v2H4zm0 4h16v2H4z" opacity="0.8"/>
          <path d="M2 2h1v20H2zm19 0h1v20h-1z" opacity="0.6"/>
        </svg>
      )
    },
    { 
      id: 'glass', 
      name: 'Glass', 
      category: 'Glass',
      color: '#87CEEB',
      description: 'Clear transparent glass',
      textureUrl: null,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 2v2h2V2h6v2h2V2h1a1 1 0 011 1v18a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1h1z" opacity="0.3"/>
          <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.7"/>
          <path d="M8 6h8M8 18h8" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        </svg>
      )
    }
  ];
  const [selectedArtwork, setSelectedArtwork] = useState<string>('');
  const [selectedLogo, setSelectedLogo] = useState<string>('');
  const [bottomBarHeight, setBottomBarHeight] = useState(300);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [uploadedArtwork, setUploadedArtwork] = useState<Array<{url: string, name: string, id: string}>>([]);
  const [uploadedLogos, setUploadedLogos] = useState<Array<{url: string, name: string, id: string}>>([]);
  const [isUploadingArtwork, setIsUploadingArtwork] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [artworkPrompt, setArtworkPrompt] = useState<string>('');
  const [isGeneratingArtwork, setIsGeneratingArtwork] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const artworkFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Predefined artwork options
  const predefinedArtwork = [
    { id: 'pattern1', name: 'Pattern Design', url: '/models/glass-plastic-containers/child-resistant-jars/artwork/pattern1.svg' },
    { id: 'label1', name: 'Product Label', url: '/models/glass-plastic-containers/child-resistant-jars/artwork/label1.svg' },
    { id: 'logo1', name: 'Company Logo', url: '/models/glass-plastic-containers/child-resistant-jars/artwork/logo1.svg' }
  ];

  // Notify parent about panel state changes
  useEffect(() => {
    onPanelStateChange?.(!isCollapsed, isCollapsed ? 48 : bottomBarHeight);
  }, [bottomBarHeight, isCollapsed, onPanelStateChange]);

  const handleToggleCollapse = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onToggleCollapse) {
      onToggleCollapse(newCollapsedState);
    }
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    onColorChange(color, selectedPart);
  };

  const handleMaterialChange = (material: { textureUrl?: string; category?: string; name?: string }) => {
    // If material has a texture, create a layer with the texture
    if (material.textureUrl) {
      const partName = material.category === 'Wood' ? 'Top/Cap' : 'All Parts';
      const targetPart = material.category === 'Wood' ? 'top' : 'all';
      const layerName = `${material.name} ${material.category}`;
      
      // Create a new layer with the material texture
      layerManager.createLayer(layerName, 'artwork', targetPart, material.textureUrl);
    } else {
      // Fallback to color for non-textured materials
      handleColorChange(material.color);
    }
  };

  const handleArtworkChange = (artwork: string) => {
    setSelectedArtwork(artwork);
    onArtworkChange(artwork, selectedPart);
  };

  // Handle artwork file upload
  const handleArtworkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingArtwork(true);
    try {
      const formData = new FormData();
      formData.append('artwork', file);
      formData.append('sessionId', 'user-session-' + Date.now());

      const response = await fetch('/api/upload/artwork', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        const newArtwork = {
          id: `uploaded-${Date.now()}`,
          name: result.originalName,
          url: result.url
        };
        setUploadedArtwork(prev => [...prev, newArtwork]);
        handleArtworkChange(result.url);
      } else {
        console.error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploadingArtwork(false);
      if (artworkFileInputRef.current) {
        artworkFileInputRef.current.value = '';
      }
    }
  };

  // Handle logo file upload
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Prevent multiple uploads if already uploading
    if (isUploadingLogo) {
      console.log('🚫 Logo upload already in progress, ignoring duplicate call');
      return;
    }

    console.log('📤 Starting logo upload:', file.name);
    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      formData.append('sessionId', 'user-session-' + Date.now());

      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Logo upload successful:', result);
        
        const newLogo = {
          id: `logo-${Date.now()}`,
          name: result.originalName,
          url: result.url
        };
        setUploadedLogos(prev => [...prev, newLogo]);
        setSelectedLogo(result.url);

        // DO NOT automatically apply - let user manually apply to prevent duplicates
        console.log('✅ Logo uploaded successfully, not auto-applying to prevent duplicates');
      } else {
        console.error('Logo upload failed');
      }
    } catch (error) {
      console.error('Logo upload error:', error);
    } finally {
      setIsUploadingLogo(false);
      if (logoFileInputRef.current) {
        logoFileInputRef.current.value = '';
      }
    }
  };

  // Handle artwork generation
  const handleGenerateArtwork = async () => {
    if (!artworkPrompt.trim()) return;
    
    setIsGeneratingArtwork(true);
    try {
      console.log('🎨 Generating artwork with prompt:', artworkPrompt);
      
      const response = await fetch('/api/generate/artwork', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: artworkPrompt,
          sessionId: `user-session-${Date.now()}`
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('🎨 Generation successful:', result);
        
        // Add the generated artwork to the uploaded artwork list
        const newArtwork = {
          id: `generated-${Date.now()}`,
          name: `Generated: ${artworkPrompt.substring(0, 30)}${artworkPrompt.length > 30 ? '...' : ''}`,
          url: result.url
        };
        setUploadedArtwork(prev => [...prev, newArtwork]);
        
        // Apply the generated artwork to the model
        handleArtworkChange(result.url);
        
        // Automatically add as layer
        await applyAsLayer(result.url, newArtwork.name, 'artwork');
        
        // Clear the prompt and show success message
        setArtworkPrompt('');
        setSuccessMessage('🎨 Artwork generated successfully!');
        setTimeout(() => setSuccessMessage(''), 4000);
        
      } else {
        const errorData = await response.json();
        console.error('Generation failed:', errorData);
        setSuccessMessage(`❌ Generation failed: ${errorData.error}`);
        setTimeout(() => setSuccessMessage(''), 6000);
      }
      
    } catch (error) {
      console.error('Artwork generation error:', error);
      setSuccessMessage('❌ Failed to generate artwork. Please try again.');
      setTimeout(() => setSuccessMessage(''), 6000);
    } finally {
      setIsGeneratingArtwork(false);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      setIsUploadingArtwork(true);
      try {
        const formData = new FormData();
        formData.append('artwork', imageFile);
        formData.append('sessionId', 'user-session-' + Date.now());

        const response = await fetch('/api/upload/artwork', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          const newArtwork = {
            id: `uploaded-${Date.now()}`,
            name: result.originalName,
            url: result.url
          };
          setUploadedArtwork(prev => [...prev, newArtwork]);
          handleArtworkChange(result.url);
          
          // Automatically add as layer
          await applyAsLayer(result.url, result.originalName, 'artwork');
        } else {
          console.error('Upload failed');
        }
      } catch (error) {
        console.error('Upload error:', error);
      } finally {
        setIsUploadingArtwork(false);
      }
    }
  };

  // Apply artwork/logo as a layer
  const applyAsLayer = async (url: string, name: string, type: 'artwork' | 'logo') => {
    console.log(`🎨 applyAsLayer called:`, { url, name, type, selectedPart });
    
    // Pre-load the texture to ensure it's available when the layer is created
    console.log(`🔄 Pre-loading texture for ${type}: ${url}`);
    try {
      const texture = await new Promise<void>((resolve, reject) => {
        const loader = new Image();
        loader.onload = () => {
          console.log(`✅ Texture pre-loaded successfully for ${type}: ${url}`);
          resolve();
        };
        loader.onerror = (error) => {
          console.error(`❌ Failed to pre-load texture for ${type}: ${url}`, error);
          reject(error);
        };
        loader.src = url;
      });
    } catch (error) {
      console.error(`❌ Texture pre-loading failed, proceeding anyway:`, error);
      // Continue with layer creation even if pre-loading fails
    }
    
    // For logos: Remove any existing logo layers on the same part to prevent duplicates
    if (type === 'logo') {
      const existingLayers = layerManager.getState().layers;
      console.log(`🔍 Current layers before cleanup:`, existingLayers.map(l => ({ id: l.id, name: l.name, type: l.type, targetPart: l.targetPart, url: l.value })));
      
      const existingLogoLayers = existingLayers.filter(layer => 
        layer.type === 'artwork' && 
        layer.targetPart === selectedPart && 
        layer.name === 'Logo'
      );
      
      console.log(`🔍 Found ${existingLogoLayers.length} existing logo layers for part "${selectedPart}":`, existingLogoLayers);
      
      // Remove existing logo layers for this part
      existingLogoLayers.forEach(layer => {
        console.log(`🗑️ Removing existing logo layer: ${layer.id} from part: ${selectedPart}`);
        layerManager.deleteLayer(layer.id);
      });
      
      // Also check for any layers with the same URL to prevent exact duplicates
      const duplicateUrlLayers = existingLayers.filter(layer => 
        layer.type === 'artwork' && 
        layer.targetPart === selectedPart && 
        layer.value === url
      );
      
      console.log(`🔍 Found ${duplicateUrlLayers.length} layers with same URL:`, duplicateUrlLayers);
      
      duplicateUrlLayers.forEach(layer => {
        console.log(`🗑️ Removing duplicate URL layer: ${layer.id}`);
        layerManager.deleteLayer(layer.id);
      });
    }

    // All artwork layers get position and scale data for control
    // Both logos and artwork now apply to mesh surface with same positioning
    const position = { x: 0, y: 0, z: 0.1 };
    // Start with 100% scale (1.0) - auto-scale will determine optimal base size
    const scale = 1.0;

    console.log(`🎨 Creating ${type} layer:`, {
      name: type === 'logo' ? 'Logo' : 'Artwork',
      type: 'artwork',
      targetPart: selectedPart,
      url,
      position,
      scale
    });

    // For pouch models, ensure artwork targets the "artwork" part
    // Check if the current selectedPart indicates we're working with artwork area
    const targetPartForArtwork = (selectedPart === 'artwork' && type === 'artwork') ? 'artwork' : selectedPart;
    
    layerManager.createLayer(
      type === 'logo' ? 'Logo' : 'Artwork',
      'artwork',
      targetPartForArtwork,
      url,
      {
        position,
        scale
      }
    );

    // Show success message
    const message = type === 'logo' 
      ? 'Logo applied to model surface! Use layer controls to adjust size and position.'
      : 'Artwork added as layer! Use layer controls to adjust size and position.';
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Remove uploaded artwork
  const removeUploadedArtwork = (id: string) => {
    setUploadedArtwork(prev => prev.filter(item => item.id !== id));
  };

  // Remove uploaded logo
  const removeUploadedLogo = (id: string) => {
    setUploadedLogos(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div
      className={`fixed rounded-lg shadow-lg transform transition-all duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      } z-20`}
      style={{
        bottom: '20px',
        left: '360px', // Start to the right of the left sidebar (320px width + 40px margins)
        right: '20px', // Extends to right edge as requested
        height: isCollapsed ? '48px' : `${bottomBarHeight}px`,
        backgroundColor: '#09090b',
        border: '1px solid #2e2e2e',
        transition: 'transform 0.5s ease-in-out, height 0.3s ease-in-out'
      }}
    >


      {/* Panel content - only show when not collapsed */}
      <div className={`h-full flex flex-col ${isCollapsed ? 'hidden' : ''}`}>
        {/* Top Tab Bar with Section Titles */}
        <div className="relative flex items-center border-b flex-shrink-0" style={{ backgroundColor: '#0d0d0e', borderBottomColor: '#2e2e2e' }}>
          {/* Section Tabs - Full Width for Perfect Centering */}
          <div className="flex w-full">
            {/* Colors Tab */}
            <div className="flex-1 px-4 py-3 border-r text-center" style={{ borderRightColor: '#2e2e2e' }}>
              <h3 className="text-white font-medium text-sm">Colors</h3>
            </div>

            {/* Artwork Tab */}
            <div className="flex-1 px-4 py-3 border-r text-center" style={{ borderRightColor: '#2e2e2e' }}>
              <h3 className="text-white font-medium text-sm">Artwork</h3>
            </div>

            {/* Logos Tab */}
            <div className="flex-1 px-4 py-3 text-center">
              <h3 className="text-white font-medium text-sm">Logos</h3>
            </div>
          </div>


        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-600 text-white text-xs px-3 py-2 text-center flex-shrink-0">
            {successMessage}
          </div>
        )}

        {/* Three Sections Side by Side */}
        <div className="flex-1 flex overflow-hidden">
          {/* Colors Section */}
          <div className="flex-1 border-r p-2 overflow-y-auto" style={{ borderRightColor: '#2e2e2e' }}>
            <div>

              {/* Tab Navigation */}
              <Tabs defaultValue="colors" className="w-full">
                <TabsList className="inline-flex mb-4 p-1 rounded-lg" style={{ backgroundColor: '#191919' }}>
                  <TabsTrigger value="colors" className="text-gray-400 data-[state=active]:text-white data-[state=active]:border-0 px-4 py-2 text-xs bg-transparent data-[state=active]:bg-black">
                    Colors
                  </TabsTrigger>
                  <TabsTrigger value="materials" className="text-gray-400 data-[state=active]:text-white data-[state=active]:border-0 px-4 py-2 text-xs bg-transparent data-[state=active]:bg-black">
                    PBR Materials
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="colors">
                  {/* Two-Part Layout: Custom Color (Left) | Pantone Shades (Right) */}
                  <div className="flex gap-3 mb-3">
                {/* Left Side - Custom Color (50%) */}
                <div className="flex-1">
                  <h4 className="text-white text-xs font-medium mb-2 text-center">Custom Color</h4>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="relative">
                      <input
                        type="color"
                        value={selectedColor}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="w-12 h-12 rounded-lg border-2 border-gray-600 bg-transparent cursor-pointer hover:border-gray-400 transition-colors"
                        title="Pick custom color"
                      />
                      {/* Color preview overlay */}
                      <div 
                        className="absolute inset-0 rounded-lg pointer-events-none border-2 border-transparent"
                        style={{ 
                          backgroundColor: selectedColor,
                          boxShadow: selectedColor !== '#ff4444' ? 'inset 0 0 0 2px rgba(255,255,255,0.2)' : 'none'
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 font-mono text-center max-w-[60px] truncate">
                      {selectedColor.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Divider Line */}
                <div className="w-px h-20 flex-shrink-0 self-center" style={{ background: 'linear-gradient(to bottom, transparent 0%, #2e2e2e 20%, #2e2e2e 80%, transparent 100%)' }}></div>

                {/* Right Side - Pantone Shades (50%) */}
                <div className="flex-1 flex flex-col items-center">
                  <h4 className="text-white text-xs font-medium mb-2 text-center">Pantone Shades</h4>
                  <div className="grid grid-cols-3 grid-rows-2 gap-1 justify-items-center">
                    {pantoneShades.map((color, index) => (
                      <button
                        key={index}
                        className={`w-5 h-5 rounded border-2 transition-all hover:scale-110 ${
                          selectedColor === color 
                            ? 'border-white shadow-lg ring-2 ring-white/30' 
                            : 'border-gray-600 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorChange(color)}
                        title={color}
                      />
                    ))}
                  </div>
                </div>



              </div>

              {/* Apply Color Button */}
              <div className="mt-3 mb-3 flex justify-center">
                <ButtonCta
                  label="Apply Color"
                  onClick={() => {
                    const partName = selectedPart === 'all' ? 'Entire Model' :
                                   selectedPart === 'top' ? 'Top/Cap' :
                                   selectedPart === 'middle' ? 'Middle/Body' :
                                   selectedPart === 'base' ? 'Base/Bottom' : selectedPart;
                    layerManager.createLayer(
                      `Color: ${partName}`,
                      'color',
                      selectedPart,
                      selectedColor
                    );
                    setSuccessMessage('Color applied as layer!');
                    setTimeout(() => setSuccessMessage(''), 3000);
                  }}
                  className="h-10 px-6"
                />
              </div>
                </TabsContent>

                <TabsContent value="materials">
                  <MaterialSelector 
                    selectedPart={selectedPart}
                    onMaterialApply={(materialId, targetPart) => {
                      setSuccessMessage(`PBR Material applied to ${targetPart}!`);
                      setTimeout(() => setSuccessMessage(''), 3000);
                    }}
                  />
                </TabsContent>
              </Tabs>



            </div>
          </div>

          {/* Artwork Section */}
          <div className="flex-1 border-r p-2 overflow-y-auto scrollbar-dark" style={{ borderRightColor: '#2e2e2e' }}>
            <div className="flex gap-3 h-full">
              {/* Left Side - Artwork Library (40%) */}
              <div className="flex-[0.4] flex flex-col">
                <h4 className="text-white text-xs font-medium mb-2 text-center">Artwork Library</h4>
                
                {/* Uploaded Artwork Gallery */}
                {uploadedArtwork.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-white text-xs font-medium mb-2">Your Uploaded Artwork</h5>
                    <div className="flex flex-wrap gap-2">
                      {uploadedArtwork.map((artwork) => (
                        <div key={artwork.id} className="group relative">
                          <button
                            className={`relative border rounded-lg cursor-pointer transition-all overflow-hidden w-12 h-12 ${
                              selectedArtwork === artwork.url
                                ? 'border-red-500 bg-red-500/20'
                                : 'border-gray-600 hover:border-gray-500'
                            }`}
                            onClick={() => handleArtworkChange(artwork.url)}
                            title={artwork.name}
                          >
                            <div className="w-full h-full bg-gray-700 rounded-lg overflow-hidden">
                              <img
                                src={artwork.url}
                                alt={artwork.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className="hidden w-full h-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            </div>
                          </button>
                          <div className="absolute -top-1 -right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                await applyAsLayer(artwork.url, artwork.name, 'artwork');
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white rounded-md p-1 w-4 h-4 flex items-center justify-center"
                              title="Add as Layer"
                            >
                              <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeUploadedArtwork(artwork.id);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white rounded-md p-1 w-4 h-4 flex items-center justify-center"
                              title="Remove"
                            >
                              <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Predefined Artwork Library */}
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2">
                    {predefinedArtwork.map((artwork) => (
                      <div key={artwork.id} className="group relative">
                        <button
                          className={`relative border rounded-lg cursor-pointer transition-all overflow-hidden w-12 h-12 ${
                            selectedArtwork === artwork.url
                              ? 'border-red-500 bg-red-500/20'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                          onClick={() => handleArtworkChange(artwork.url)}
                          title={artwork.name}
                        >
                          <div className="w-full h-full bg-gray-700 rounded-lg overflow-hidden">
                            <img
                              src={artwork.url}
                              alt={artwork.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                            <div className="hidden w-full h-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await applyAsLayer(artwork.url, artwork.name, 'artwork');
                          }}
                          className="absolute -top-1 -right-1 bg-green-600 hover:bg-green-700 text-white rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity w-4 h-4 flex items-center justify-center"
                          title="Add as Layer"
                        >
                          <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Apply Selected Artwork Button */}
                {selectedArtwork && (
                  <div className="mt-3">
                    <button
                      onClick={async () => {
                        if (selectedArtwork) {
                          const artworkName = uploadedArtwork.find(a => a.url === selectedArtwork)?.name || 
                                            predefinedArtwork.find(a => a.url === selectedArtwork)?.name || 
                                            'Custom Artwork';
                          await applyAsLayer(selectedArtwork, artworkName, 'artwork');
                        }
                      }}
                      className="w-full border-2 border-white bg-transparent hover:bg-white/10 text-white py-1 px-4 rounded-lg text-xs font-medium transition-all transform hover:scale-105 active:scale-95"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Apply Selected Artwork</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Divider Line */}
              <div className="w-px flex-shrink-0" style={{ background: 'linear-gradient(to bottom, transparent 0%, #2e2e2e 20%, #2e2e2e 80%, transparent 100%)' }}></div>

              {/* Right Side - Generate & Upload (60%) */}
              <div className="flex-[0.6] flex flex-col">
                {/* Generate Section */}
                <div className="flex-1 mb-2">
                  <h5 className="text-white text-xs font-medium mb-1">Generate</h5>
                  <div className="relative bg-transparent rounded-2xl border flex flex-col" style={{ borderColor: '#2e2e2e', height: '80px' }}>
                    <div className="p-2 pr-10 flex-1 flex flex-col">
                      {/* Text input area */}
                      <textarea
                        value={artworkPrompt}
                        onChange={(e) => setArtworkPrompt(e.target.value)}
                        placeholder="Describe your artwork"
                        className="w-full h-full bg-transparent text-white text-xs placeholder-gray-500 resize-none focus:outline-none flex-1"
                        maxLength={200}
                        style={{ minHeight: '50px' }}
                      />
                    </div>
                    
                    {/* Send button - positioned in bottom right corner */}
                    <button
                      onClick={handleGenerateArtwork}
                      disabled={!artworkPrompt.trim() || isGeneratingArtwork}
                      className="absolute bottom-1 right-1 bg-transparent hover:bg-transparent disabled:bg-transparent border p-1 rounded-lg transition-all flex items-center justify-center disabled:cursor-not-allowed"
                      style={{ borderColor: '#2e2e2e' }}
                    >
                      {isGeneratingArtwork ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Upload Section */}
                <div className="flex-1">
                  <h5 className="text-white text-xs font-medium mb-1">Upload</h5>
                  <div className="flex flex-col space-y-1">
                    {/* Drag and Drop Area */}
                    <div
                      className={`relative border border-dashed rounded-lg transition-all h-12 flex flex-col items-center justify-center cursor-pointer ${
                        isDragging 
                          ? 'border-blue-500 bg-blue-500/10' 
                          : isUploadingArtwork
                          ? 'bg-gray-700/50 cursor-not-allowed'
                          : 'hover:bg-gray-700/30'
                      }`}
                      style={{
                        borderColor: isDragging ? '#3b82f6' : '#191919'
                      }}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => !isUploadingArtwork && artworkFileInputRef.current?.click()}
                    >
                      <input
                        ref={artworkFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleArtworkUpload}
                        className="hidden"
                      />
                      
                      {isUploadingArtwork ? (
                        <div className="flex flex-col items-center space-y-1">
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs text-gray-300">Uploading...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span className="text-xs text-gray-400 text-center">
                            {isDragging ? 'Drop file here' : 'Click or drag files'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Upload Button Alternative */}
                    <div className="flex justify-center">
                      <ButtonCta
                        onClick={() => artworkFileInputRef.current?.click()}
                        disabled={isUploadingArtwork}
                        label={isUploadingArtwork ? "Uploading..." : "Browse Files"}
                        className="disabled:opacity-50 disabled:cursor-not-allowed text-xs py-1 px-3"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logos Section */}
          <div className="flex-1 p-2 overflow-y-auto">
            <div>

              {/* Drag and Drop Area for Logos */}
              <div className="mb-2 flex justify-center">
                <div
                  className={`relative border border-dashed rounded-lg transition-all h-16 w-[60%] flex flex-col items-center justify-center cursor-pointer ${
                    isDragging 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : isUploadingLogo
                      ? 'bg-gray-700/50 cursor-not-allowed'
                      : 'hover:bg-gray-700/30'
                  }`}
                  style={{
                    borderColor: isDragging ? '#3b82f6' : '#191919'
                  }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    
                    const files = Array.from(e.dataTransfer.files);
                    const imageFile = files.find(file => file.type.startsWith('image/'));
                    
                    if (imageFile) {
                      setIsUploadingLogo(true);
                      try {
                        const formData = new FormData();
                        formData.append('logo', imageFile);
                        formData.append('sessionId', 'user-session-' + Date.now());

                        fetch('/api/upload/logo', {
                          method: 'POST',
                          body: formData,
                        }).then(async response => {
                          if (response.ok) {
                            const result = await response.json();
                            const newLogo = {
                              id: `logo-${Date.now()}`,
                              name: result.originalName,
                              url: result.url
                            };
                            setUploadedLogos(prev => [...prev, newLogo]);
                            setSelectedLogo(result.url);

                            // DO NOT automatically apply - let user manually apply to prevent duplicates
                            console.log('✅ Logo uploaded via drag-and-drop, not auto-applying');
                          } else {
                            console.error('Logo upload failed');
                          }
                        }).catch(error => {
                          console.error('Logo upload error:', error);
                        }).finally(() => {
                          setIsUploadingLogo(false);
                        });
                      } catch (error) {
                        console.error('Logo upload error:', error);
                        setIsUploadingLogo(false);
                      }
                    }
                  }}
                  onClick={() => !isUploadingLogo && logoFileInputRef.current?.click()}
                >
                  <input
                    ref={logoFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  
                  {isUploadingLogo ? (
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-gray-300">Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-1">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-xs text-gray-400 text-center">
                        {isDragging ? 'Drop logo here' : 'Click or drag logos'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Browse Files Button */}
              <div className="mb-2">
                <div className="flex justify-center">
                  <ButtonCta
                    onClick={() => logoFileInputRef.current?.click()}
                    disabled={isUploadingLogo}
                    label="Browse Files"
                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Apply Logo Only Button */}
              {selectedLogo && (
                <div className="mb-2">
                  <button
                    onClick={async () => {
                      if (selectedLogo) {
                        const logoName = uploadedLogos.find(l => l.url === selectedLogo)?.name || 'Selected Logo';
                        await applyAsLayer(selectedLogo, logoName, 'logo');
                      }
                    }}
                    className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white py-2 px-3 rounded-full text-xs font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>Apply Logo Only</span>
                    </div>
                  </button>
                </div>
              )}



              {/* Uploaded Logos */}
              {uploadedLogos.length > 0 && (
                <div>
                  <h4 className="text-white text-xs font-medium mb-1">Uploaded Logos</h4>
                  <div className="flex flex-wrap gap-1">
                    {uploadedLogos.map((logo) => (
                      <div key={logo.id} className="group relative">
                        <button
                          className={`relative border rounded-lg cursor-pointer transition-all overflow-hidden w-8 h-8 ${
                            selectedLogo === logo.url
                              ? 'border-purple-500 bg-purple-500/20'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                          onClick={() => setSelectedLogo(logo.url)}
                          title={logo.name}
                        >
                          <div className="w-full h-full bg-gray-700 rounded-lg overflow-hidden">
                            <img
                              src={logo.url}
                              alt={logo.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                            <div className="hidden w-full h-full flex items-center justify-center">
                              <svg className="w-2 h-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          </div>
                        </button>
                        <div className="absolute -top-1 -right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              await applyAsLayer(logo.url, logo.name, 'logo');
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white rounded-md p-1 w-4 h-4 flex items-center justify-center"
                            title="Add as Layer"
                          >
                            <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeUploadedLogo(logo.id);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-md p-1 w-4 h-4 flex items-center justify-center"
                            title="Remove"
                          >
                            <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Logo Tips */}
              <div className="mt-2 flex justify-center">
                <p className="text-gray-400 text-xs text-center w-[60%]">
                  💡 Tip: Upload PNG files with transparency. Click and drag logos on the 3D model to position them!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomPanel;
