// Project Management for XTRACT Studio
// Handles saving and loading complete model states as projects

import { LayerState } from './layerManager';
import { ModelState } from './modelStateManager';

export interface ProjectState {
  id: string;
  name: string;
  description?: string;
  productId: string;
  productName: string;
  modelPath: string;
  
  // Complete model state
  modelState: {
    scale: [number, number, number];
    cameraDistance: number;
    cameraY: number;
    modelHeight: number;
    customizationState: {
      selectedColor: string;
      hasColorChanged: boolean;
      selectedArtwork: string;
      targetPart: string;
      reflectiveness: number;
    };
  };
  
  // All layers and their configurations
  layerState: {
    layers: Array<{
      id: string;
      name: string;
      type: 'color' | 'artwork' | 'material';
      value: string;
      targetPart: string;
      isVisible: boolean;
      order: number;
      position?: { x: number; y: number; z: number };
      scale?: number;
      materialId?: string;
      materialType?: string;
    }>;
    activeLayerId: string | null;
  };
  
  // Metadata
  createdAt: number;
  updatedAt: number;
  version: string;
  
  // Preview data
  thumbnail?: string; // Base64 encoded screenshot
}

export interface SaveProjectRequest {
  name: string;
  description?: string;
  modelState: ModelState;
  layerState: LayerState;
  selectedProduct: {
    id: string;
    name: string;
    modelPath: string;
  };
  thumbnail?: string;
}

export interface SaveProjectResponse {
  success: boolean;
  projectId?: string;
  error?: string;
}

export interface LoadProjectResponse {
  success: boolean;
  project?: ProjectState;
  error?: string;
}

export interface ProjectListResponse {
  success: boolean;
  projects?: Array<{
    id: string;
    name: string;
    description?: string;
    productName: string;
    createdAt: number;
    updatedAt: number;
    thumbnail?: string;
  }>;
  error?: string;
}

export class ProjectManager {
  private static instance: ProjectManager;

  static getInstance(): ProjectManager {
    if (!ProjectManager.instance) {
      ProjectManager.instance = new ProjectManager();
    }
    return ProjectManager.instance;
  }

  // Save a project to localStorage (can be extended to use backend API)
  async saveProject(request: SaveProjectRequest): Promise<SaveProjectResponse> {
    try {
      console.log('💾 ProjectManager: Saving project...', request.name);

      // Generate unique project ID
      const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create project state
      const projectState: ProjectState = {
        id: projectId,
        name: request.name,
        description: request.description,
        productId: request.selectedProduct.id,
        productName: request.selectedProduct.name,
        modelPath: request.selectedProduct.modelPath,
        
        modelState: {
          scale: request.modelState.scale,
          cameraDistance: request.modelState.cameraDistance,
          cameraY: request.modelState.cameraY,
          modelHeight: request.modelState.modelHeight,
          customizationState: { ...request.modelState.customizationState }
        },
        
        layerState: {
          layers: request.layerState.layers.map(layer => ({
            id: layer.id,
            name: layer.name,
            type: layer.type,
            value: layer.value,
            targetPart: layer.targetPart,
            isVisible: layer.isVisible,
            order: layer.order,
            position: layer.position ? { ...layer.position } : undefined,
            scale: layer.scale,
            materialId: layer.materialId,
            materialType: layer.materialType
          })),
          activeLayerId: request.layerState.activeLayerId
        },
        
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '1.0.0',
        thumbnail: request.thumbnail
      };

      // Save to localStorage
      const existingProjects = this.getProjectsFromStorage();
      existingProjects[projectId] = projectState;
      localStorage.setItem('xtract_projects', JSON.stringify(existingProjects));

      console.log('✅ ProjectManager: Project saved successfully', projectId);
      return { success: true, projectId };

    } catch (error) {
      console.error('❌ ProjectManager: Failed to save project', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Load a project from localStorage
  async loadProject(projectId: string): Promise<LoadProjectResponse> {
    try {
      console.log('📁 ProjectManager: Loading project...', projectId);

      const projects = this.getProjectsFromStorage();
      const project = projects[projectId];

      if (!project) {
        return { success: false, error: 'Project not found' };
      }

      console.log('✅ ProjectManager: Project loaded successfully', projectId);
      return { success: true, project };

    } catch (error) {
      console.error('❌ ProjectManager: Failed to load project', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get list of all projects
  async getProjectList(): Promise<ProjectListResponse> {
    try {
      console.log('📋 ProjectManager: Getting project list...');

      const projects = this.getProjectsFromStorage();
      const projectList = Object.values(projects).map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        productName: project.productName,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        thumbnail: project.thumbnail
      }));

      // Sort by updated date (most recent first)
      projectList.sort((a, b) => b.updatedAt - a.updatedAt);

      console.log('✅ ProjectManager: Project list retrieved', projectList.length);
      return { success: true, projects: projectList };

    } catch (error) {
      console.error('❌ ProjectManager: Failed to get project list', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Delete a project
  async deleteProject(projectId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🗑️ ProjectManager: Deleting project...', projectId);

      const projects = this.getProjectsFromStorage();
      if (!projects[projectId]) {
        return { success: false, error: 'Project not found' };
      }

      delete projects[projectId];
      localStorage.setItem('xtract_projects', JSON.stringify(projects));

      console.log('✅ ProjectManager: Project deleted successfully', projectId);
      return { success: true };

    } catch (error) {
      console.error('❌ ProjectManager: Failed to delete project', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Helper method to get projects from localStorage
  private getProjectsFromStorage(): Record<string, ProjectState> {
    try {
      const stored = localStorage.getItem('xtract_projects');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('❌ ProjectManager: Failed to parse stored projects', error);
      return {};
    }
  }

  // Export project as JSON file
  async exportProject(projectId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.loadProject(projectId);
      if (!result.success || !result.project) {
        return { success: false, error: result.error || 'Project not found' };
      }

      const dataStr = JSON.stringify(result.project, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${result.project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_project.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

      console.log('✅ ProjectManager: Project exported successfully', projectId);
      return { success: true };

    } catch (error) {
      console.error('❌ ProjectManager: Failed to export project', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Import project from JSON file
  async importProject(file: File): Promise<SaveProjectResponse> {
    try {
      const text = await file.text();
      const projectData = JSON.parse(text) as ProjectState;

      // Validate project data structure
      if (!projectData.id || !projectData.name || !projectData.modelState || !projectData.layerState) {
        return { success: false, error: 'Invalid project file format' };
      }

      // Generate new ID to avoid conflicts
      const newProjectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      projectData.id = newProjectId;
      projectData.updatedAt = Date.now();

      // Save imported project
      const existingProjects = this.getProjectsFromStorage();
      existingProjects[newProjectId] = projectData;
      localStorage.setItem('xtract_projects', JSON.stringify(existingProjects));

      console.log('✅ ProjectManager: Project imported successfully', newProjectId);
      return { success: true, projectId: newProjectId };

    } catch (error) {
      console.error('❌ ProjectManager: Failed to import project', error);
      return { success: false, error: error instanceof Error ? error.message : 'Invalid project file' };
    }
  }
}

// Export singleton instance
export const projectManager = ProjectManager.getInstance();
