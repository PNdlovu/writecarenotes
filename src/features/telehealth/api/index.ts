import { z } from 'zod';
import { createRouter } from '@/lib/api/router';
import { TelehealthService } from '../services/TelehealthService';
import { TelehealthError } from '../errors/TelehealthError';
import { authMiddleware } from '../middleware/auth';
import { complianceMiddleware } from '../middleware/compliance';
import { rateLimitMiddleware, quotaMiddleware } from '../middleware/rateLimit';
import { Redis } from 'ioredis';
import {
  ConsultationSchema,
  VideoSessionSchema,
  MonitoringSchema,
  DocumentSchema,
  ReportSchema
} from '../schemas';

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL);

// Create router instance
const router = createRouter();
const telehealthService = new TelehealthService();

// Apply global middleware
router.use(authMiddleware());
router.use(complianceMiddleware());
router.use(rateLimitMiddleware(redis));
router.use(quotaMiddleware(redis));

// Consultation routes
router.post('/consultations', authMiddleware(['CREATE_CONSULTATION']), async (req, res) => {
  try {
    const data = ConsultationSchema.parse(req.body);
    const consultation = await telehealthService.createConsultation({
      ...data,
      organizationId: req.user.organizationId,
      region: req.user.region
    });
    res.status(201).json(consultation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        error: 'Validation Error',
        details: error.errors 
      });
    } else if (error instanceof TelehealthError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

router.get('/consultations/:id', authMiddleware(['VIEW_CONSULTATION']), async (req, res) => {
  try {
    const consultation = await telehealthService.getConsultation(req.params.id);
    if (!consultation) {
      res.status(404).json({ error: 'Consultation not found' });
      return;
    }
    
    // Verify organization access
    if (consultation.metadata?.organization !== req.user.organizationId) {
      throw new TelehealthError('Access denied', 403);
    }

    res.json(consultation);
  } catch (error) {
    if (error instanceof TelehealthError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

// Video session routes
router.post('/video-sessions', authMiddleware(['CREATE_VIDEO_SESSION']), async (req, res) => {
  try {
    const data = VideoSessionSchema.parse(req.body);
    const session = await telehealthService.createVideoSession({
      ...data,
      organizationId: req.user.organizationId,
      region: req.user.region
    });
    res.status(201).json(session);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        error: 'Validation Error',
        details: error.errors 
      });
    } else if (error instanceof TelehealthError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

// Monitoring routes
router.post('/monitoring/start', authMiddleware(['START_MONITORING']), async (req, res) => {
  try {
    const data = MonitoringSchema.parse(req.body);
    const monitoring = await telehealthService.startMonitoring({
      ...data,
      organizationId: req.user.organizationId,
      region: req.user.region
    });
    res.status(201).json(monitoring);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        error: 'Validation Error',
        details: error.errors 
      });
    } else if (error instanceof TelehealthError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

// Document routes
router.post('/documents', authMiddleware(['CREATE_DOCUMENT']), async (req, res) => {
  try {
    const data = DocumentSchema.parse(req.body);
    const document = await telehealthService.createDocument({
      ...data,
      organizationId: req.user.organizationId,
      region: req.user.region
    });
    res.status(201).json(document);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        error: 'Validation Error',
        details: error.errors 
      });
    } else if (error instanceof TelehealthError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

// Report routes
router.post('/reports', authMiddleware(['GENERATE_REPORT']), async (req, res) => {
  try {
    const data = ReportSchema.parse(req.body);
    const report = await telehealthService.generateReport({
      ...data,
      organizationId: req.user.organizationId,
      region: req.user.region
    });
    res.status(201).json(report);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        error: 'Validation Error',
        details: error.errors 
      });
    } else if (error instanceof TelehealthError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

export default router; 