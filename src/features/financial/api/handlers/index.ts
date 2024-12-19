import { Request, Response } from 'express';
import { FinancialService } from '../../services/financialService';
import { FinancialError } from '../../utils/errors';
import { validateGDPRConsent } from '../../utils/gdpr';
import { Logger } from '@/lib/logger';

const financialService = new FinancialService();
const logger = new Logger('financial-api');

export async function getFinancialSummary(req: Request, res: Response) {
  try {
    const { tenantId } = req.user;
    const summary = await financialService.getFinancialSummary(tenantId);
    res.json(summary);
  } catch (error) {
    logger.error('Failed to get financial summary', error);
    handleError(res, error);
  }
}

export async function getResidentFinancial(req: Request, res: Response) {
  try {
    const { residentId } = req.params;
    await validateGDPRConsent(residentId);
    
    const financial = await financialService.getResidentFinancial(residentId);
    if (!financial) {
      return res.status(404).json({
        error: 'Resident financial record not found'
      });
    }
    res.json(financial);
  } catch (error) {
    logger.error('Failed to get resident financial', error);
    handleError(res, error);
  }
}

export async function updateResidentFinancial(req: Request, res: Response) {
  try {
    const { residentId } = req.params;
    const { tenantId } = req.user;
    await validateGDPRConsent(residentId);
    
    const updated = await financialService.upsertResidentFinancial(
      residentId,
      tenantId,
      req.body
    );
    res.json(updated);
  } catch (error) {
    logger.error('Failed to update resident financial', error);
    handleError(res, error);
  }
}

export async function getFinancialSettings(req: Request, res: Response) {
  try {
    const { tenantId } = req.user;
    const settings = await financialService.getSettings(tenantId);
    res.json(settings);
  } catch (error) {
    logger.error('Failed to get financial settings', error);
    handleError(res, error);
  }
}

export async function updateFinancialSettings(req: Request, res: Response) {
  try {
    const { tenantId } = req.user;
    const updated = await financialService.updateSettings(tenantId, req.body);
    res.json(updated);
  } catch (error) {
    logger.error('Failed to update financial settings', error);
    handleError(res, error);
  }
}

export async function processTransaction(req: Request, res: Response) {
  try {
    const { tenantId } = req.user;
    const transaction = await financialService.processTransaction(
      tenantId,
      req.body
    );
    res.json(transaction);
  } catch (error) {
    logger.error('Failed to process transaction', error);
    handleError(res, error);
  }
}

export async function getTransactions(req: Request, res: Response) {
  try {
    const { tenantId } = req.user;
    const { startDate, endDate, status, type } = req.query;
    
    const transactions = await financialService.getTransactions(tenantId, {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      status: status as string,
      type: type as string
    });
    res.json(transactions);
  } catch (error) {
    logger.error('Failed to get transactions', error);
    handleError(res, error);
  }
}

export async function exportFinancialReport(req: Request, res: Response) {
  try {
    const { tenantId } = req.user;
    const { reportType, period, format } = req.body;
    
    const report = await financialService.generateReport(
      tenantId,
      reportType,
      period,
      format
    );
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="financial-report-${period.start}-${period.end}.${format}"`
    );
    res.send(report);
  } catch (error) {
    logger.error('Failed to export financial report', error);
    handleError(res, error);
  }
}

function handleError(res: Response, error: any) {
  if (error instanceof FinancialError) {
    res.status(error.code === 'NOT_FOUND' ? 404 : 400).json({
      error: error.message,
      code: error.code,
      details: error.details
    });
  } else {
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}


