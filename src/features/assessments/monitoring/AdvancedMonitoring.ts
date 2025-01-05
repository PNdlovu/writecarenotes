import { performance, PerformanceObserver } from 'perf_hooks';

// Enhanced performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, any[]> = new Map();
  private observer: PerformanceObserver;

  private constructor() {
    this.setupObserver();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private setupObserver() {
    this.observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.recordMetric(entry.name, {
          duration: entry.duration,
          startTime: entry.startTime,
          entryType: entry.entryType,
        });
      });
    });

    this.observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
  }

  recordMetric(name: string, value: any) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)?.push({
      ...value,
      timestamp: new Date().toISOString(),
    });
  }

  getMetrics(name: string) {
    return this.metrics.get(name) || [];
  }

  clearMetrics() {
    this.metrics.clear();
  }
}

// Advanced error tracking
export class ErrorTracker {
  private static instance: ErrorTracker;
  private errors: any[] = [];
  private errorThresholds: Map<string, number> = new Map();

  private constructor() {
    this.setupErrorThresholds();
  }

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  private setupErrorThresholds() {
    this.errorThresholds.set('api', 5);
    this.errorThresholds.set('validation', 10);
    this.errorThresholds.set('ui', 3);
  }

  trackError(error: any) {
    const errorData = {
      ...error,
      timestamp: new Date().toISOString(),
      stack: error.stack,
      context: this.getErrorContext(),
    };

    this.errors.push(errorData);
    this.checkThresholds(error.type);
    this.reportError(errorData);
  }

  private getErrorContext() {
    return {
      url: window.location.href,
      userAgent: navigator.userAgent,
      memory: (performance as any).memory,
    };
  }

  private checkThresholds(type: string) {
    const threshold = this.errorThresholds.get(type);
    if (threshold) {
      const recentErrors = this.errors.filter(
        (e) => e.type === type && 
        new Date().getTime() - new Date(e.timestamp).getTime() < 300000
      );
      
      if (recentErrors.length >= threshold) {
        this.triggerAlert(type, recentErrors);
      }
    }
  }

  private triggerAlert(type: string, errors: any[]) {
    reportAlert({
      type: 'error_threshold',
      errorType: type,
      count: errors.length,
      errors: errors,
    });
  }
}

// Real-time user monitoring
export class UserMonitor {
  private static instance: UserMonitor;
  private sessions: Map<string, any> = new Map();
  private interactions: any[] = [];

  private constructor() {
    this.setupListeners();
  }

  static getInstance(): UserMonitor {
    if (!UserMonitor.instance) {
      UserMonitor.instance = new UserMonitor();
    }
    return UserMonitor.instance;
  }

  private setupListeners() {
    window.addEventListener('click', this.trackInteraction.bind(this));
    window.addEventListener('keypress', this.trackInteraction.bind(this));
    window.addEventListener('scroll', this.debounce(this.trackScroll.bind(this), 100));
  }

  startSession(userId: string) {
    this.sessions.set(userId, {
      startTime: new Date().toISOString(),
      interactions: 0,
      errors: 0,
      performance: {},
    });
  }

  trackInteraction(event: Event) {
    const interaction = {
      type: event.type,
      target: (event.target as HTMLElement)?.tagName,
      timestamp: new Date().toISOString(),
    };

    this.interactions.push(interaction);
    this.analyzeUserBehavior();
  }

  private trackScroll(event: Event) {
    const scrollData = {
      scrollY: window.scrollY,
      timestamp: new Date().toISOString(),
    };

    this.recordMetric('scroll', scrollData);
  }

  private analyzeUserBehavior() {
    if (this.interactions.length > 100) {
      const patterns = this.detectPatterns(this.interactions);
      this.reportPatterns(patterns);
    }
  }

  private detectPatterns(interactions: any[]) {
    // Implement pattern detection logic
    return {
      frequentActions: this.getFrequentActions(interactions),
      errorProne: this.getErrorProneActions(interactions),
      performance: this.getPerformanceIssues(interactions),
    };
  }

  private getFrequentActions(interactions: any[]) {
    const actionCounts = new Map();
    interactions.forEach((interaction) => {
      const key = `${interaction.type}_${interaction.target}`;
      actionCounts.set(key, (actionCounts.get(key) || 0) + 1);
    });
    return Array.from(actionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }

  private getErrorProneActions(interactions: any[]) {
    return interactions.filter((i) => i.error);
  }

  private getPerformanceIssues(interactions: any[]) {
    return interactions.filter((i) => i.duration > 1000);
  }

  private debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// System health monitor
export class SystemHealthMonitor {
  private static instance: SystemHealthMonitor;
  private healthChecks: Map<string, () => Promise<boolean>> = new Map();
  private healthStatus: Map<string, boolean> = new Map();

  private constructor() {
    this.setupHealthChecks();
  }

  static getInstance(): SystemHealthMonitor {
    if (!SystemHealthMonitor.instance) {
      SystemHealthMonitor.instance = new SystemHealthMonitor();
    }
    return SystemHealthMonitor.instance;
  }

  private setupHealthChecks() {
    this.addHealthCheck('api', async () => {
      try {
        const response = await fetch('/api/health');
        return response.ok;
      } catch {
        return false;
      }
    });

    this.addHealthCheck('database', async () => {
      try {
        const response = await fetch('/api/database/health');
        return response.ok;
      } catch {
        return false;
      }
    });

    this.addHealthCheck('memory', async () => {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize < memory.jsHeapSizeLimit * 0.9;
    });
  }

  addHealthCheck(name: string, check: () => Promise<boolean>) {
    this.healthChecks.set(name, check);
  }

  async runHealthChecks() {
    for (const [name, check] of this.healthChecks) {
      try {
        const result = await check();
        this.healthStatus.set(name, result);
        if (!result) {
          this.triggerHealthAlert(name);
        }
      } catch (error) {
        this.healthStatus.set(name, false);
        this.triggerHealthAlert(name);
      }
    }
    return Object.fromEntries(this.healthStatus);
  }

  private triggerHealthAlert(service: string) {
    reportAlert({
      type: 'health_check',
      service,
      status: 'failed',
      timestamp: new Date().toISOString(),
    });
  }
}

// Initialize all monitors
export const initializeMonitoring = () => {
  const perfMonitor = PerformanceMonitor.getInstance();
  const errorTracker = ErrorTracker.getInstance();
  const userMonitor = UserMonitor.getInstance();
  const healthMonitor = SystemHealthMonitor.getInstance();

  // Start health check interval
  setInterval(() => {
    healthMonitor.runHealthChecks();
  }, 60000);

  return {
    perfMonitor,
    errorTracker,
    userMonitor,
    healthMonitor,
  };
};

// Reporting function (implement based on monitoring service)
function reportAlert(alert: any) {
  console.log('Alert:', alert);
  // Implement actual reporting logic
}
