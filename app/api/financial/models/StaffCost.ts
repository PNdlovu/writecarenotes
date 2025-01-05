/**
 * @fileoverview Staff Cost Database Model
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { Schema, model, models } from 'mongoose';
import { z } from 'zod';
import { staffCostRecordSchema } from '../validation/staffCostSchemas';

const staffCostSchema = new Schema({
  organizationId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
  },
  periodStart: {
    type: Date,
    required: true,
  },
  periodEnd: {
    type: Date,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  costCenter: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['agency-costs', 'staffing-ratios', 'qualification-pay'],
  },
  // Agency Staff Costs fields
  agencyName: String,
  staffType: {
    type: String,
    enum: ['nurse', 'carer', 'specialist'],
  },
  hourlyRate: Number,
  hoursWorked: Number,
  totalCost: Number,
  // Staffing Ratios fields
  shiftType: {
    type: String,
    enum: ['day', 'night', 'weekend'],
  },
  residentsPerStaff: Number,
  minimumStaffRequired: Number,
  // Qualification Pay Rates fields
  qualification: String,
  baseRate: Number,
  experienceMultiplier: Number,
  specialityBonus: Number,
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
});

// Indexes for common queries
staffCostSchema.index({ organizationId: 1, type: 1 });
staffCostSchema.index({ organizationId: 1, periodStart: 1, periodEnd: 1 });
staffCostSchema.index({ organizationId: 1, department: 1, costCenter: 1 });

// Middleware to validate data against Zod schema before saving
staffCostSchema.pre('save', async function(next) {
  try {
    const validationResult = staffCostRecordSchema.safeParse(this.toObject());
    if (!validationResult.success) {
      throw new Error(validationResult.error.message);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Virtual for calculating total cost for agency staff
staffCostSchema.virtual('calculatedTotalCost').get(function() {
  if (this.type === 'agency-costs') {
    return this.hourlyRate * this.hoursWorked;
  }
  return null;
});

export const StaffCost = models.StaffCost || model('StaffCost', staffCostSchema); 
