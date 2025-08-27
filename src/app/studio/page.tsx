'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ProductSidebar from '@/components/studio/ProductSidebar';
import ModelViewer from '@/components/studio/ModelViewer';
import CustomizationSidebar from '@/components/studio/SidebarClean';
import BottomPanel from '@/components/studio/BottomPanelClean';
import StudioLogo from '@/components/studio/StudioLogo';
import ProjectsPanel from '@/components/studio/ProjectsPanel';
import { layerManager } from '@/lib/layerManager';
import { modelStateManager } from '@/lib/modelStateManager';
import { projectManager, SaveProjectRequest } from '@/lib/projectManager';
import { screenshotCapture } from '@/lib/screenshotUtils';


export interface Product {
  id: string;
  name: string;
  category: string;
  modelPath?: string;
  thumbnail?: string;
}

const StudioPage = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#ff4444');
  const [selectedArtwork, setSelectedArtwork] = useState<string>('');
  const [targetPart, setTargetPart] = useState<string>('all');
  const [selectedPart, setSelectedPart] = useState<string>('all');
  
  // Synchronize selectedPart with targetPart
  useEffect(() => {
    setTargetPart(selectedPart);
  }, [selectedPart]);
  const [hasColorChanged, setHasColorChanged] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [bottomPanelExpanded, setBottomPanelExpanded] = useState(true);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(300);
  const [reflectiveness, setReflectiveness] = useState(0.5); // Global reflectiveness for pouch model
  const [showProjects, setShowProjects] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Debug log when reflectiveness changes
  useEffect(() => {
    console.log('📊 Studio: Reflectiveness state changed to:', reflectiveness);
  }, [reflectiveness]);


  // Debug log for bottom panel state changes
  useEffect(() => {
    console.log('Studio: Bottom panel state:', {
      expanded: bottomPanelExpanded,
      height: bottomPanelHeight,
      effectiveHeight: bottomPanelExpanded ? bottomPanelHeight : 48
    });
  }, [bottomPanelExpanded, bottomPanelHeight]);

  // Utility function for manual reset (can be called from console for debugging)
  const resetAllStudioState = () => {
    console.log('🔄 Studio: Manual reset of all state triggered');
    
    // Reset all React state
    setSelectedColor('#ff4444');
    setSelectedArtwork('');
    setTargetPart('all');
    setSelectedPart('all');
    setHasColorChanged(false);
    setReflectiveness(0.5);
    
    // Reset managers
    layerManager.clearAllLayers();
    modelStateManager.resetAllProductState();
    
    console.log('✅ Studio: Manual reset complete');
  };

  // Make reset function available globally for debugging (development only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as Record<string, unknown>).resetStudioState = resetAllStudioState;
    }
  }, []);

  const handleProductSelect = (product: Product) => {
    console.log('🔄 STUDIO: Product selected:', product);
    console.log('🔄 STUDIO: Current selectedProduct before:', selectedProduct);
    
    // Check if this is actually a different product to avoid unnecessary resets
    const isDifferentProduct = selectedProduct?.id !== product.id;
    
    if (isDifferentProduct) {
      console.log(`🧹 Studio: Switching from "${selectedProduct?.name}" to "${product.name}" - resetting all state`);
      
      // Reset all customization state to defaults for the new product
      setSelectedColor('#ff4444'); // Reset to default color
      setSelectedArtwork(''); // Clear artwork
      setTargetPart('all'); // Reset target part
      setSelectedPart('all'); // Reset selected part
      setHasColorChanged(false); // Reset color change flag
      setReflectiveness(0.5); // Reset reflectiveness to default
      
      // The LayerManager and ModelStateManager will be reset by the ModelViewer
      // when it detects the product ID change
      
      console.log(`✅ Studio: State reset complete for product "${product.name}"`);
    } else {
      console.log(`📌 Studio: Same product selected - keeping existing state`);
    }
    
    // Set the new product (this will trigger ModelViewer's product switch logic)
    setSelectedProduct(product);
    console.log('🔄 STUDIO: selectedProduct set to:', product);
    
    // Show customization sidebar after a short delay for smooth animation
    setTimeout(() => {
      setShowCustomization(true);
      console.log('🔄 STUDIO: showCustomization set to true');
    }, 300);
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

    try {
      setIsSaving(true);
      
      // Use product name and timestamp for save
      const projectName = `${selectedProduct.name} - ${new Date().toLocaleString()}`;
      
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
        name: projectName,
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
        alert(`✅ Project saved successfully as "${projectName}"`);
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
    <div className="min-h-screen bg-gray-900 overflow-hidden" style={{ backgroundColor: '#09090b' }}>
      <div className="relative z-50">
        <Header 
          onProjectsClick={() => setShowProjects(true)}
          onSaveClick={handleSaveProject}
          isSaving={isSaving}
          canSave={!!selectedProduct}
        />
      </div>

      <div className="relative h-[calc(100vh-80px)]">
        {/* Studio Logo - positioned above left sidebar */}
        <StudioLogo />





        {/* Left Sidebar - Product Selection (now positioned absolutely) */}
        <ProductSidebar
          onProductSelect={handleProductSelect}
          selectedProduct={selectedProduct}
        />

        {/* Main Area - 3D Model Viewer (now takes full width) */}
        <div 
          className="w-full"
          style={{ 
            height: `calc(100vh - 80px - ${bottomPanelExpanded ? bottomPanelHeight : 48}px)`,
            transition: 'height 0.3s ease-in-out'
          }}
        >
          <ModelViewer
            selectedProduct={selectedProduct}
            selectedColor={selectedColor}
            selectedArtwork={selectedArtwork}
            targetPart={targetPart}
            hasColorChanged={hasColorChanged}
            reflectiveness={reflectiveness}
          />
        </div>
        
        {/* Right Sidebar - Customization Options */}
        <CustomizationSidebar
          isVisible={showCustomization}
          selectedProduct={selectedProduct}
          onColorChange={(color, targetPartOverride) => {
            setSelectedColor(color);
            setHasColorChanged(true);
            // Use the current selectedPart unless explicitly overridden
            const partToTarget = targetPartOverride || selectedPart;
            setTargetPart(partToTarget);
          }}
          onArtworkChange={(artwork, targetPartOverride) => {
            setSelectedArtwork(artwork);
            // Use the current selectedPart unless explicitly overridden
            const partToTarget = targetPartOverride || selectedPart;
            setTargetPart(partToTarget);
          }}
          onWidthChange={setSidebarWidth}
          bottomPanelHeight={bottomPanelHeight}
          selectedPart={selectedPart}
          onPartSelect={setSelectedPart}
          onToggleCollapse={(isCollapsed) => {
            console.log('Sidebar collapsed state:', isCollapsed);
            setSidebarCollapsed(isCollapsed);
          }}
          reflectiveness={reflectiveness}
          onReflectivenessChange={setReflectiveness}
        />

        <BottomPanel
          isVisible={showCustomization}
          onColorChange={(color, targetPartOverride) => {
            setSelectedColor(color);
            setHasColorChanged(true);
            // Use the current selectedPart unless explicitly overridden
            const partToTarget = targetPartOverride || selectedPart;
            setTargetPart(partToTarget);
          }}
          onArtworkChange={(artwork, targetPartOverride) => {
            setSelectedArtwork(artwork);
            // Use the current selectedPart unless explicitly overridden
            const partToTarget = targetPartOverride || selectedPart;
            setTargetPart(partToTarget);
          }}
          onPanelStateChange={(isExpanded, height) => {
            setBottomPanelExpanded(isExpanded);
            setBottomPanelHeight(height);
          }}
          selectedPart={selectedPart}
          onToggleCollapse={(isCollapsed) => {
            console.log('Bottom panel collapsed state:', isCollapsed);
          }}
          sidebarWidth={sidebarWidth}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Projects Panel */}
        <ProjectsPanel
          isVisible={showProjects}
          onClose={() => setShowProjects(false)}
          onProjectLoad={handleProductSelect}
        />
      </div>
    </div>
  );
};

export default StudioPage;
