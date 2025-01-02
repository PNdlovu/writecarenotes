/**
 * @fileoverview Care Inspectorate Financial Report Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * API routes for Care Inspectorate financial reporting
 */

import { NextRequest } from 'next/server';
import { handleCIFinancialReport } from '../../../../../handlers/regulatory/scotland/ciHandlers';

export async function GET(
  req: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  return handleCIFinancialReport(req, { params });
} 