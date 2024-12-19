import { BlobServiceClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import { StaffRole } from '@/types/models';

// Initialize Azure Blob Storage client
const blobServiceClient = new BlobServiceClient(
  process.env.AZURE_STORAGE_CONNECTION_STRING || '',
  new DefaultAzureCredential()
);

const STAFF_CONTAINER = 'staff-documents';

// Initialize container
async function ensureStaffContainer() {
  const containerClient = blobServiceClient.getContainerClient(STAFF_CONTAINER);
  await containerClient.createIfNotExists({
    access: 'private'
  });
  return containerClient;
}

export interface StaffDocument {
  id: string;
  documentType: 'qualification' | 'training' | 'dbs' | 'identification';
  fileName: string;
  contentType: string;
  uploadDate: Date;
}

export async function uploadStaffDocument(
  staffId: string,
  file: File,
  documentType: StaffDocument['documentType']
): Promise<StaffDocument> {
  const containerClient = await ensureStaffContainer();
  const blobName = `${staffId}/${documentType}/${file.name}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Upload file with metadata
  await blockBlobClient.uploadData(await file.arrayBuffer(), {
    blobHTTPHeaders: {
      blobContentType: file.type
    },
    metadata: {
      staffId,
      documentType,
      uploadDate: new Date().toISOString()
    }
  });

  return {
    id: blobName,
    documentType,
    fileName: file.name,
    contentType: file.type,
    uploadDate: new Date()
  };
}

export async function getStaffDocuments(staffId: string): Promise<StaffDocument[]> {
  const containerClient = await ensureStaffContainer();
  const documents: StaffDocument[] = [];

  // List all blobs in the staff member's directory
  for await (const blob of containerClient.listBlobsFlat({
    prefix: `${staffId}/`
  })) {
    if (blob.metadata) {
      documents.push({
        id: blob.name,
        documentType: blob.metadata.documentType as StaffDocument['documentType'],
        fileName: blob.name.split('/').pop() || '',
        contentType: blob.properties.contentType || '',
        uploadDate: blob.properties.createdOn || new Date()
      });
    }
  }

  return documents;
}

export async function generateDocumentSasUrl(documentId: string): Promise<string> {
  const containerClient = await ensureStaffContainer();
  const blobClient = containerClient.getBlobClient(documentId);
  
  // Generate SAS URL with 15-minute expiry
  const startsOn = new Date();
  const expiresOn = new Date(startsOn);
  expiresOn.setMinutes(startsOn.getMinutes() + 15);

  return await blobClient.generateSasUrl({
    permissions: { read: true },
    startsOn,
    expiresOn,
  });
}


