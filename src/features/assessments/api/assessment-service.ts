import type { Assessment, AssessmentFilters, CreateAssessmentData } from '../types';

export const assessmentApi = {
  async createAssessment(data: CreateAssessmentData): Promise<Assessment> {
    const response = await fetch('/api/assessments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create assessment');
    }
    return response.json();
  },

  async updateAssessment(id: string, data: Partial<Assessment>): Promise<Assessment> {
    const response = await fetch(`/api/assessments/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update assessment');
    }
    return response.json();
  },

  async getAssessments(params?: { search?: string; category?: string }): Promise<Assessment[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.category) searchParams.set('category', params.category);
    
    const response = await fetch(`/api/assessments?${searchParams.toString()}`);

    if (!response.ok) {
      throw new Error('Failed to fetch assessments');
    }
    return response.json();
  },

  async getAssessmentById(id: string): Promise<Assessment> {
    const response = await fetch(`/api/assessments/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch assessment');
    }
    return response.json();
  },

  async deleteAssessment(id: string): Promise<void> {
    const response = await fetch(`/api/assessments/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete assessment');
    }
  },
};
