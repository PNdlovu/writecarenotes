/**
 * @writecarenotes.com
 * @fileoverview API routes for retrieving domiciliary care integrations
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Handles retrieval of integrated data between domiciliary care and other modules
 * for a specific client.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { DomiciliaryIntegrationService } from '@/features/domiciliary/services/integrationService';

const integrationService = new DomiciliaryIntegrationService();

export async function GET(
  req: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!organizationId) {
      return new NextResponse(
        JSON.stringify({ error: 'Organization ID is required' }),
        { status: 400 }
      );
    }

    let data;
    switch (type?.toUpperCase()) {
      case 'VISIT_REQUIREMENTS':
        data = await integrationService.getClientVisitRequirements(
          organizationId,
          params.clientId
        );
        break;

      case 'MEDICATION_SCHEDULES':
        data = await integrationService.getClientMedicationSchedules(
          organizationId,
          params.clientId
        );
        break;

      case 'ASSESSMENT_IMPACTS':
        data = await integrationService.getClientAssessmentImpacts(
          organizationId,
          params.clientId
        );
        break;

      case 'ACTIVITY_SCHEDULES':
        data = await integrationService.getClientActivitySchedules(
          organizationId,
          params.clientId
        );
        break;

      case 'ACTIVITY_COMPLETIONS':
        data = await integrationService.getClientActivityCompletions(
          organizationId,
          params.clientId,
          startDate ? new Date(startDate) : undefined,
          endDate ? new Date(endDate) : undefined
        );
        break;

      case 'ALL':
        const [
          visitRequirements,
          medicationSchedules,
          assessmentImpacts,
          activitySchedules,
          activityCompletions
        ] = await Promise.all([
          integrationService.getClientVisitRequirements(organizationId, params.clientId),
          integrationService.getClientMedicationSchedules(organizationId, params.clientId),
          integrationService.getClientAssessmentImpacts(organizationId, params.clientId),
          integrationService.getClientActivitySchedules(organizationId, params.clientId),
          integrationService.getClientActivityCompletions(
            organizationId,
            params.clientId,
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined
          )
        ]);

        data = {
          visitRequirements,
          medicationSchedules,
          assessmentImpacts,
          activitySchedules,
          activityCompletions
        };
        break;

      default:
        return new NextResponse(
          JSON.stringify({ error: 'Invalid integration type' }),
          { status: 400 }
        );
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        data
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Integration retrieval error:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to retrieve integration data',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    );
  }
} 