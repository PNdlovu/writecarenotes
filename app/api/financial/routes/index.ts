/**
 * @fileoverview Financial API Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Route definitions for financial management API
 */

import { NextRequest } from 'next/server';
import {
  handleGetFinancialSummary,
  handleGetResidentFinancial,
  handleUpdateResidentFinancial
} from '../handlers';

export async function GET(req: NextRequest) {
  return handleGetFinancialSummary(req);
}

export async function POST(req: NextRequest) {
  // Handle POST requests
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return handleUpdateResidentFinancial(req, { params });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  // Handle DELETE requests
} 
