/**
 * @fileoverview Financial Transactions Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * API routes for financial transactions
 */

import { NextRequest } from 'next/server';
import {
  handleGetTransactions,
  handleCreateTransaction,
  handleUpdateTransaction,
  handleDeleteTransaction,
} from '../../../handlers/core/transactionHandlers';

export async function GET(
  req: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  return handleGetTransactions(req, { params });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  return handleCreateTransaction(req, { params });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { organizationId: string; transactionId: string } }
) {
  return handleUpdateTransaction(req, { params });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { organizationId: string; transactionId: string } }
) {
  return handleDeleteTransaction(req, { params });
} 