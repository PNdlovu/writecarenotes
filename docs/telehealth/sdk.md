# Write Care Notes - Telehealth SDK Reference

## Overview

The Write Care Notes Telehealth SDK provides a high-level interface for integrating telehealth features into your application. The SDK is written in TypeScript and supports both browser and Node.js environments.

## Installation

```bash
# Install the SDK
npm install @writecarenotes/telehealth

# Install peer dependencies
npm install @writecarenotes/core @writecarenotes/auth
```

## Configuration

### Basic Setup

```typescript
import { TelehealthClient } from '@writecarenotes/telehealth';
import { AuthProvider } from '@writecarenotes/auth';

// Initialize the client
const client = new TelehealthClient({
  apiKey: process.env.TELEHEALTH_API_KEY,
  region: 'UK_CQC',
  environment: 'production',
  organization: {
    id: process.env.ORG_ID,
    name: 'Care Home Name',
    type: 'CARE_HOME'
  }
});

// Configure authentication
const auth = new AuthProvider({
  clientId: process.env.AUTH_CLIENT_ID,
  clientSecret: process.env.AUTH_CLIENT_SECRET,
  redirectUri: 'https://your-domain.com/auth/callback'
});

// Connect the auth provider
client.useAuth(auth);
```

### Environment Configuration

```typescript
// Production configuration
const prodConfig = {
  apiUrl: 'https://api.writecarenotes.com',
  wsUrl: 'wss://ws.writecarenotes.com',
  environment: 'production',
  logging: {
    level: 'error',
    destination: 'cloudwatch'
  },
  monitoring: {
    enabled: true,
    provider: 'datadog'
  }
};

// Staging configuration
const stagingConfig = {
  apiUrl: 'https://staging-api.writecarenotes.com',
  wsUrl: 'wss://staging-ws.writecarenotes.com',
  environment: 'staging',
  logging: {
    level: 'debug',
    destination: 'console'
  },
  monitoring: {
    enabled: true,
    provider: 'cloudwatch'
  }
};

// Initialize client with environment config
const client = new TelehealthClient(
  process.env.NODE_ENV === 'production' ? prodConfig : stagingConfig
);
```

## Core Features

### Consultations

```typescript
// Create consultation
const consultation = await client.consultations.create({
  patientId: 'patient-123',
  providerId: 'provider-456',
  type: 'ROUTINE',
  scheduledTime: new Date(),
  duration: 30,
  metadata: {
    priority: 'normal',
    department: 'general',
    notes: 'Follow-up consultation'
  }
});

// Get consultation
const consultation = await client.consultations.get('consultation-789');

// List consultations
const consultations = await client.consultations.list({
  status: 'SCHEDULED',
  from: new Date('2024-03-01'),
  to: new Date('2024-03-31'),
  page: 1,
  pageSize: 20
});

// Update consultation
const updatedConsultation = await client.consultations.update('consultation-789', {
  status: 'CANCELLED',
  metadata: {
    cancellationReason: 'Patient request'
  }
});

// Handle consultation events
client.consultations.on('created', (consultation) => {
  console.log('Consultation created:', consultation.id);
});

client.consultations.on('updated', (consultation) => {
  console.log('Consultation updated:', consultation.id);
});

client.consultations.on('cancelled', (consultation) => {
  console.log('Consultation cancelled:', consultation.id);
});
```

### Video Sessions

```typescript
// Create video session
const session = await client.video.start({
  consultationId: 'consultation-789',
  participants: [
    {
      id: 'provider-456',
      role: 'PROVIDER',
      permissions: ['AUDIO', 'VIDEO', 'SHARE_SCREEN']
    },
    {
      id: 'patient-123',
      role: 'PATIENT',
      permissions: ['AUDIO', 'VIDEO']
    }
  ],
  config: {
    quality: 'HD',
    recording: true,
    maxDuration: 3600
  }
});

// Join video session
const connection = await client.video.join('session-123', {
  participantId: 'provider-456',
  deviceInfo: {
    type: 'desktop',
    browser: 'chrome',
    version: '122.0.0'
  }
});

// Configure connection monitoring
client.video.enableNetworkMonitoring({
  interval: 5000, // 5 seconds
  thresholds: {
    bitrate: 500000, // 500 kbps
    packetLoss: 0.1, // 10%
    latency: 200 // ms
  }
});

// Handle video events
client.video.on('participantJoined', (participant) => {
  console.log('Participant joined:', participant.id);
});

client.video.on('participantLeft', (participant) => {
  console.log('Participant left:', participant.id);
});

client.video.on('qualityDegraded', async (stats) => {
  // Adjust video quality
  await client.video.adjustQuality({
    resolution: '480p',
    framerate: 15,
    bitrate: 250000
  });
});

client.video.on('recordingReady', (recording) => {
  console.log('Recording available:', recording.url);
});

// End video session
await client.video.end('session-123', {
  reason: 'COMPLETED'
});
```

### Health Monitoring

```typescript
// Register device
const device = await client.devices.register({
  type: 'VITAL_SIGNS_MONITOR',
  model: 'VSM-2000',
  serialNumber: 'VSM2000-123',
  capabilities: [
    'HEART_RATE',
    'BLOOD_PRESSURE',
    'TEMPERATURE',
    'OXYGEN_SATURATION'
  ]
});

// Start monitoring
const monitoring = await client.monitoring.start({
  patientId: 'patient-123',
  deviceId: device.id,
  metrics: [
    'HEART_RATE',
    'BLOOD_PRESSURE',
    'TEMPERATURE'
  ],
  config: {
    interval: 300, // 5 minutes
    alertThresholds: {
      HEART_RATE: {
        min: 60,
        max: 100
      },
      TEMPERATURE: {
        min: 36.5,
        max: 37.5
      }
    }
  }
});

// Submit reading
const reading = await client.monitoring.submitReading('monitoring-456', {
  metric: 'HEART_RATE',
  value: 75,
  unit: 'BPM',
  timestamp: new Date(),
  metadata: {
    quality: 'HIGH',
    position: 'SITTING'
  }
});

// Get readings
const readings = await client.monitoring.getReadings('monitoring-456', {
  metric: 'HEART_RATE',
  from: new Date('2024-03-21T00:00:00Z'),
  to: new Date('2024-03-21T23:59:59Z'),
  page: 1,
  pageSize: 20
});

// Handle monitoring events
client.monitoring.on('reading', (reading) => {
  console.log('New reading:', {
    metric: reading.metric,
    value: reading.value,
    unit: reading.unit,
    timestamp: reading.timestamp
  });
});

client.monitoring.on('alert', async (alert) => {
  console.log('Alert triggered:', {
    metric: alert.metric,
    value: alert.value,
    threshold: alert.threshold,
    severity: alert.severity
  });
  
  // Create incident
  await client.incidents.create({
    type: 'VITAL_SIGNS_ALERT',
    severity: alert.severity,
    patientId: 'patient-123',
    details: alert
  });
});
```

### Documents

```typescript
// Create document
const prescription = await client.documents.create({
  type: 'PRESCRIPTION',
  consultationId: 'consultation-789',
  content: {
    medications: [
      {
        name: 'Medication A',
        dosage: '10mg',
        frequency: 'twice daily',
        duration: '7 days'
      }
    ],
    instructions: 'Take with food',
    prescribedBy: 'Dr. Smith'
  },
  metadata: {
    urgent: false,
    department: 'general'
  }
});

// Sign document
await client.documents.sign('document-123', {
  signerId: 'provider-456',
  method: 'DIGITAL',
  certificate: {
    type: 'NHS_SMART_CARD',
    id: 'nhs-123'
  }
});

// Configure encryption
client.documents.configureEncryption({
  algorithm: 'AES-256-GCM',
  keySize: 256,
  provider: 'AWS_KMS'
});

// Set access controls
await client.documents.setAccess('document-123', {
  rules: [
    {
      role: 'DOCTOR',
      permissions: ['VIEW', 'SIGN', 'SHARE']
    },
    {
      role: 'NURSE',
      permissions: ['VIEW']
    }
  ]
});

// Handle document events
client.documents.on('created', (doc) => {
  console.log('Document created:', doc.id);
});

client.documents.on('signed', (doc) => {
  console.log('Document signed:', doc.id);
});

client.documents.on('accessed', (event) => {
  console.log('Document accessed:', {
    documentId: event.documentId,
    userId: event.userId,
    action: event.action,
    timestamp: event.timestamp
  });
});
```

## Compliance Features

### Regional Configuration

```typescript
// Configure regional settings
client.compliance.setRegion({
  code: 'UK_CQC',
  requirements: {
    dataRetention: 7 * 365, // 7 years
    encryption: true,
    auditLogging: true,
    mfa: true
  },
  regulators: [
    {
      name: 'CQC',
      reportingUrl: 'https://api.cqc.org.uk/reports',
      apiKey: process.env.CQC_API_KEY
    }
  ]
});

// Handle compliance events
client.compliance.on('check', async (operation) => {
  const result = await client.compliance.validateOperation(operation);
  
  if (!result.compliant) {
    console.error('Compliance violation:', result.violations);
    throw new Error('Operation not compliant');
  }
});
```

### Audit Logging

```typescript
// Configure audit logging
client.audit.configure({
  enabled: true,
  level: 'DETAILED',
  retention: 7 * 365, // 7 years
  destination: 'AWS_CLOUDWATCH'
});

// Log clinical events
client.audit.logClinical({
  type: 'CONSULTATION_START',
  patientId: 'patient-123',
  providerId: 'provider-456',
  details: {
    consultationId: 'consultation-789',
    type: 'ROUTINE',
    location: 'VIRTUAL'
  }
});

// Log system events
client.audit.logSystem({
  type: 'CONFIG_CHANGE',
  component: 'VIDEO',
  user: 'admin-123',
  details: {
    setting: 'quality',
    oldValue: 'HD',
    newValue: 'SD'
  }
});
```

### Data Protection

```typescript
// Configure data protection
client.security.configureDataProtection({
  encryption: {
    atRest: true,
    inTransit: true,
    algorithm: 'AES-256-GCM'
  },
  anonymization: {
    enabled: true,
    fields: ['name', 'address', 'phone']
  },
  backup: {
    enabled: true,
    frequency: 'DAILY',
    retention: 90 // days
  }
});

// Handle data access
client.security.on('dataAccess', async (request) => {
  const authorized = await client.security.checkAuthorization({
    userId: request.userId,
    resource: request.resource,
    action: request.action
  });
  
  if (!authorized) {
    throw new Error('Unauthorized data access');
  }
});
```

## Error Handling

### API Errors

```typescript
try {
  await client.consultations.create({
    patientId: 'patient-123',
    providerId: 'provider-456'
  });
} catch (error) {
  if (error instanceof TelehealthError) {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        console.error('Invalid parameters:', error.details);
        break;
      case 'AUTHORIZATION_ERROR':
        console.error('Not authorized:', error.message);
        break;
      case 'RATE_LIMIT_ERROR':
        console.error('Rate limit exceeded:', error.reset);
        break;
      default:
        console.error('Unknown error:', error);
    }
  }
}
```

### Network Errors

```typescript
client.on('networkError', async (error) => {
  console.error('Network error:', error);
  
  if (error.retryable) {
    await client.retry({
      maxAttempts: 3,
      backoff: 'exponential'
    });
  }
});
```

## Testing

### Integration Tests

```typescript
import { TestClient } from '@writecarenotes/telehealth-testing';

describe('Telehealth Integration', () => {
  let client: TestClient;
  
  beforeEach(() => {
    client = new TestClient({
      environment: 'test',
      mockResponses: true
    });
  });
  
  test('Create Consultation', async () => {
    const consultation = await client.consultations.create({
      patientId: 'test-patient',
      providerId: 'test-provider'
    });
    
    expect(consultation.status).toBe('SCHEDULED');
  });
  
  test('Handle Network Error', async () => {
    client.simulate.networkError({
      method: 'POST',
      path: '/consultations'
    });
    
    await expect(
      client.consultations.create({
        patientId: 'test-patient',
        providerId: 'test-provider'
      })
    ).rejects.toThrow('Network Error');
  });
});
```

### Load Testing

```typescript
import { LoadTest } from '@writecarenotes/telehealth-testing';

const loadTest = new LoadTest({
  duration: 300, // 5 minutes
  users: 100,
  rampUp: 60 // 1 minute
});

loadTest.scenario('Video Consultation', async (client) => {
  // Create consultation
  const consultation = await client.consultations.create({
    patientId: `patient-${client.userId}`,
    providerId: `provider-${client.userId}`
  });
  
  // Start video session
  const session = await client.video.start({
    consultationId: consultation.id
  });
  
  // Simulate video streaming
  await client.video.simulate.stream({
    duration: 300,
    quality: 'HD'
  });
  
  // End session
  await client.video.end(session.id);
});

loadTest.on('complete', (results) => {
  console.log('Load test results:', {
    totalRequests: results.requests,
    avgResponseTime: results.responseTime.avg,
    errorRate: results.errorRate
  });
});

loadTest.start();
```

## Support

### Technical Support
- Email: support@writecarenotes.com
- Phone: +44 800 123 4567
- Hours: 24/7

### Documentation
- API Reference: https://docs.writecarenotes.com/api
- Integration Guide: https://docs.writecarenotes.com/integration
- Compliance Guide: https://docs.writecarenotes.com/compliance

### Community
- GitHub: https://github.com/writecarenotes
- Discord: https://discord.gg/writecarenotes
- Stack Overflow: https://stackoverflow.com/questions/tagged/writecarenotes 