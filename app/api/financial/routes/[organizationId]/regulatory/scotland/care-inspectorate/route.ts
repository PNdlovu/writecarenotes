/**
 * @fileoverview Care Inspectorate (Scotland) Report Route
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Logger } from '@/lib/logger';
import { handleCareInspectorateReport, handleCareInspectorateComplianceCheck } from '@/app/api/financial/handlers/regulatory/scotland/careInspectorateHandlers';
import { ValidationError, ComplianceError, SystemError } from '@/app/api/financial/utils/errors';

const logger = new Logger('care-inspectorate-route');

export async function GET(
    req: NextRequest,
    { params }: { params: { organizationId: string } }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check organization access
        if (session.user.organizationId !== params.organizationId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const period = searchParams.get('period');
        const format = searchParams.get('format') as 'pdf' | 'csv';
        const template = searchParams.get('template');
        const language = searchParams.get('language') as 'en' | 'gd';

        if (!period || !format) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        // Generate Care Inspectorate report
        const report = await handleCareInspectorateReport({
            organizationId: params.organizationId,
            period,
            format,
            template,
            language
        });

        return NextResponse.json(report);
    } catch (error) {
        logger.error('Failed to handle Care Inspectorate report request', error);

        if (error instanceof ValidationError) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        if (error instanceof ComplianceError) {
            return NextResponse.json(
                { error: error.message, details: error.details },
                { status: 422 }
            );
        }

        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { organizationId: string } }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check organization access
        if (session.user.organizationId !== params.organizationId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { checkType, period } = body;

        if (!checkType) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        // Perform compliance check
        const result = await handleCareInspectorateComplianceCheck({
            organizationId: params.organizationId,
            checkType,
            period
        });

        return NextResponse.json(result);
    } catch (error) {
        logger.error('Failed to handle Care Inspectorate compliance check request', error);

        if (error instanceof ValidationError) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        if (error instanceof ComplianceError) {
            return NextResponse.json(
                { error: error.message, details: error.details },
                { status: 422 }
            );
        }

        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
} 