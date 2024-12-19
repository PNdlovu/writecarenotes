import axios from 'axios';
import {
  EmergencyIncident,
  EmergencyProtocol,
  EmergencyContact,
  EmergencyResource,
  EmergencyDrillRecord,
  EmergencyStats,
  EmergencyType,
  EmergencyStatus,
  EmergencyPriority,
} from '../types/emergency';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const emergencyService = {
  // Incident Management
  async getIncidents(params?: {
    status?: EmergencyStatus;
    type?: EmergencyType;
    priority?: EmergencyPriority;
    startDate?: string;
    endDate?: string;
  }): Promise<EmergencyIncident[]> {
    const { data } = await axios.get(`${API_BASE_URL}/emergency/incidents`, { params });
    return data;
  },

  async getIncidentById(id: string): Promise<EmergencyIncident> {
    const { data } = await axios.get(`${API_BASE_URL}/emergency/incidents/${id}`);
    return data;
  },

  async createIncident(incident: Omit<EmergencyIncident, 'id'>): Promise<EmergencyIncident> {
    const { data } = await axios.post(`${API_BASE_URL}/emergency/incidents`, incident);
    return data;
  },

  async updateIncident(id: string, update: Partial<EmergencyIncident>): Promise<EmergencyIncident> {
    const { data } = await axios.patch(`${API_BASE_URL}/emergency/incidents/${id}`, update);
    return data;
  },

  async resolveIncident(id: string, resolutionNotes: string): Promise<EmergencyIncident> {
    const { data } = await axios.post(`${API_BASE_URL}/emergency/incidents/${id}/resolve`, {
      resolutionNotes,
    });
    return data;
  },

  // Protocol Management
  async getProtocols(type?: EmergencyType): Promise<EmergencyProtocol[]> {
    const { data } = await axios.get(`${API_BASE_URL}/emergency/protocols`, {
      params: { type },
    });
    return data;
  },

  async getProtocolById(id: string): Promise<EmergencyProtocol> {
    const { data } = await axios.get(`${API_BASE_URL}/emergency/protocols/${id}`);
    return data;
  },

  async createProtocol(protocol: Omit<EmergencyProtocol, 'id'>): Promise<EmergencyProtocol> {
    const { data } = await axios.post(`${API_BASE_URL}/emergency/protocols`, protocol);
    return data;
  },

  async updateProtocol(id: string, update: Partial<EmergencyProtocol>): Promise<EmergencyProtocol> {
    const { data } = await axios.patch(`${API_BASE_URL}/emergency/protocols/${id}`, update);
    return data;
  },

  // Contact Management
  async getContacts(params?: {
    department?: string;
    isOnCall?: boolean;
  }): Promise<EmergencyContact[]> {
    const { data } = await axios.get(`${API_BASE_URL}/emergency/contacts`, { params });
    return data;
  },

  async getContactById(id: string): Promise<EmergencyContact> {
    const { data } = await axios.get(`${API_BASE_URL}/emergency/contacts/${id}`);
    return data;
  },

  async createContact(contact: Omit<EmergencyContact, 'id'>): Promise<EmergencyContact> {
    const { data } = await axios.post(`${API_BASE_URL}/emergency/contacts`, contact);
    return data;
  },

  async updateContact(id: string, update: Partial<EmergencyContact>): Promise<EmergencyContact> {
    const { data } = await axios.patch(`${API_BASE_URL}/emergency/contacts/${id}`, update);
    return data;
  },

  // Resource Management
  async getResources(params?: {
    type?: string;
    status?: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'DEPLETED';
  }): Promise<EmergencyResource[]> {
    const { data } = await axios.get(`${API_BASE_URL}/emergency/resources`, { params });
    return data;
  },

  async getResourceById(id: string): Promise<EmergencyResource> {
    const { data } = await axios.get(`${API_BASE_URL}/emergency/resources/${id}`);
    return data;
  },

  async updateResourceStatus(
    id: string,
    status: EmergencyResource['status'],
    notes?: string
  ): Promise<EmergencyResource> {
    const { data } = await axios.patch(`${API_BASE_URL}/emergency/resources/${id}/status`, {
      status,
      notes,
    });
    return data;
  },

  // Drill Management
  async getDrills(params?: {
    type?: EmergencyType;
    startDate?: string;
    endDate?: string;
  }): Promise<EmergencyDrillRecord[]> {
    const { data } = await axios.get(`${API_BASE_URL}/emergency/drills`, { params });
    return data;
  },

  async getDrillById(id: string): Promise<EmergencyDrillRecord> {
    const { data } = await axios.get(`${API_BASE_URL}/emergency/drills/${id}`);
    return data;
  },

  async createDrill(drill: Omit<EmergencyDrillRecord, 'id'>): Promise<EmergencyDrillRecord> {
    const { data } = await axios.post(`${API_BASE_URL}/emergency/drills`, drill);
    return data;
  },

  async updateDrill(id: string, update: Partial<EmergencyDrillRecord>): Promise<EmergencyDrillRecord> {
    const { data } = await axios.patch(`${API_BASE_URL}/emergency/drills/${id}`, update);
    return data;
  },

  // Statistics and Analytics
  async getEmergencyStats(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<EmergencyStats> {
    const { data } = await axios.get(`${API_BASE_URL}/emergency/stats`, { params });
    return data;
  },

  // Notifications
  async subscribeToEmergencyAlerts(userId: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/emergency/alerts/subscribe`, { userId });
  },

  async unsubscribeFromEmergencyAlerts(userId: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/emergency/alerts/unsubscribe`, { userId });
  },
};


