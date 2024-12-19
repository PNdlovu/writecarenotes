import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { TenantConfig, TenantContext } from './types';

export async function withTenant(
  request: NextRequest,
  handler: (context: TenantContext) => Promise<NextResponse>
) {
  try {
    // Get tenant from hostname or header
    const tenant = await getTenantFromRequest(request);
    if (!tenant) {
      return new NextResponse('Tenant not found', { status: 404 });
    }

    // Get user from session
    const user = await getUserFromSession(request);
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Create tenant context
    const context: TenantContext = {
      tenant,
      user
    };

    // Check if tenant has access to payroll feature
    if (request.nextUrl.pathname.startsWith('/api/payroll')) {
      if (!tenant.features.payroll.enabled) {
        return new NextResponse('Payroll module not enabled for this tenant', { 
          status: 403 
        });
      }
    }

    // Execute handler with tenant context
    return handler(context);
  } catch (error) {
    console.error('Tenant middleware error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

async function getTenantFromRequest(request: NextRequest): Promise<TenantConfig | null> {
  // Get tenant identifier from hostname or custom header
  const hostname = request.headers.get('host') || '';
  const tenantId = request.headers.get('x-tenant-id');

  // Try to get tenant by custom domain first
  if (hostname) {
    const tenantByDomain = await prisma.organization.findFirst({
      where: { customDomain: hostname }
    });
    if (tenantByDomain) {
      return mapOrganizationToTenantConfig(tenantByDomain);
    }
  }

  // Fall back to tenant ID
  if (tenantId) {
    const tenantById = await prisma.organization.findUnique({
      where: { tenantId }
    });
    if (tenantById) {
      return mapOrganizationToTenantConfig(tenantById);
    }
  }

  return null;
}

async function getUserFromSession(request: NextRequest): Promise<any> {
  // Get session token from cookie
  const sessionToken = request.cookies.get('session')?.value;
  if (!sessionToken) return null;

  // Get user from session
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true }
  });

  return session?.user || null;
}

function mapOrganizationToTenantConfig(org: any): TenantConfig {
  return {
    id: org.tenantId,
    name: org.name,
    domain: org.customDomain || '',
    features: {
      payroll: {
        enabled: org.features?.payroll?.enabled || false,
        modules: {
          timesheet: org.features?.payroll?.timesheet || false,
          expenses: org.features?.payroll?.expenses || false,
          benefits: org.features?.payroll?.benefits || false,
          reporting: org.features?.payroll?.reporting || false,
          hmrc: org.features?.payroll?.hmrc || false,
          revenue: org.features?.payroll?.revenue || false
        },
        customizations: {
          calculators: org.features?.payroll?.calculators || false,
          templates: org.features?.payroll?.templates || false,
          workflows: org.features?.payroll?.workflows || false
        }
      }
    },
    limits: {
      maxEmployees: org.maxUsers || 10,
      maxFacilities: org.maxFacilities || 1,
      maxUsers: org.maxUsers || 10,
      storageLimit: org.storageLimit || 5368709120, // 5GB default
      apiRateLimit: org.apiRateLimit || 1000
    },
    branding: {
      logo: org.branding?.logo || '',
      colors: {
        primary: org.branding?.colors?.primary || '#000000',
        secondary: org.branding?.colors?.secondary || '#ffffff',
        accent: org.branding?.colors?.accent || '#0000ff'
      },
      fonts: {
        primary: org.branding?.fonts?.primary || 'system-ui',
        secondary: org.branding?.fonts?.secondary || 'system-ui'
      }
    },
    settings: {
      defaultLanguage: org.defaultLanguage || 'en',
      defaultTimezone: org.defaultTimezone || 'UTC',
      defaultCurrency: org.defaultCurrency || 'GBP',
      dateFormat: org.settings?.dateFormat || 'DD/MM/YYYY',
      numberFormat: org.settings?.numberFormat || 'en-GB'
    }
  };
}
