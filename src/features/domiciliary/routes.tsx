/**
 * @writecarenotes.com
 * @fileoverview Route configuration for domiciliary care module
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Defines routing configuration for the domiciliary care module,
 * including navigation structure and access control.
 */

import { DomiciliaryDashboard, ClientManagement, Reporting, Settings, QualityMonitoring, RegionalSettings, VisitManagement, RouteOptimization, StaffScheduling, HandoverSystem } from './pages';
import { Layout } from '@/components/layout';
import type { RouteConfig } from '@/types';

export const domiciliaryRoutes: RouteConfig[] = [
  {
    path: '/domiciliary',
    element: <Layout module="domiciliary" />,
    children: [
      {
        index: true,
        element: <DomiciliaryDashboard />,
        meta: {
          title: 'Domiciliary Care',
          permissions: ['domiciliary:view']
        }
      },
      {
        path: 'clients',
        element: <ClientManagement />,
        meta: {
          title: 'Client Management',
          permissions: ['domiciliary:clients:view']
        }
      },
      {
        path: 'visits',
        element: <VisitManagement />,
        meta: {
          title: 'Visit Management',
          permissions: ['domiciliary:visits:view']
        }
      },
      {
        path: 'routes',
        element: <RouteOptimization />,
        meta: {
          title: 'Route Optimization',
          permissions: ['domiciliary:routes:view']
        }
      },
      {
        path: 'staff',
        element: <StaffScheduling />,
        meta: {
          title: 'Staff Scheduling',
          permissions: ['domiciliary:staff:view']
        }
      },
      {
        path: 'handover',
        element: <HandoverSystem />,
        meta: {
          title: 'Handover',
          permissions: ['domiciliary:handover:view']
        }
      },
      {
        path: 'reports',
        element: <Reporting />,
        meta: {
          title: 'Reports',
          permissions: ['domiciliary:reports:view']
        }
      },
      {
        path: 'settings',
        element: <Settings />,
        meta: {
          title: 'Settings',
          permissions: ['domiciliary:settings:manage']
        }
      },
      {
        path: 'quality',
        element: <QualityMonitoring />,
        meta: {
          title: 'Quality Monitoring',
          permissions: ['domiciliary:quality:view']
        }
      },
      {
        path: 'regional',
        element: <RegionalSettings />,
        meta: {
          title: 'Regional Settings',
          permissions: ['domiciliary:regional:manage']
        }
      }
    ],
    meta: {
      navigation: {
        label: 'Domiciliary Care',
        icon: 'home',
        items: [
          {
            label: 'Dashboard',
            path: '/domiciliary',
            icon: 'dashboard',
            permissions: ['domiciliary:view']
          },
          {
            label: 'Clients',
            path: '/domiciliary/clients',
            icon: 'users',
            permissions: ['domiciliary:clients:view']
          },
          {
            label: 'Visits',
            path: '/domiciliary/visits',
            icon: 'calendar',
            permissions: ['domiciliary:visits:view']
          },
          {
            label: 'Routes',
            path: '/domiciliary/routes',
            icon: 'map',
            permissions: ['domiciliary:routes:view']
          },
          {
            label: 'Staff',
            path: '/domiciliary/staff',
            icon: 'user-group',
            permissions: ['domiciliary:staff:view']
          },
          {
            label: 'Handover',
            path: '/domiciliary/handover',
            icon: 'switch-horizontal',
            permissions: ['domiciliary:handover:view']
          },
          {
            label: 'Reports',
            path: '/domiciliary/reports',
            icon: 'file',
            permissions: ['domiciliary:reports:view']
          },
          {
            label: 'Quality',
            path: '/domiciliary/quality',
            icon: 'chart',
            permissions: ['domiciliary:quality:view']
          },
          {
            label: 'Settings',
            path: '/domiciliary/settings',
            icon: 'settings',
            permissions: ['domiciliary:settings:manage']
          },
          {
            label: 'Regional',
            path: '/domiciliary/regional',
            icon: 'globe',
            permissions: ['domiciliary:regional:manage']
          }
        ]
      }
    }
  }
]; 