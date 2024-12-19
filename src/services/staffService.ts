import axios from 'axios';
import {
  StaffMember,
  ShiftAssignment,
  TimeOffRequest,
  StaffingRequirement,
  PayrollRecord,
  StaffStats,
  StaffRole,
  EmploymentStatus,
  Availability,
  Break,
  ShiftSwapRequest,
  Skill,
  Training,
  TrainingAssignment,
  TrainingProgress,
} from '../types/staff';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const staffService = {
  // Staff Member Management
  async getStaffMembers(params?: {
    role?: StaffRole;
    department?: string;
    status?: EmploymentStatus;
    search?: string;
    skills?: string[];
  }): Promise<StaffMember[]> {
    const { data } = await axios.get(`${API_BASE_URL}/staff`, { params });
    return data;
  },

  async getStaffMemberById(id: string): Promise<StaffMember> {
    const { data } = await axios.get(`${API_BASE_URL}/staff/${id}`);
    return data;
  },

  async createStaffMember(member: Omit<StaffMember, 'id'>): Promise<StaffMember> {
    const { data } = await axios.post(`${API_BASE_URL}/staff`, member);
    return data;
  },

  async updateStaffMember(id: string, update: Partial<StaffMember>): Promise<StaffMember> {
    const { data } = await axios.patch(`${API_BASE_URL}/staff/${id}`, update);
    return data;
  },

  async terminateStaffMember(
    id: string,
    terminationDate: string,
    reason: string
  ): Promise<StaffMember> {
    const { data } = await axios.post(`${API_BASE_URL}/staff/${id}/terminate`, {
      terminationDate,
      reason,
    });
    return data;
  },

  // Skills Management
  async addSkill(staffId: string, skill: Omit<Skill, 'id'>): Promise<StaffMember> {
    const { data } = await axios.post(`${API_BASE_URL}/staff/${staffId}/skills`, skill);
    return data;
  },

  async updateSkill(
    staffId: string,
    skillId: string,
    update: Partial<Skill>
  ): Promise<StaffMember> {
    const { data } = await axios.patch(
      `${API_BASE_URL}/staff/${staffId}/skills/${skillId}`,
      update
    );
    return data;
  },

  async removeSkill(staffId: string, skillId: string): Promise<StaffMember> {
    const { data } = await axios.delete(
      `${API_BASE_URL}/staff/${staffId}/skills/${skillId}`
    );
    return data;
  },

  // Availability Management
  async getStaffAvailability(
    staffId: string,
    startDate?: string,
    endDate?: string
  ): Promise<Availability[]> {
    const { data } = await axios.get(`${API_BASE_URL}/staff/${staffId}/availability`, {
      params: { startDate, endDate },
    });
    return data;
  },

  async updateAvailability(
    staffId: string,
    availability: Omit<Availability, 'id' | 'staffId'>[]
  ): Promise<Availability[]> {
    const { data } = await axios.put(
      `${API_BASE_URL}/staff/${staffId}/availability`,
      availability
    );
    return data;
  },

  // Schedule Management
  async getShiftAssignments(params?: {
    startDate?: string;
    endDate?: string;
    staffId?: string;
    department?: string;
    location?: string;
    status?: string;
  }): Promise<ShiftAssignment[]> {
    const { data } = await axios.get(`${API_BASE_URL}/staff/shifts`, { params });
    return data;
  },

  async createShiftAssignment(shift: Omit<ShiftAssignment, 'id'>): Promise<ShiftAssignment> {
    const { data } = await axios.post(`${API_BASE_URL}/staff/shifts`, shift);
    return data;
  },

  async updateShiftAssignment(
    id: string,
    update: Partial<ShiftAssignment>
  ): Promise<ShiftAssignment> {
    const { data } = await axios.patch(`${API_BASE_URL}/staff/shifts/${id}`, update);
    return data;
  },

  async deleteShiftAssignment(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/staff/shifts/${id}`);
  },

  async checkInStaff(
    shiftId: string,
    checkInTime: string,
    location?: string
  ): Promise<ShiftAssignment> {
    const { data } = await axios.post(`${API_BASE_URL}/staff/shifts/${shiftId}/check-in`, {
      checkInTime,
      location,
    });
    return data;
  },

  async checkOutStaff(
    shiftId: string,
    checkOutTime: string,
    location?: string
  ): Promise<ShiftAssignment> {
    const { data } = await axios.post(`${API_BASE_URL}/staff/shifts/${shiftId}/check-out`, {
      checkOutTime,
      location,
    });
    return data;
  },

  // Break Management
  async startBreak(shiftId: string, breakData: Omit<Break, 'id' | 'status'>): Promise<Break> {
    const { data } = await axios.post(`${API_BASE_URL}/staff/shifts/${shiftId}/breaks`, breakData);
    return data;
  },

  async endBreak(shiftId: string, breakId: string, endTime: string): Promise<Break> {
    const { data } = await axios.patch(
      `${API_BASE_URL}/staff/shifts/${shiftId}/breaks/${breakId}`,
      { endTime, status: 'COMPLETED' }
    );
    return data;
  },

  // Shift Swap Management
  async createShiftSwapRequest(request: Omit<ShiftSwapRequest, 'id'>): Promise<ShiftSwapRequest> {
    const { data } = await axios.post(`${API_BASE_URL}/staff/shift-swaps`, request);
    return data;
  },

  async respondToShiftSwapRequest(
    id: string,
    response: 'APPROVED' | 'REJECTED',
    notes?: string
  ): Promise<ShiftSwapRequest> {
    const { data } = await axios.patch(`${API_BASE_URL}/staff/shift-swaps/${id}/respond`, {
      response,
      notes,
    });
    return data;
  },

  async getShiftSwapRequests(params?: {
    staffId?: string;
    status?: ShiftSwapRequest['status'];
  }): Promise<ShiftSwapRequest[]> {
    const { data } = await axios.get(`${API_BASE_URL}/staff/shift-swaps`, { params });
    return data;
  },

  // Time Off Management
  async getTimeOffRequests(params?: {
    startDate?: string;
    endDate?: string;
    staffId?: string;
    status?: TimeOffRequest['status'];
  }): Promise<TimeOffRequest[]> {
    const { data } = await axios.get(`${API_BASE_URL}/staff/time-off`, { params });
    return data;
  },

  async createTimeOffRequest(request: Omit<TimeOffRequest, 'id'>): Promise<TimeOffRequest> {
    const { data } = await axios.post(`${API_BASE_URL}/staff/time-off`, request);
    return data;
  },

  async reviewTimeOffRequest(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    notes?: string
  ): Promise<TimeOffRequest> {
    const { data } = await axios.patch(`${API_BASE_URL}/staff/time-off/${id}/review`, {
      status,
      notes,
    });
    return data;
  },

  // Staffing Requirements
  async getStaffingRequirements(params?: {
    department?: string;
    role?: StaffRole;
    startDate?: string;
    endDate?: string;
  }): Promise<StaffingRequirement[]> {
    const { data } = await axios.get(`${API_BASE_URL}/staff/requirements`, { params });
    return data;
  },

  async updateStaffingRequirement(
    id: string,
    update: Partial<StaffingRequirement>
  ): Promise<StaffingRequirement> {
    const { data } = await axios.patch(`${API_BASE_URL}/staff/requirements/${id}`, update);
    return data;
  },

  // Performance Management
  async addPerformanceReview(
    staffId: string,
    review: StaffMember['performance']['reviews'][0]
  ): Promise<StaffMember> {
    const { data } = await axios.post(`${API_BASE_URL}/staff/${staffId}/reviews`, review);
    return data;
  },

  async addPerformanceIncident(
    staffId: string,
    incident: StaffMember['performance']['incidents'][0]
  ): Promise<StaffMember> {
    const { data } = await axios.post(`${API_BASE_URL}/staff/${staffId}/incidents`, incident);
    return data;
  },

  // Training Management
  async getAvailableTrainings(): Promise<Training[]> {
    const { data } = await axios.get(`${API_BASE_URL}/trainings`);
    return data;
  },

  async getStaffTrainingAssignments(staffId: string): Promise<TrainingAssignment[]> {
    const { data } = await axios.get(`${API_BASE_URL}/staff/${staffId}/trainings`);
    return data;
  },

  async assignTraining(
    staffId: string,
    assignment: Omit<TrainingAssignment, 'id'>
  ): Promise<TrainingAssignment> {
    const { data } = await axios.post(
      `${API_BASE_URL}/staff/${staffId}/trainings`,
      assignment
    );
    return data;
  },

  async updateTrainingStatus(
    staffId: string,
    assignmentId: string,
    update: Partial<TrainingAssignment>
  ): Promise<TrainingAssignment> {
    const { data } = await axios.patch(
      `${API_BASE_URL}/staff/${staffId}/trainings/${assignmentId}`,
      update
    );
    return data;
  },

  async getTrainingProgress(
    staffId: string,
    assignmentId: string
  ): Promise<TrainingProgress> {
    const { data } = await axios.get(
      `${API_BASE_URL}/staff/${staffId}/trainings/${assignmentId}/progress`
    );
    return data;
  },

  async uploadTrainingCertificate(
    staffId: string,
    assignmentId: string,
    certificate: FormData
  ): Promise<TrainingAssignment> {
    const { data } = await axios.post(
      `${API_BASE_URL}/staff/${staffId}/trainings/${assignmentId}/certificate`,
      certificate,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  async addCompletedTraining(
    staffId: string,
    training: StaffMember['training']['completed'][0]
  ): Promise<StaffMember> {
    const { data } = await axios.post(`${API_BASE_URL}/staff/${staffId}/training/completed`, training);
    return data;
  },

  async updateRequiredTraining(
    staffId: string,
    trainingId: string,
    update: Partial<StaffMember['training']['required'][0]>
  ): Promise<StaffMember> {
    const { data } = await axios.patch(
      `${API_BASE_URL}/staff/${staffId}/training/required/${trainingId}`,
      update
    );
    return data;
  },

  // Document Management
  async uploadStaffDocument(
    staffId: string,
    document: FormData
  ): Promise<StaffMember['documents'][0]> {
    const { data } = await axios.post(`${API_BASE_URL}/staff/${staffId}/documents`, document, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  // Payroll Management
  async getPayrollRecords(params?: {
    staffId?: string;
    startDate?: string;
    endDate?: string;
    status?: PayrollRecord['status'];
  }): Promise<PayrollRecord[]> {
    const { data } = await axios.get(`${API_BASE_URL}/staff/payroll`, { params });
    return data;
  },

  async createPayrollRecord(record: Omit<PayrollRecord, 'id'>): Promise<PayrollRecord> {
    const { data } = await axios.post(`${API_BASE_URL}/staff/payroll`, record);
    return data;
  },

  async approvePayrollRecord(id: string): Promise<PayrollRecord> {
    const { data } = await axios.post(`${API_BASE_URL}/staff/payroll/${id}/approve`);
    return data;
  },

  // Statistics and Analytics
  async getStaffStats(params?: {
    startDate?: string;
    endDate?: string;
    department?: string;
  }): Promise<StaffStats> {
    const { data } = await axios.get(`${API_BASE_URL}/staff/stats`, { params });
    return data;
  },
};


