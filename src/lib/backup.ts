import { BlobServiceClient } from '@azure/storage-blob';
import prisma from './prisma';
import { Document } from '@prisma/client';

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING!
);

const BACKUP_CONTAINER = process.env.AZURE_BACKUP_CONTAINER || 'document-backups';

export async function backupDocumentMetadata(organizationId: string) {
  try {
    // Fetch all documents for the organization
    const documents = await prisma.document.findMany({
      where: {
        organizationId,
      },
      include: {
        metadata: true,
        signatures: true,
        auditTrail: true,
      },
    });

    // Create backup file
    const timestamp = new Date().toISOString();
    const backupData = JSON.stringify(documents, null, 2);
    const blobName = `documents/${organizationId}/${timestamp}.json`;

    // Get container client
    const containerClient = blobServiceClient.getContainerClient(BACKUP_CONTAINER);
    await containerClient.createIfNotExists();

    // Upload to Azure Blob Storage
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(backupData, backupData.length, {
      blobHTTPHeaders: { blobContentType: 'application/json' }
    });

    // Log backup success
    await prisma.systemLog.create({
      data: {
        type: 'BACKUP',
        status: 'SUCCESS',
        details: `Document metadata backup created: ${blobName}`,
        organizationId,
      },
    });

    return { success: true, blobName };
  } catch (error) {
    console.error('Backup failed:', error);

    // Log backup failure
    await prisma.systemLog.create({
      data: {
        type: 'BACKUP',
        status: 'ERROR',
        details: `Document metadata backup failed: ${(error as Error).message}`,
        organizationId,
      },
    });

    throw error;
  }
}

export async function createDocumentVersion(document: Document) {
  try {
    // Create a new version record
    await prisma.documentVersion.create({
      data: {
        documentId: document.id,
        version: document.version,
        content: {
          ...document,
          version: document.version + 1,
        },
      },
    });

    // Update document version
    await prisma.document.update({
      where: { id: document.id },
      data: { version: document.version + 1 },
    });

    // Log version creation
    await prisma.documentAuditTrail.create({
      data: {
        documentId: document.id,
        action: 'VERSION_CREATED',
        userId: document.updatedBy || document.createdBy,
        details: `Version ${document.version} created`,
      },
    });

    return true;
  } catch (error) {
    console.error('Version creation failed:', error);
    throw error;
  }
}

export async function restoreDocumentVersion(documentId: string, version: number) {
  try {
    // Get the version record
    const versionRecord = await prisma.documentVersion.findFirst({
      where: {
        documentId,
        version,
      },
    });

    if (!versionRecord) {
      throw new Error(`Version ${version} not found`);
    }

    // Restore the document to this version
    const restoredDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        ...versionRecord.content,
        version: versionRecord.version,
        updatedAt: new Date(),
      },
    });

    // Log version restoration
    await prisma.documentAuditTrail.create({
      data: {
        documentId,
        action: 'VERSION_RESTORED',
        userId: restoredDocument.updatedBy || restoredDocument.createdBy,
        details: `Restored to version ${version}`,
      },
    });

    return restoredDocument;
  } catch (error) {
    console.error('Version restoration failed:', error);
    throw error;
  }
}


