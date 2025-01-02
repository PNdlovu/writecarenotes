import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { TaxConfigService } from '@/services/payroll/taxConfigService';
import { TaxRegion } from '@/features/payroll/types';

const taxConfigService = new TaxConfigService();

export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const taxYear = searchParams.get('taxYear');

    if (!region) {
      return NextResponse.json({ error: 'Region is required' }, { status: 400 });
    }

    const config = taxConfigService.getConfig(
      region as TaxRegion,
      taxYear || taxConfigService.getCurrentTaxYear()
    );

    if (!config) {
      return NextResponse.json({ error: 'Tax configuration not found' }, { status: 404 });
    }

    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get available tax regions
export async function POST(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const configs = taxConfigService.getAllConfigs();
    const regions = [...new Set(configs.map(config => config.region))];

    return NextResponse.json(regions);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 