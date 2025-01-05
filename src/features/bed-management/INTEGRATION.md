# Integration Guide

## Overview
This guide provides examples and best practices for integrating the Bed Management Module with various systems and services.

## API Integration Examples

### 1. REST API Integration

```typescript
// Example of bed allocation request
const response = await fetch('/api/beds/allocate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    patientId: '123',
    preferences: {
      floor: 2,
      roomType: 'private',
      accessibility: true
    }
  })
});

const result = await response.json();
```

### 2. WebSocket Integration

```typescript
// Real-time bed status updates
const ws = new WebSocket('wss://your-domain/beds/status');

ws.onmessage = (event) => {
  const bedStatus = JSON.parse(event.data);
  updateBedStatus(bedStatus);
};
```

### 3. Event Integration

```typescript
// Subscribe to bed events
bedEventEmitter.on('bed.allocated', (data) => {
  notifyStaff(data);
  updateDashboard(data);
});

bedEventEmitter.on('bed.maintenance', (data) => {
  updateMaintenanceSchedule(data);
});
```

## Third-Party System Integration

### 1. Electronic Health Records (EHR)

```typescript
// Example of EHR integration
class EHRIntegration {
  async syncPatientData(patientId: string): Promise<void> {
    const ehrData = await ehrClient.getPatient(patientId);
    await bedSystem.updatePatientInfo(patientId, ehrData);
  }

  async notifyAdmission(bedAssignment: BedAssignment): Promise<void> {
    await ehrClient.createAdmissionRecord({
      patientId: bedAssignment.patientId,
      bedId: bedAssignment.bedId,
      timestamp: new Date(),
      // ... other admission details
    });
  }
}
```

### 2. Billing System

```typescript
// Example of billing system integration
class BillingIntegration {
  async createBedCharge(assignment: BedAssignment): Promise<void> {
    const rate = await this.getBedRate(assignment.bedId);
    await billingSystem.createCharge({
      patientId: assignment.patientId,
      type: 'BED_CHARGE',
      amount: rate.daily,
      startDate: assignment.startDate,
      // ... other billing details
    });
  }
}
```

## Notification System Integration

```typescript
// Example of notification system integration
class NotificationIntegration {
  async sendTransferNotification(transfer: BedTransfer): Promise<void> {
    // Notify relevant staff
    await notificationSystem.send({
      recipients: await this.getRelevantStaff(transfer),
      template: 'BED_TRANSFER',
      data: {
        patientName: transfer.patientName,
        fromBed: transfer.sourceBed,
        toBed: transfer.targetBed,
        scheduledTime: transfer.scheduledTime
      }
    });
  }
}
```

## Authentication Integration

```typescript
// Example of authentication middleware
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = await verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

## Best Practices

1. **Error Handling**
   - Implement proper error handling for all integrations
   - Use retry mechanisms for failed requests
   - Log integration errors for debugging

2. **Security**
   - Use secure connections (HTTPS/WSS)
   - Implement proper authentication
   - Validate all input data
   - Follow HIPAA compliance guidelines

3. **Performance**
   - Implement caching where appropriate
   - Use connection pooling
   - Implement rate limiting
   - Monitor integration performance

4. **Monitoring**
   - Set up health checks
   - Monitor integration status
   - Track error rates
   - Set up alerts for critical failures

## Testing

```typescript
// Example of integration test
describe('EHR Integration', () => {
  it('should sync patient data', async () => {
    const ehrIntegration = new EHRIntegration();
    const result = await ehrIntegration.syncPatientData('123');
    expect(result).toBeDefined();
    // ... more assertions
  });
});
```
