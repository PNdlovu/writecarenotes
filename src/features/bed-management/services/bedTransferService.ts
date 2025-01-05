import { BedService } from './bedService'
import { BedRepository } from '../database/repositories/bedRepository'
import type {
  Bed,
  TransferRequest,
  TransferReason,
  PriorityLevel
} from '../types/bed.types'
import { BedError, BedErrorCode } from '../types/errors'
import type { ServiceContext } from '@/types/context'

export class BedTransferService {
  private static instance: BedTransferService
  private bedService: BedService
  private bedRepository: BedRepository

  private constructor() {
    this.bedService = BedService.getInstance()
    this.bedRepository = BedRepository.getInstance()
  }

  static getInstance(): BedTransferService {
    if (!BedTransferService.instance) {
      BedTransferService.instance = new BedTransferService()
    }
    return BedTransferService.instance
  }

  async requestTransfer(
    fromBedId: string,
    toBedId: string | undefined,
    reason: TransferReason,
    priority: PriorityLevel,
    notes: string | undefined,
    context: ServiceContext
  ): Promise<TransferRequest> {
    // Validate source bed
    const fromBed = await this.bedService.getBed(fromBedId, context)
    if (!fromBed.currentAssignment) {
      throw new BedError(
        'Source bed is not occupied',
        BedErrorCode.INVALID_OPERATION
      )
    }

    // Validate target bed if specified
    if (toBedId) {
      const toBed = await this.bedService.getBed(toBedId, context)
      if (toBed.status !== 'AVAILABLE') {
        throw new BedError(
          'Target bed is not available',
          BedErrorCode.INVALID_OPERATION
        )
      }
    }

    // Create transfer request
    const transfer: TransferRequest = {
      requestId: crypto.randomUUID(),
      fromBedId,
      toBedId,
      residentId: fromBed.currentAssignment.residentId,
      requestedBy: context.userId,
      requestDate: new Date(),
      reason,
      priority,
      status: 'PENDING',
      notes,
    }

    // Update bed status
    await this.bedRepository.update(
      fromBedId,
      { status: 'PENDING_TRANSFER', transferRequest: transfer },
      context
    )

    return transfer
  }

  async approveTransfer(
    requestId: string,
    toBedId: string,
    scheduledDate: Date | undefined,
    context: ServiceContext
  ): Promise<void> {
    const fromBed = await this.findBedByTransferRequest(requestId, context)
    if (!fromBed.transferRequest || fromBed.transferRequest.status !== 'PENDING') {
      throw new BedError(
        'Invalid transfer request',
        BedErrorCode.INVALID_OPERATION
      )
    }

    // Validate target bed
    const toBed = await this.bedService.getBed(toBedId, context)
    if (toBed.status !== 'AVAILABLE') {
      throw new BedError(
        'Target bed is not available',
        BedErrorCode.INVALID_OPERATION
      )
    }

    // Update transfer request
    const updatedTransfer: TransferRequest = {
      ...fromBed.transferRequest,
      toBedId,
      status: 'APPROVED',
      approvedBy: context.userId,
      approvalDate: new Date(),
      scheduledDate
    }

    // Update beds
    await Promise.all([
      this.bedRepository.update(
        fromBed.id,
        { transferRequest: updatedTransfer },
        context
      ),
      this.bedRepository.update(
        toBedId,
        { status: 'RESERVED' },
        context
      )
    ])
  }

  async executeTransfer(requestId: string, context: ServiceContext): Promise<void> {
    const fromBed = await this.findBedByTransferRequest(requestId, context)
    if (
      !fromBed.transferRequest ||
      !fromBed.transferRequest.toBedId ||
      fromBed.transferRequest.status !== 'APPROVED'
    ) {
      throw new BedError(
        'Invalid transfer request',
        BedErrorCode.INVALID_OPERATION
      )
    }

    const toBed = await this.bedService.getBed(fromBed.transferRequest.toBedId, context)
    if (toBed.status !== 'RESERVED') {
      throw new BedError(
        'Target bed is not reserved',
        BedErrorCode.INVALID_OPERATION
      )
    }

    // Move resident assignment
    const assignment = fromBed.currentAssignment
    if (!assignment) {
      throw new BedError(
        'Source bed has no current assignment',
        BedErrorCode.INVALID_OPERATION
      )
    }

    // Update both beds
    await Promise.all([
      this.bedRepository.update(
        fromBed.id,
        {
          status: 'AVAILABLE',
          currentAssignment: null,
          transferRequest: { ...fromBed.transferRequest, status: 'COMPLETED' }
        },
        context
      ),
      this.bedRepository.update(
        toBed.id,
        {
          status: 'OCCUPIED',
          currentAssignment: assignment
        },
        context
      )
    ])
  }

  private async findBedByTransferRequest(
    requestId: string,
    context: ServiceContext
  ): Promise<Bed> {
    const bed = await this.bedRepository.findByTransferRequest(requestId, context)
    if (!bed) {
      throw new BedError(
        'Transfer request not found',
        BedErrorCode.NOT_FOUND
      )
    }
    return bed
  }
}


