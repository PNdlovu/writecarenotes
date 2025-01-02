/**
 * @fileoverview CQC Financial Report Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * API routes for CQC financial reporting. Handles financial reporting for:
 * - Adult Social Care
 * - Residential Care Homes
 * - Nursing Homes
 * - Domiciliary Care Services
 * - Supported Living Services
 * 
 * Note: For children's homes and educational settings, use the Ofsted routes instead.
 */

import { NextRequest } from 'next/server';
import { handleCQCFinancialReport } from '../../../../../handlers/regulatory/england/cqcHandlers';

export async function GET(
  req: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  return handleCQCFinancialReport(req, { params });
} 