import { Training, TrainingAssignment } from '../types';

export class TrainingAPI {
  private baseUrl = '/api/staff/training';

  async getTrainings(): Promise<Training[]> {
    const response = await fetch(`${this.baseUrl}`);
    return response.json();
  }

  async getTraining(id: string): Promise<Training> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    return response.json();
  }

  async createTraining(data: Omit<Training, 'id'>): Promise<Training> {
    const response = await fetch(`${this.baseUrl}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async assignTraining(data: Omit<TrainingAssignment, 'id'>): Promise<TrainingAssignment> {
    const response = await fetch(`${this.baseUrl}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async updateTrainingProgress(id: string, progress: number): Promise<TrainingAssignment> {
    const response = await fetch(`${this.baseUrl}/progress/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress }),
    });
    return response.json();
  }
}

export const trainingAPI = new TrainingAPI();


