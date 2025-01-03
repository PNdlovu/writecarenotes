/**
 * @fileoverview Document API Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Route definitions for document management related endpoints
 */

import { NextRequest } from 'next/server';
import {
  handleGetDocuments,
  handleCreateDocument,
  handleUpdateDocument,
  handleDeleteDocument,
} from '../handlers/documentHandlers';

export async function GET(req: NextRequest) {
  return handleGetDocuments(req);
}

export async function POST(req: NextRequest) {
  return handleCreateDocument(req);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return handleUpdateDocument(req, { params });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return handleDeleteDocument(req, { params });
} 
