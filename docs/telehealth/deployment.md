# Telehealth Deployment Guide

## Overview

This guide outlines the deployment process and configuration for the Write Care Notes Telehealth module across different environments and regions.

## Prerequisites

- Azure Cloud subscription
- Azure CLI installed
- Node.js 18.x or higher
- Docker installed
- Terraform installed
- Access to Azure Key Vault
- SSL certificates for each region

## Infrastructure as Code

### 1. Azure Resources

```hcl
# main.tf
provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "telehealth" {
  name     = "rg-telehealth-${var.environment}-${var.region}"
  location = var.location
  tags     = var.tags
}

resource "azurerm_app_service_plan" "telehealth" {
  name                = "asp-telehealth-${var.environment}-${var.region}"
  location            = azurerm_resource_group.telehealth.location
  resource_group_name = azurerm_resource_group.telehealth.name
  
  sku {
    tier = "Premium"
    size = "P2v2"
  }
}

resource "azurerm_app_service" "telehealth" {
  name                = "app-telehealth-${var.environment}-${var.region}"
  location            = azurerm_resource_group.telehealth.location
  resource_group_name = azurerm_resource_group.telehealth.name
  app_service_plan_id = azurerm_app_service_plan.telehealth.id

  site_config {
    always_on        = true
    http2_enabled    = true
    min_tls_version  = "1.2"
    ftps_state       = "Disabled"
    
    cors {
      allowed_origins = var.allowed_origins
    }
  }

  identity {
    type = "SystemAssigned"
  }

  app_settings = {
    "WEBSITE_NODE_DEFAULT_VERSION" = "~18"
    "APPINSIGHTS_INSTRUMENTATIONKEY" = azurerm_application_insights.telehealth.instrumentation_key
    "KeyVaultName" = azurerm_key_vault.telehealth.name
    "REGION" = var.region
  }
}

resource "azurerm_application_insights" "telehealth" {
  name                = "ai-telehealth-${var.environment}-${var.region}"
  location            = azurerm_resource_group.telehealth.location
  resource_group_name = azurerm_resource_group.telehealth.name
  application_type    = "web"
}

resource "azurerm_key_vault" "telehealth" {
  name                = "kv-telehealth-${var.environment}-${var.region}"
  location            = azurerm_resource_group.telehealth.location
  resource_group_name = azurerm_resource_group.telehealth.name
  tenant_id          = data.azurerm_client_config.current.tenant_id
  sku_name           = "premium"

  network_acls {
    default_action = "Deny"
    bypass         = "AzureServices"
    ip_rules       = var.allowed_ips
  }
}

resource "azurerm_redis_cache" "telehealth" {
  name                = "redis-telehealth-${var.environment}-${var.region}"
  location            = azurerm_resource_group.telehealth.location
  resource_group_name = azurerm_resource_group.telehealth.name
  capacity            = 2
  family              = "P"
  sku_name            = "Premium"
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"

  redis_configuration {
    enable_authentication = true
  }
}

resource "azurerm_postgresql_server" "telehealth" {
  name                = "psql-telehealth-${var.environment}-${var.region}"
  location            = azurerm_resource_group.telehealth.location
  resource_group_name = azurerm_resource_group.telehealth.name

  sku_name = "GP_Gen5_4"

  storage_mb                   = 640000
  backup_retention_days        = 35
  geo_redundant_backup_enabled = true
  auto_grow_enabled           = true

  administrator_login          = "psqladmin"
  administrator_login_password = var.db_password
  version                     = "11"
  ssl_enforcement_enabled     = true
}

resource "azurerm_storage_account" "telehealth" {
  name                     = "stgtelehealth${var.environment}${var.region}"
  resource_group_name      = azurerm_resource_group.telehealth.name
  location                 = azurerm_resource_group.telehealth.location
  account_tier             = "Standard"
  account_replication_type = "GRS"
  min_tls_version         = "TLS1_2"

  blob_properties {
    versioning_enabled = true
    
    container_delete_retention_policy {
      days = 7
    }
  }
}
```

### 2. Environment Variables

```hcl
# variables.tf
variable "environment" {
  type        = string
  description = "Environment name (dev, staging, prod)"
}

variable "region" {
  type        = string
  description = "Deployment region (uk-south, uk-west, ie-east)"
}

variable "location" {
  type        = string
  description = "Azure region location"
}

variable "allowed_origins" {
  type        = list(string)
  description = "CORS allowed origins"
}

variable "allowed_ips" {
  type        = list(string)
  description = "Allowed IP addresses for Key Vault access"
}

variable "db_password" {
  type        = string
  description = "Database administrator password"
  sensitive   = true
}

variable "tags" {
  type        = map(string)
  description = "Resource tags"
  default     = {
    Environment = "production"
    Service     = "telehealth"
    ManagedBy   = "terraform"
  }
}
```

## Deployment Process

### 1. Build Process

```yaml
# azure-pipelines.yml
trigger:
  branches:
    include:
      - main
  paths:
    include:
      - 'src/features/telehealth/**'

variables:
  - group: telehealth-secrets

stages:
  - stage: Build
    jobs:
      - job: Build
        pool:
          vmImage: 'ubuntu-latest'
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: '18.x'
          
          - script: |
              npm ci
              npm run build
              npm run test
            displayName: 'Build and Test'
          
          - task: Docker@2
            inputs:
              containerRegistry: 'acr-telehealth'
              repository: 'telehealth'
              command: 'buildAndPush'
              Dockerfile: '**/Dockerfile'
              tags: |
                $(Build.BuildId)
                latest

  - stage: Deploy
    jobs:
      - deployment: Deploy
        pool:
          vmImage: 'ubuntu-latest'
        environment: 'production'
        strategy:
          runOnce:
            deploy:
              steps:
                - task: AzureWebApp@1
                  inputs:
                    azureSubscription: 'telehealth-service-connection'
                    appName: 'app-telehealth-prod-uksouth'
                    package: '$(Pipeline.Workspace)/drop/**/*.zip'
                    deploymentMethod: 'auto'
```

### 2. Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
```

### 3. Database Migrations

```typescript
// src/database/migrations/001_initial_schema.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('consultations', (table) => {
    table.uuid('id').primary();
    table.uuid('resident_id').notNullable();
    table.string('type').notNullable();
    table.string('status').notNullable();
    table.timestamp('scheduled_time').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('video_sessions', (table) => {
    table.uuid('id').primary();
    table.uuid('consultation_id').references('consultations.id');
    table.string('status').notNullable();
    table.jsonb('configuration').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('video_sessions');
  await knex.schema.dropTable('consultations');
}
```

## Monitoring Setup

### 1. Application Insights

```typescript
// src/monitoring/telemetry.ts
import * as appInsights from 'applicationinsights';

export function setupTelemetry() {
  appInsights.setup()
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true)
    .setUseDiskRetryCaching(true)
    .setSendLiveMetrics(true)
    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C);

  appInsights.defaultClient.context.tags[
    appInsights.defaultClient.context.keys.cloudRole
  ] = 'telehealth-api';

  appInsights.start();
}
```

### 2. Custom Metrics

```typescript
// src/monitoring/metrics.ts
import { TelemetryClient } from 'applicationinsights';

export class TelehealthMetrics {
  constructor(private client: TelemetryClient) {}

  trackConsultationCreated(data: {
    residentId: string;
    type: string;
    region: string;
  }) {
    this.client.trackEvent({
      name: 'ConsultationCreated',
      properties: {
        residentId: data.residentId,
        type: data.type,
        region: data.region
      }
    });
  }

  trackVideoSessionQuality(data: {
    sessionId: string;
    quality: number;
    latency: number;
  }) {
    this.client.trackMetric({
      name: 'VideoSessionQuality',
      value: data.quality,
      properties: {
        sessionId: data.sessionId,
        latency: data.latency.toString()
      }
    });
  }
}
```

## Scaling Configuration

### 1. Auto Scaling Rules

```typescript
// src/config/scaling.ts
export const autoScaleSettings = {
  rules: [
    {
      metricTrigger: {
        metricName: 'CpuPercentage',
        metricResourceUri: '${resourceId}',
        timeGrain: 'PT1M',
        statistic: 'Average',
        timeWindow: 'PT10M',
        timeAggregation: 'Average',
        operator: 'GreaterThan',
        threshold: 75
      },
      scaleAction: {
        direction: 'Increase',
        type: 'ChangeCount',
        value: 1,
        cooldown: 'PT10M'
      }
    },
    {
      metricTrigger: {
        metricName: 'CpuPercentage',
        metricResourceUri: '${resourceId}',
        timeGrain: 'PT1M',
        statistic: 'Average',
        timeWindow: 'PT10M',
        timeAggregation: 'Average',
        operator: 'LessThan',
        threshold: 25
      },
      scaleAction: {
        direction: 'Decrease',
        type: 'ChangeCount',
        value: 1,
        cooldown: 'PT10M'
      }
    }
  ]
};
```

### 2. Load Balancing

```typescript
// src/config/loadBalancing.ts
export const loadBalancerConfig = {
  probes: [
    {
      name: 'http-probe',
      protocol: 'Http',
      port: 80,
      intervalInSeconds: 15,
      numberOfProbes: 2,
      path: '/health'
    }
  ],
  rules: [
    {
      name: 'http-rule',
      protocol: 'Http',
      frontendPort: 80,
      backendPort: 80,
      idleTimeoutInMinutes: 4,
      enableFloatingIP: false,
      probe: 'http-probe'
    }
  ]
};
```

## Backup Strategy

### 1. Database Backups

```typescript
// src/backup/database.ts
export const backupConfig = {
  shortTerm: {
    retentionDays: 7,
    type: 'Differential',
    schedule: {
      frequencyType: 'Daily',
      frequencyInterval: 1,
      startTime: '00:00'
    }
  },
  longTerm: {
    retentionDays: 365,
    type: 'Full',
    schedule: {
      frequencyType: 'Weekly',
      frequencyInterval: 1,
      startTime: '00:00'
    }
  }
};
```

### 2. File Storage Backups

```typescript
// src/backup/storage.ts
export const storageBackupConfig = {
  containers: ['documents', 'recordings'],
  versioning: {
    enabled: true,
    retentionDays: 90
  },
  replication: {
    type: 'GRS',
    secondaryLocation: 'ukwest'
  },
  softDelete: {
    enabled: true,
    retentionDays: 14
  }
};
```

## Security Configuration

### 1. Network Security

```typescript
// src/security/network.ts
export const networkSecurityConfig = {
  allowedIpRanges: [
    '10.0.0.0/8',    // Internal network
    '172.16.0.0/12', // VPN network
  ],
  wafRules: {
    enabled: true,
    rulesets: [
      'OWASP-3.2',
      'Microsoft_BotManagerRuleSet'
    ]
  },
  ddosProtection: {
    enabled: true,
    plan: 'Standard'
  }
};
```

### 2. Key Rotation

```typescript
// src/security/keyRotation.ts
export const keyRotationConfig = {
  schedule: {
    enabled: true,
    interval: 'P90D' // 90 days
  },
  keys: [
    {
      name: 'DatabaseCredentials',
      type: 'Secret',
      rotationTrigger: 'Time'
    },
    {
      name: 'ApiKey',
      type: 'Secret',
      rotationTrigger: 'Time'
    },
    {
      name: 'EncryptionKey',
      type: 'Key',
      rotationTrigger: 'Time'
    }
  ]
};
```

## Disaster Recovery

### 1. Failover Configuration

```typescript
// src/dr/failover.ts
export const failoverConfig = {
  primaryRegion: 'uksouth',
  secondaryRegion: 'ukwest',
  automaticFailover: true,
  healthCheck: {
    path: '/health',
    interval: 30,
    timeout: 10,
    unhealthyThreshold: 3
  },
  trafficManager: {
    routingMethod: 'Performance',
    ttl: 60,
    endpoints: [
      {
        name: 'primary',
        target: 'app-telehealth-prod-uksouth.azurewebsites.net',
        weight: 1000
      },
      {
        name: 'secondary',
        target: 'app-telehealth-prod-ukwest.azurewebsites.net',
        weight: 750
      }
    ]
  }
};
```

### 2. Recovery Procedures

```typescript
// src/dr/recovery.ts
export const recoveryProcedures = {
  database: {
    pointInTimeRestore: {
      enabled: true,
      retentionDays: 35
    },
    geoRestore: {
      enabled: true,
      targetServer: 'psql-telehealth-prod-ukwest'
    }
  },
  storage: {
    geoRedundancy: {
      enabled: true,
      failoverTrigger: 'Manual'
    },
    dataSync: {
      enabled: true,
      interval: 'PT1H'
    }
  }
};
```

## Regional Configuration

### 1. Region-Specific Settings

```typescript
// src/config/regions.ts
export const regionConfig = {
  'UK_CQC': {
    location: 'uksouth',
    compliance: ['GDPR', 'NHS_DATA_SECURITY'],
    dataResidency: 'UK',
    apis: {
      nhs: 'https://api.nhs.uk/prod',
      spine: 'https://spine.nhs.uk/prod'
    }
  },
  'UK_CIW': {
    location: 'ukwest',
    compliance: ['GDPR', 'NHS_WALES'],
    dataResidency: 'UK',
    apis: {
      nhsWales: 'https://api.nhs.wales/prod'
    }
  },
  'IE_HIQA': {
    location: 'northeurope',
    compliance: ['GDPR', 'HIQA'],
    dataResidency: 'EU',
    apis: {
      hse: 'https://api.hse.ie/prod'
    }
  }
};
```

### 2. Regional Routing

```typescript
// src/config/routing.ts
export const routingConfig = {
  rules: [
    {
      path: '/api/consultations',
      methods: ['POST', 'PUT', 'DELETE'],
      regions: {
        'UK_CQC': {
          validation: ['NHS_NUMBER', 'CQC_COMPLIANCE'],
          rateLimit: 100
        },
        'UK_CIW': {
          validation: ['NHS_WALES_ID', 'CIW_COMPLIANCE'],
          rateLimit: 100
        },
        'IE_HIQA': {
          validation: ['IHI_NUMBER', 'HIQA_COMPLIANCE'],
          rateLimit: 100
        }
      }
    }
  ]
};
```

## Deployment Checklist

### Pre-Deployment
1. Run all tests
2. Verify database migrations
3. Check compliance requirements
4. Update documentation
5. Review security settings

### Deployment Steps
1. Deploy infrastructure changes
2. Run database migrations
3. Deploy application updates
4. Verify health checks
5. Enable monitoring

### Post-Deployment
1. Verify all endpoints
2. Check monitoring metrics
3. Validate compliance
4. Test failover procedures
5. Update status page

## Support Information

### Contact Details
```typescript
export const supportContacts = {
  technical: {
    email: 'tech.support@writecarenotes.com',
    phone: '+44 123 456 7890',
    hours: '24/7'
  },
  compliance: {
    email: 'compliance@writecarenotes.com',
    phone: '+44 123 456 7891',
    hours: '09:00-17:00 GMT'
  }
};
```

### Documentation Links
```typescript
export const documentationLinks = {
  api: 'https://docs.writecarenotes.com/api',
  deployment: 'https://docs.writecarenotes.com/deployment',
  monitoring: 'https://docs.writecarenotes.com/monitoring',
  compliance: 'https://docs.writecarenotes.com/compliance'
};
``` 