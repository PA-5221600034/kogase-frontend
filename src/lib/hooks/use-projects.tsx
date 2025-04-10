"use client";

import { useState } from 'react';
import { projectsApi } from '@/lib/api';
import { 
  CreateProjectRequest, 
  CreateProjectResponse, 
  GetProjectResponseDetail, 
  GetProjectsResponse, 
  UpdateProjectRequest, 
  UpdateProjectResponse, 
  DeleteProjectResponse, 
  GetProjectResponse
} from '@/lib/dtos';

export function useProjects() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const createProject = async (createProjectRequest: CreateProjectRequest): Promise<CreateProjectResponse> => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectsApi.createProject(createProjectRequest);
      return response;
    } catch (err) {
      console.error('Failed to create project:', err);
      setError('Failed to create project');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProjects = async (): Promise<GetProjectsResponse> => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectsApi.getProjects();
      return response;
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError('Failed to fetch projects');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const getProject = async (id: string): Promise<GetProjectResponseDetail> => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectsApi.getProject(id);
      return response;
    } catch (err) {
      console.error(`Failed to fetch project ${id}:`, err);
      setError(`Failed to fetch project ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const updateProject = async (id: string, updateProjectRequest: UpdateProjectRequest): Promise<UpdateProjectResponse> => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectsApi.updateProject(id, updateProjectRequest);
      return response;
    } catch (err) {
      console.error(`Failed to update project ${id}:`, err);
      setError(`Failed to update project ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const deleteProject = async (id: string): Promise<DeleteProjectResponse> => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectsApi.deleteProject(id);
      return response;
    } catch (err) {
      console.error(`Failed to delete project ${id}:`, err);
      setError(`Failed to delete project ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const regenerateApiKey = async (id: string): Promise<GetProjectResponse> => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectsApi.regenerateApiKey(id);
      return response;
    } catch (err) {
      console.error(`Failed to regenerate API key for project ${id}:`, err);
      setError(`Failed to regenerate API key for project ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject,
    regenerateApiKey
  };
} 