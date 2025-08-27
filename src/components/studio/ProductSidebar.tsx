import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product } from '@/app/studio/page';
import { modelManager } from '@/lib/modelManager';
import { ButtonCta } from '@/components/ui/ButtonCta';

interface ProductCategory {
  id: string;
  name: string;
  description: string;
  subcategories: Array<{
    id: string;
    name: string;
    description: string;
    config_file: string;
    model_count: number;
  }>;
}

interface ProductSidebarProps {
  onProductSelect: (product: Product) => void;
  selectedProduct: Product | null;
}

const ProductSidebar: React.FC<ProductSidebarProps> = ({ onProductSelect, selectedProduct }) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['glass-plastic-containers', 'apparel-clothing']);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProductCatalog();
  }, []);

  const loadProductCatalog = async () => {
    try {
      const catalog = await modelManager.loadCatalog();
      setProductCategories(catalog.categories);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load product catalog:', error);
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubcategoryClick = async (subcategory: ProductCategory['subcategories'][0], categoryId: string) => {
    try {
      const models = await modelManager.getModelsByCategory(categoryId, subcategory.id);
      console.log('Loaded models:', models); // Debug log
      if (models.length > 0) {
        // Select the first model in the subcategory
        const firstModel = models[0];
        const modelPath = `/models/${categoryId}/${subcategory.id}/${firstModel.file}?v=${Date.now()}`;
        console.log('Constructed model path:', modelPath); // Debug log

        const productData: Product = {
          id: firstModel.id,
          name: firstModel.name,
          category: categoryId,
          modelPath: modelPath,
          thumbnail: firstModel.thumbnail
        };
        console.log('🚀 PRODUCT SIDEBAR: Product data:', productData); // Debug log
        console.log('🚀 PRODUCT SIDEBAR: Calling onProductSelect...');
        onProductSelect(productData);
        console.log('🚀 PRODUCT SIDEBAR: onProductSelect called successfully');
      }
    } catch (error) {
      console.error('Failed to load models for subcategory:', error);
    }
  };

  if (loading) {
    return (
      <div className="w-80 border-r border-gray-700 overflow-y-auto" style={{ backgroundColor: '#09090b' }}>
        <div className="p-2">
          <h2 className="text-xs font-semibold text-white mb-2">Select Product</h2>
          <div className="flex items-center justify-center py-2">
            <div className="text-gray-400 text-xs">Loading products...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed rounded-lg shadow-lg overflow-y-auto z-10"
      style={{
        top: '80px', // Aligned with right sidebar (layers section)
        left: '20px',
        width: '320px',
        height: 'calc(100vh - 100px)', // Matching right sidebar height calculation
        backgroundColor: '#09090b',
        border: '1px solid #2e2e2e',
        transition: 'height 0.3s ease-in-out'
      }}
    >
      <div className="p-2 h-full flex flex-col">
        <h2 className="text-xs font-semibold text-white mb-2 flex-shrink-0">Select Product</h2>

        <div className="space-y-2 flex-1 overflow-y-auto scrollbar-dark">
          {productCategories.map((category) => (
            <div key={category.id} className="rounded-lg overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full px-2 py-1 text-white text-left font-medium flex items-center justify-between hover:bg-gray-800 transition-colors text-xs"
                style={{ backgroundColor: '#1a1a1a' }}
              >
                <span>{category.name}</span>
                <svg
                  className={`w-3 h-3 transform transition-transform ${
                    expandedCategories.includes(category.id) ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Subcategories List */}
              {expandedCategories.includes(category.id) && (
                <div className="p-3 space-y-3" style={{ backgroundColor: '#0a0a0a' }}>
                  {category.subcategories.map((subcategory: ProductCategory['subcategories'][0]) => (
                    <div
                      key={subcategory.id}
                      className={`relative rounded-lg p-3 hover:bg-gray-700/50 transition-all duration-200 ${
                        selectedProduct?.category === category.id && selectedProduct?.name === subcategory.name 
                          ? 'bg-red-500/10 border border-red-500/40' : ''
                      }`}
                      style={{ backgroundColor: '#2e2e2e' }}
                    >
                      {/* Product Image */}
                      <div 
                        className="w-full h-24 rounded-lg mb-3 flex items-center justify-center overflow-hidden"
                        style={{ 
                          backgroundColor: '#000000',
                          backgroundImage: `
                            radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px),
                            radial-gradient(ellipse at center, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.075) 50%, rgba(255,255,255,0.015) 100%)
                          `,
                          backgroundSize: '4px 4px, 100% 100%'
                        }}
                      >
                        {(subcategory.id === 'child-resistant-jars') ? (
                          <Image
                            src="/images/thumbnails/glass-plastic-containers/jar.png"
                            alt={subcategory.name}
                            width={80}
                            height={80}
                            className="max-w-full max-h-full object-contain"
                            style={{
                              maxWidth: '80%',
                              maxHeight: '80%',
                              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))'
                            }}
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="text-white opacity-80">
                                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                  </div>
                                `;
                              }
                            }}
                          />
                        ) : (subcategory.id === 'pouch') ? (
                          <Image
                            src="/images/thumbnails/glass-plastic-containers/pouch.png"
                            alt={subcategory.name}
                            width={80}
                            height={80}
                            className="max-w-full max-h-full object-contain"
                            style={{
                              maxWidth: '80%',
                              maxHeight: '80%',
                              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))'
                            }}
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="text-white opacity-80">
                                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                  </div>
                                `;
                              }
                            }}
                          />
                        ) : (subcategory.id === 'blkjar') ? (
                          <Image
                            src="/images/thumbnails/glass-plastic-containers/blkjar.png"
                            alt={subcategory.name}
                            width={80}
                            height={80}
                            className="max-w-full max-h-full object-contain"
                            style={{
                              maxWidth: '80%',
                              maxHeight: '80%',
                              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))'
                            }}
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="text-white opacity-80">
                                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                  </div>
                                `;
                              }
                            }}
                          />
                        ) : (subcategory.id === 'child-resistant-glass-jar') ? (
                          <Image
                            src="/images/thumbnails/glass-plastic-containers/glassjar.png"
                            alt={subcategory.name}
                            width={95}
                            height={95}
                            className="max-w-full max-h-full object-contain"
                            style={{
                              maxWidth: '95%',
                              maxHeight: '95%',
                              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))'
                            }}
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="text-white opacity-80">
                                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                  </div>
                                `;
                              }
                            }}
                          />
                        ) : (
                          <div className="text-white opacity-80">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Product Info and Use Button */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-medium text-sm">{subcategory.name}</h3>
                        <ButtonCta
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubcategoryClick(subcategory, category.id);
                          }}
                          label="Use"
                          className="flex-shrink-0 ml-2 text-xs py-1 px-3"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductSidebar;
