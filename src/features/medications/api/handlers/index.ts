import { Request, Response } from 'express';
import { medicationService } from '../../services/medicationService';
import { medicationAnalytics } from '../../services/medicationAnalytics';
import { medicationSafety } from '../../services/medicationSafety';
import { stockManagement } from '../../services/stockManagement';
import { complianceAudit } from '../../services/complianceAudit';
import { documentationService } from '../../services/documentationService';
import { prnTracking } from '../../services/prnTracking';
import { ApiError } from '@/lib/errors';

// Medication Management Handlers
export const listMedications = async (req: Request, res: Response) => {
  try {
    const { residentId, careHomeId, active } = req.query;
    const medications = await medicationService.list({ residentId, careHomeId, active });
    res.json(medications);
  } catch (error) {
    throw new ApiError('Failed to list medications', error);
  }
};

export const getMedication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const medication = await medicationService.get(id);
    res.json(medication);
  } catch (error) {
    throw new ApiError('Failed to get medication', error);
  }
};

export const createMedication = async (req: Request, res: Response) => {
  try {
    const medication = await medicationService.create(req.body);
    res.status(201).json(medication);
  } catch (error) {
    throw new ApiError('Failed to create medication', error);
  }
};

export const updateMedication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const medication = await medicationService.update(id, req.body);
    res.json(medication);
  } catch (error) {
    throw new ApiError('Failed to update medication', error);
  }
};

export const deleteMedication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await medicationService.delete(id);
    res.status(204).send();
  } catch (error) {
    throw new ApiError('Failed to delete medication', error);
  }
};

// Administration Handlers
export const listAdministrations = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const administrations = await medicationService.listAdministrations(id, { startDate, endDate });
    res.json(administrations);
  } catch (error) {
    throw new ApiError('Failed to list administrations', error);
  }
};

export const recordAdministration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const administration = await medicationService.recordAdministration(id, req.body);
    res.status(201).json(administration);
  } catch (error) {
    throw new ApiError('Failed to record administration', error);
  }
};

// Analytics Handlers
export const getResidentAnalytics = async (req: Request, res: Response) => {
  try {
    const { residentId } = req.params;
    const analytics = await medicationAnalytics.getResidentAnalytics(residentId);
    res.json(analytics);
  } catch (error) {
    throw new ApiError('Failed to get resident analytics', error);
  }
};

export const getCareHomeAnalytics = async (req: Request, res: Response) => {
  try {
    const { careHomeId } = req.params;
    const analytics = await medicationAnalytics.getCareHomeAnalytics(careHomeId);
    res.json(analytics);
  } catch (error) {
    throw new ApiError('Failed to get care home analytics', error);
  }
};

// Safety Handlers
export const checkInteractions = async (req: Request, res: Response) => {
  try {
    const { medications } = req.query;
    const interactions = await medicationSafety.checkInteractions(medications);
    res.json(interactions);
  } catch (error) {
    throw new ApiError('Failed to check interactions', error);
  }
};

export const assessRisks = async (req: Request, res: Response) => {
  try {
    const { residentId } = req.params;
    const risks = await medicationSafety.analyzeSafetyRisks(residentId);
    res.json(risks);
  } catch (error) {
    throw new ApiError('Failed to assess risks', error);
  }
};

// Stock Management Handlers
export const getStockLevels = async (req: Request, res: Response) => {
  try {
    const { careHomeId } = req.query;
    const stock = await stockManagement.getStockLevels(careHomeId);
    res.json(stock);
  } catch (error) {
    throw new ApiError('Failed to get stock levels', error);
  }
};

export const createStockOrder = async (req: Request, res: Response) => {
  try {
    const order = await stockManagement.createOrder(req.body);
    res.status(201).json(order);
  } catch (error) {
    throw new ApiError('Failed to create stock order', error);
  }
};

export const receiveStock = async (req: Request, res: Response) => {
  try {
    const receipt = await stockManagement.receiveStock(req.body);
    res.status(201).json(receipt);
  } catch (error) {
    throw new ApiError('Failed to receive stock', error);
  }
};

// Compliance Handlers
export const getComplianceAudit = async (req: Request, res: Response) => {
  try {
    const { careHomeId } = req.params;
    const audit = await complianceAudit.getAudit(careHomeId);
    res.json(audit);
  } catch (error) {
    throw new ApiError('Failed to get compliance audit', error);
  }
};

export const generateComplianceReport = async (req: Request, res: Response) => {
  try {
    const { reportType } = req.params;
    const { startDate, endDate, careHomeId } = req.query;
    const report = await complianceAudit.generateReport(reportType, { startDate, endDate, careHomeId });
    res.json(report);
  } catch (error) {
    throw new ApiError('Failed to generate compliance report', error);
  }
};

// Documentation Handlers
export const listDocuments = async (req: Request, res: Response) => {
  try {
    const { residentId } = req.params;
    const documents = await documentationService.listDocuments(residentId);
    res.json(documents);
  } catch (error) {
    throw new ApiError('Failed to list documents', error);
  }
};

export const createDocument = async (req: Request, res: Response) => {
  try {
    const { residentId } = req.params;
    const document = await documentationService.createDocument(residentId, req.body);
    res.status(201).json(document);
  } catch (error) {
    throw new ApiError('Failed to create document', error);
  }
};

// PRN Handlers
export const listPRNMedications = async (req: Request, res: Response) => {
  try {
    const { residentId } = req.params;
    const prnMedications = await prnTracking.listPRNMedications(residentId);
    res.json(prnMedications);
  } catch (error) {
    throw new ApiError('Failed to list PRN medications', error);
  }
};

export const recordPRNRequest = async (req: Request, res: Response) => {
  try {
    const { residentId } = req.params;
    const request = await prnTracking.recordRequest(residentId, req.body);
    res.status(201).json(request);
  } catch (error) {
    throw new ApiError('Failed to record PRN request', error);
  }
};


