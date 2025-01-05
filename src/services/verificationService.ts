/**
 * @writecarenotes.com
 * @fileoverview Verification Service for PIN and Witness Management
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Handles PIN verification, witness management, and security features
 * for medication administration and controlled drugs.
 */

import { prisma } from '@/lib/prisma';
import type { BarcodeData, PINVerification, VerificationResult, WitnessVerification } from '@/types/verification';
import { hash, compare } from 'bcryptjs';
import { addDays, isPast } from 'date-fns';

const MAX_FAILED_ATTEMPTS = 3;
const PIN_EXPIRY_DAYS = 90;
const PIN_LENGTH = 4;

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
          type: 'MEDICATION'
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
          type: 'RESIDENT'
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
          type: 'STAFF'
        },
      };
    }

    return {
      success: false,
      message: 'Please scan again or enter the code manually',
      retry: true
    };
  }

  async verifyPIN(verification: PINVerification): Promise<VerificationResult> {
    // Simple PIN format check
    if (!/^\d{4}$/.test(verification.pin)) {
      return {
        success: false,
        message: 'Your PIN should be 4 numbers only',
        hint: 'For example: 1234',
        retry: true
      };
    }

    const staff = await prisma.staff.findUnique({
      where: { id: verification.staffId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        pin: true,
        role: true,
        pinExpiryDate: true,
        failedAttempts: true,
        accountLocked: true,
        temporaryPin: true
      },
    });

    if (!staff) {
      return {
        success: false,
        message: 'Staff ID not found',
        hint: 'Please try scanning your ID card again',
        retry: true
      };
    }

    // Locked account check
    if (staff.accountLocked) {
      return {
        success: false,
        message: 'Your account is locked for security',
        hint: 'Please ask your manager to unlock it',
        locked: true,
        requiresManager: true
      };
    }

    // PIN verification
    const pinMatches = await compare(verification.pin, staff.pin);
    if (!pinMatches) {
      const failedAttempts = (staff.failedAttempts || 0) + 1;
      const attemptsLeft = MAX_FAILED_ATTEMPTS - failedAttempts;
      const accountLocked = failedAttempts >= MAX_FAILED_ATTEMPTS;

      await prisma.staff.update({
        where: { id: staff.id },
        data: { 
          failedAttempts,
          accountLocked
        }
      });

      if (accountLocked) {
        return {
          success: false,
          message: 'Your account has been locked for security',
          hint: 'Please ask your manager to unlock it',
          locked: true,
          requiresManager: true
        };
      }

      return {
        success: false,
        message: 'Wrong PIN entered',
        hint: attemptsLeft > 1 
          ? `You have ${attemptsLeft} more tries`
          : 'Last try before your account is locked',
        retry: true,
        attemptsLeft
      };
    }

    // Reset failed attempts on success
    if (staff.failedAttempts > 0) {
      await prisma.staff.update({
        where: { id: staff.id },
        data: { failedAttempts: 0 }
      });
    }

    // Temporary PIN check
    if (staff.temporaryPin) {
      return {
        success: false,
        message: 'You need to set up your own PIN',
        hint: 'Choose 4 numbers you can remember easily',
        requiresChange: true
      };
    }

    // PIN expiry check
    if (staff.pinExpiryDate && isPast(staff.pinExpiryDate)) {
      return {
        success: false,
        message: 'Time to change your PIN',
        hint: 'This helps keep everything secure',
        expired: true
      };
    }

    // Role permission check
    const hasPermission = this.checkRolePermission(staff.role, verification.type);
    if (!hasPermission) {
      const actionMap = {
        CONTROLLED_DRUG: 'handle controlled drugs',
        WITNESS: 'act as a witness',
        ADMINISTRATION: 'give medications'
      };

      return {
        success: false,
        message: `You don't have permission to ${actionMap[verification.type] || verification.type.toLowerCase()}`,
        hint: 'Please ask a qualified colleague to help',
        requiresEscalation: true
      };
    }

    // Witness requirement check for medications
    if (verification.type === 'ADMINISTRATION' && verification.medicationId) {
      const requiresWitness = await this.checkDrugWitnessRequirement(verification.medicationId);
      if (requiresWitness) {
        return {
          success: false,
          message: 'This medication needs two people',
          hint: 'Please ask a colleague to witness',
          requiresWitness: true,
          medicationId: verification.medicationId
        };
      }
    }

    // Record successful verification
    await this.recordVerification(staff.id, verification.type);

    return {
      success: true,
      data: {
        staffId: staff.id,
        staffName: `${staff.firstName} ${staff.lastName}`,
        role: staff.role
      },
      message: 'Welcome back ' + staff.firstName
    };
  }

  private checkRolePermission(role: string, action: string): boolean {
    const permissions = {
      NURSE: ['CONTROLLED_DRUG', 'WITNESS', 'ADMINISTRATION'],
      SENIOR_CARER: ['CONTROLLED_DRUG', 'WITNESS', 'ADMINISTRATION'],
      CARER: ['WITNESS', 'ADMINISTRATION']
    };

    return permissions[role]?.includes(action) || false;
  }

  async verifyWitness(verification: WitnessVerification): Promise<VerificationResult> {
    // Basic validation
    if (verification.witnessId === verification.administratorId) {
      return {
        success: false,
        message: 'You need a different person to witness',
        hint: 'Ask another qualified colleague to help',
        retry: true
      };
    }

    // Check for active session
    const activeSession = await prisma.witnessSession.findFirst({
      where: {
        witnessId: verification.witnessId,
        endTime: null
      }
    });

    if (activeSession) {
      return {
        success: false,
        message: 'This person is busy with another task',
        hint: 'Please ask someone else to witness',
        retry: true
      };
    }

    // Verify witness PIN
    const witnessResult = await this.verifyPIN({
      staffId: verification.witnessId,
      pin: verification.witnessPin,
      type: 'WITNESS'
    });

    if (!witnessResult.success) {
      return witnessResult;
    }

    // Create witness session
    await prisma.witnessSession.create({
      data: {
        witnessId: verification.witnessId,
        administratorId: verification.administratorId,
        startTime: new Date(),
        type: verification.type
      }
    });

    return {
      success: true,
      data: {
        ...witnessResult.data,
        message: 'Witness confirmed'
      }
    };
  }

  async generateTemporaryPin(staffId: string): Promise<string> {
    // Generate exactly 4 random digits
    const tempPin = Math.floor(1000 + Math.random() * 9000).toString().padStart(4, '0');
    const hashedPin = await hash(tempPin, 10);

    await prisma.staff.update({
      where: { id: staffId },
      data: {
        pin: hashedPin,
        temporaryPin: true,
        pinExpiryDate: addDays(new Date(), 1), // 24-hour expiry for temp PINs
        failedAttempts: 0,
        accountLocked: false
      }
    });

    return tempPin;
  }

  async updatePIN(staffId: string, newPIN: string): Promise<VerificationResult> {
    // Validate PIN complexity
    if (!this.validatePINComplexity(newPIN)) {
      return {
        success: false,
        message: 'PIN does not meet complexity requirements'
      };
    }

    try {
      const hashedPIN = await hash(newPIN, 10);
      await prisma.staff.update({
        where: { id: staffId },
        data: {
          pin: hashedPIN,
          temporaryPin: false,
          pinExpiryDate: addDays(new Date(), PIN_EXPIRY_DAYS),
          failedAttempts: 0,
          accountLocked: false
        }
      });

      return {
        success: true,
        message: 'PIN updated successfully'
      };
    } catch (error) {
      console.error('Error updating PIN:', error);
      return {
        success: false,
        message: 'Failed to update PIN'
      };
    }
  }

  async unlockAccount(staffId: string): Promise<boolean> {
    try {
      await prisma.staff.update({
        where: { id: staffId },
        data: {
          failedAttempts: 0,
          accountLocked: false
        }
      });
      return true;
    } catch (error) {
      console.error('Error unlocking account:', error);
      return false;
    }
  }

  private validatePINFormat(pin: string): boolean {
    return /^\d{4}$/.test(pin); // Must be exactly 4 digits
  }

  private validatePINComplexity(pin: string): boolean {
    if (!this.validatePINFormat(pin)) return false;
    if (/(\d)\1{3}/.test(pin)) return false; // No more than 3 repeated digits
    return true;
  }

  private async checkDrugWitnessRequirement(medicationId: string): Promise<boolean> {
    const medication = await prisma.medication.findUnique({
      where: { id: medicationId },
      select: {
        requiresWitness: true,
        isControlledDrug: true,
        isHighRisk: true,
        route: true
      }
    });

    if (!medication) return false;

    // Drugs that always require witness:
    // 1. Controlled drugs
    // 2. High risk medications
    // 3. Injectable medications
    // 4. Medications explicitly marked as requiring witness
    return (
      medication.requiresWitness ||
      medication.isControlledDrug ||
      medication.isHighRisk ||
      medication.route === 'INJECTION'
    );
  }

  private async recordVerification(staffId: string, type: string): Promise<void> {
    await prisma.verificationLog.create({
      data: {
        staffId,
        type,
        timestamp: new Date()
      }
    });
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
}

export const verificationService = new VerificationService();


