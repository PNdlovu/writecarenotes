/**
 * @fileoverview Ofsted Financial Report Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * API routes for Ofsted financial reporting. Handles financial reporting for:
 * - Children's Homes
 * - Residential Special Schools
 * - Residential Family Centres
 * - Holiday Schemes for Disabled Children
 * - Residential Holiday Schemes for Disabled Children
 * 
 * Note: For adult social care and healthcare settings, use the CQC routes instead.
 */

import { NextRequest } from 'next/server';
import { handleOfstedFinancialReport } from '../../../../../handlers/regulatory/england/ofstedHandlers';

export async function GET(
  req: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  return handleOfstedFinancialReport(req, { params });
} 