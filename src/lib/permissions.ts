import { prisma } from './prisma';

type Permission = 'VIEW' | 'EDIT' | 'MANAGE';

export async function canAccessDocument(userId: string, documentId: string, requiredPermission: Permission): Promise<boolean> {
  // Get user's organization and role
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      organization: true,
      staff: true,
    },
  });

  if (!user) return false;

  // Get document and its shares
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      shares: {
        where: { userId },
      },
    },
  });

  if (!document) return false;

  // Check if user is in the same organization
  if (user.organizationId === document.organizationId) {
    // Admin and Manager roles have full access
    if (user.staff?.role === 'ADMIN' || user.staff?.role === 'MANAGER') {
      return true;
    }

    // Staff members can view and edit documents
    if (user.staff?.role === 'STAFF') {
      return requiredPermission !== 'MANAGE';
    }
  }

  // Check document shares
  const share = document.shares[0];
  if (!share) return false;

  switch (requiredPermission) {
    case 'VIEW':
      return true; // Any share permission allows viewing
    case 'EDIT':
      return share.permission === 'EDIT' || share.permission === 'MANAGE';
    case 'MANAGE':
      return share.permission === 'MANAGE';
    default:
      return false;
  }
}


