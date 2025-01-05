import { Document, SecurityLevel } from '../types';

export const documentUtils = {
  validateSecurityLevel(level: SecurityLevel): boolean {
    return Object.values(SecurityLevel).includes(level);
  },

  formatDocumentMetadata(document: Document): string {
    return `${document.title} (v${document.metadata.version}) - ${document.metadata.securityLevel}`;
  },

  generateDocumentId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  isDocumentEditable(document: Document, userSecurityLevel: SecurityLevel): boolean {
    const securityLevels = Object.values(SecurityLevel);
    const docIndex = securityLevels.indexOf(document.metadata.securityLevel);
    const userIndex = securityLevels.indexOf(userSecurityLevel);
    return userIndex >= docIndex;
  }
};


