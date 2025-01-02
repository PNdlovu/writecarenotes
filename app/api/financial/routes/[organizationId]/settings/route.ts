/**
 * @fileoverview Financial Settings Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * API routes for financial settings
 */

import { NextRequest } from 'next/server';
import {
  handleGetSettings,
  handleUpdateSettings,
} from '../../../handlers/core/settingsHandlers';

export async function GET(
  req: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  return handleGetSettings(req, { params });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  return handleUpdateSettings(req, { params });
} 