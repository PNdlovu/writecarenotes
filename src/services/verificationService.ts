import { prisma } from '@/lib/prisma';
import type { BarcodeData, PINVerification, VerificationResult } from '@/types/verification';
import { hash, compare } from 'bcryptjs';

export class VerificationService {
  async verifyBarcode(code: string): Promise<VerificationResult> {
    // First check if it's a medication barcode
    const medication = await prisma.medication.findFirst({
      where: { barcode: code },
      select: {
        id: true,
        name: true,
      },
    });

    if (medication) {
      return {
        success: true,
        data: {
          medicationId: medication.id,
          medicationName: medication.name,
        },
      };
    }

    // Check if it's a resident barcode
    const resident = await prisma.resident.findFirst({
      where: { barcode: code },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    if (resident) {
      return {
        success: true,
        data: {
          residentId: resident.id,
          residentName: `${resident.firstName} ${resident.lastName}`,
        },
      };
    }

    // Check if it's a staff barcode
    const staff = await prisma.staff.findFirst({
      where: { barcode: code },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    if (staff) {
      return {
        success: true,
        data: {
          staffId: staff.id,
          staffName: `${staff.firstName} ${staff.lastName}`,
        },
      };
    }

    return {
      success: false,
      message: 'Invalid barcode',
    };
  }

  async verifyPIN(verification: PINVerification): Promise<VerificationResult> {
    const staff = await prisma.staff.findUnique({
      where: { id: verification.staffId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        pin: true,
        role: true,
      },
    });

    if (!staff) {
      return {
        success: false,
        message: 'Staff member not found',
      };
    }

    const pinMatches = await compare(verification.pin, staff.pin);
    if (!pinMatches) {
      return {
        success: false,
        message: 'Invalid PIN',
      };
    }

    // Check role permissions based on verification type
    switch (verification.type) {
      case 'CONTROLLED_DRUG':
        if (!['NURSE', 'SENIOR_CARER'].includes(staff.role)) {
          return {
            success: false,
            message: 'Insufficient permissions for controlled drugs',
          };
        }
        break;
      case 'WITNESS':
        if (!['NURSE', 'SENIOR_CARER', 'CARER'].includes(staff.role)) {
          return {
            success: false,
            message: 'Insufficient permissions to witness',
          };
        }
        break;
      case 'ADMINISTRATION':
        if (!['NURSE', 'SENIOR_CARER', 'CARER'].includes(staff.role)) {
          return {
            success: false,
            message: 'Insufficient permissions to administer medications',
          };
        }
        break;
    }

    return {
      success: true,
      data: {
        staffId: staff.id,
        staffName: `${staff.firstName} ${staff.lastName}`,
      },
    };
  }

  async generateBarcode(type: BarcodeData['type'], id: string): Promise<string> {
    const prefix = {
      MEDICATION: 'MED',
      RESIDENT: 'RES',
      STAFF: 'STF',
    }[type];

    // Generate a unique barcode with prefix and random numbers
    const randomPart = Math.random().toString().slice(2, 8);
    const barcode = `${prefix}${id.slice(0, 4)}${randomPart}`;

    // Update the corresponding record with the new barcode
    switch (type) {
      case 'MEDICATION':
        await prisma.medication.update({
          where: { id },
          data: { barcode },
        });
        break;
      case 'RESIDENT':
        await prisma.resident.update({
          where: { id },
          data: { barcode },
        });
        break;
      case 'STAFF':
        await prisma.staff.update({
          where: { id },
          data: { barcode },
        });
        break;
    }

    return barcode;
  }

  async updatePIN(staffId: string, newPIN: string): Promise<boolean> {
    try {
      const hashedPIN = await hash(newPIN, 10);
      await prisma.staff.update({
        where: { id: staffId },
        data: { pin: hashedPIN },
      });
      return true;
    } catch (error) {
      console.error('Error updating PIN:', error);
      return false;
    }
  }
}

export const verificationService = new VerificationService();


