/**
 * @fileoverview Currency Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * API routes for currency operations and settings
 */

import { NextRequest } from 'next/server';
import {
  handleCurrencyConversion,
  handleGetOrganizationCurrencies,
  handleUpdateCurrencySettings,
} from '../../../handlers/core/currencyHandlers';

export async function GET(
  req: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  return handleGetOrganizationCurrencies(req, { params });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  return handleCurrencyConversion(req, { params });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  return handleUpdateCurrencySettings(req, { params });
} 