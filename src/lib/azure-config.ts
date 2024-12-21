import { BlobServiceClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

// Azure Storage configuration
export const blobServiceClient = new BlobServiceClient(
  process.env.AZURE_STORAGE_CONNECTION_STRING || '',
  new DefaultAzureCredential()
);

// Azure Key Vault configuration
export const keyVaultClient = new SecretClient(
  process.env.AZURE_KEY_VAULT_URL || '',
  new DefaultAzureCredential()
);

// Container names for different types of data
export const CONTAINERS = {
  DOCUMENTS: 'patient-documents',
  IMAGES: 'facility-images',
  REPORTS: 'medical-reports'
} as const;

// Helper function to ensure containers exist
export async function ensureContainers() {
  for (const container of Object.values(CONTAINERS)) {
    const containerClient = blobServiceClient.getContainerClient(container);
    await containerClient.createIfNotExists({
      access: 'private'  // Ensure private access for healthcare data
    });
  }
}

// Helper function to generate SAS tokens for secure file access
export async function generateSasToken(containerName: string, blobName: string) {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(blobName);
  
  const startsOn = new Date();
  const expiresOn = new Date(startsOn);
  expiresOn.setMinutes(startsOn.getMinutes() + 15); // 15 minutes expiry

  const sasToken = await blobClient.generateSasUrl({
    permissions: { read: true },
    startsOn,
    expiresOn,
  });
  
  return sasToken;
}
