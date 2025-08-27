'use client';

import React, { useState, useEffect } from 'react';
import { projectManager, ProjectState } from '@/lib/projectManager';
import { modelStateManager } from '@/lib/modelStateManager';
import { layerManager } from '@/lib/layerManager';
import { Product } from '@/app/studio/page';

interface ProjectsPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onProjectLoad: (product: Product) => void;
}

interface ProjectListItem {
  id: string;
  name: string;
  description?: string;
  productName: string;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
}

const ProjectsPanel: React.FC<ProjectsPanelProps> = ({
  isVisible,
  onClose,
  onProjectLoad
}) => {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [loadingProject, setLoadingProject] = useState<string | null>(null);

  // Load projects when panel becomes visible
  useEffect(() => {
    if (isVisible) {
      loadProjects();
    }
  }, [isVisible]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📂 ProjectsPanel: Loading projects...');

      const result = await projectManager.getProjectList();
      
      if (result.success && result.projects) {
        setProjects(result.projects);
        console.log('✅ ProjectsPanel: Loaded', result.projects.length, 'projects');
      } else {
        throw new Error(result.error || 'Failed to load projects');
      }
    } catch (err) {
      console.error('❌ ProjectsPanel: Failed to load projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadProject = async (projectId: string) => {
    try {
      setLoadingProject(projectId);
      console.log('📁 ProjectsPanel: Loading project...', projectId);

      const result = await projectManager.loadProject(projectId);
      
      if (!result.success || !result.project) {
        throw new Error(result.error || 'Failed to load project');
      }

      const project = result.project;
      console.log('✅ ProjectsPanel: Project loaded successfully', project);

      // First, create a Product object to trigger proper product switching
      const productForLoading: Product = {
        id: project.productId,
        name: project.productName,
        category: 'loaded-project',
        modelPath: project.modelPath
      };

      // Call the product load callback to switch the main app to this product
      onProjectLoad(productForLoading);

      // Wait a bit for the product to load, then apply the project state
      setTimeout(async () => {
        try {
          console.log('🔄 ProjectsPanel: Applying project state...');

          // Clear current state first
          layerManager.clearAllLayers();
          
          // Apply model state to the manager
          modelStateManager.updateCustomizationState(project.modelState.customizationState);
          modelStateManager.updateScale(project.modelState.scale);
          modelStateManager.updateCameraDistance(project.modelState.cameraDistance);

          // Recreate all layers from the project
          for (const layerData of project.layerState.layers) {
            const layer = layerManager.createLayer(
              layerData.name,
              layerData.type,
              layerData.targetPart,
              layerData.value
            );

            if (layer) {
              // Apply additional layer properties
              if (layerData.position) {
                layerManager.updateLayerPosition(layer.id, layerData.position);
              }
              if (layerData.scale !== undefined) {
                layerManager.updateLayerScale(layer.id, layerData.scale);
              }
              if (layerData.materialId) {
                layerManager.updateLayer(layer.id, {
                  materialId: layerData.materialId,
                  materialType: layerData.materialType
                });
              }
              if (!layerData.isVisible) {
                layerManager.toggleLayerVisibility(layer.id);
              }
            }
          }

          // Set active layer if specified
          if (project.layerState.activeLayerId) {
            layerManager.setActiveLayer(project.layerState.activeLayerId);
          }

          console.log('✅ ProjectsPanel: Project state applied successfully');
          alert(`Project "${project.name}" loaded successfully!`);
          onClose();

        } catch (error) {
          console.error('❌ ProjectsPanel: Failed to apply project state:', error);
          alert(`Failed to apply project state: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }, 1000); // Wait 1 second for the product to load

    } catch (error) {
      console.error('❌ ProjectsPanel: Failed to load project:', error);
      alert(`Failed to load project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingProject(null);
    }
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      console.log('🗑️ ProjectsPanel: Deleting project...', projectId);

      const result = await projectManager.deleteProject(projectId);
      
      if (result.success) {
        console.log('✅ ProjectsPanel: Project deleted successfully');
        setProjects(projects.filter(p => p.id !== projectId));
        alert(`Project "${projectName}" deleted successfully`);
      } else {
        throw new Error(result.error || 'Failed to delete project');
      }
    } catch (error) {
      console.error('❌ ProjectsPanel: Failed to delete project:', error);
      alert(`Failed to delete project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleExportProject = async (projectId: string) => {
    try {
      console.log('📤 ProjectsPanel: Exporting project...', projectId);

      const result = await projectManager.exportProject(projectId);
      
      if (result.success) {
        console.log('✅ ProjectsPanel: Project exported successfully');
      } else {
        throw new Error(result.error || 'Failed to export project');
      }
    } catch (error) {
      console.error('❌ ProjectsPanel: Failed to export project:', error);
      alert(`Failed to export project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-gray-900 rounded-lg w-[90vw] max-w-4xl h-[80vh] flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">My Projects</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadProjects}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              title="Refresh projects"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
                <p>Loading projects...</p>
              </div>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-red-400">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>{error}</p>
                <button
                  onClick={loadProjects}
                  className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : projects.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-300 mb-2">No Projects Yet</h3>
                <p className="text-sm text-gray-500">Save your first project to see it here</p>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-all duration-200 ${
                      selectedProject === project.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
                  >
                    {/* Thumbnail */}
                    <div className="w-full h-32 bg-gray-700 flex items-center justify-center">
                      {project.thumbnail ? (
                        <img
                          src={project.thumbnail}
                          alt={project.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center text-gray-500">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              </div>
                            `;
                          }}
                        />
                      ) : (
                        <div className="text-gray-500">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Project Info */}
                    <div className="p-4">
                      <h3 className="font-medium text-white text-sm truncate mb-1" title={project.name}>
                        {project.name}
                      </h3>
                      <p className="text-xs text-gray-400 truncate mb-2" title={project.productName}>
                        {project.productName}
                      </p>
                      {project.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2" title={project.description}>
                          {project.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {formatDate(project.updatedAt)}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLoadProject(project.id);
                          }}
                          disabled={loadingProject === project.id}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors disabled:opacity-50"
                        >
                          {loadingProject === project.id ? 'Loading...' : 'Load'}
                        </button>
                        
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportProject(project.id);
                            }}
                            className="p-1 text-gray-400 hover:text-white transition-colors"
                            title="Export project"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id, project.name);
                            }}
                            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                            title="Delete project"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPanel;
