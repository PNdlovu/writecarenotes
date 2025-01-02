import localforage from 'localforage';

export interface ChartSettings {
  type: 'line' | 'area' | 'bar';
  showGrid: boolean;
  showLegend: boolean;
  showTooltip: boolean;
  animate: boolean;
}

export interface MetricSettings {
  visible: boolean;
  order: number;
  customLabel?: string;
  customColor?: string;
  trendVisible: boolean;
}

export interface AnalyticsSettings {
  refreshInterval: number;
  defaultTimeRange: '24h' | '7d' | '30d';
  charts: Record<string, ChartSettings>;
  metrics: Record<string, MetricSettings>;
  exportFormat: 'csv' | 'json';
  darkMode: boolean;
}

const DEFAULT_SETTINGS: AnalyticsSettings = {
  refreshInterval: 5000,
  defaultTimeRange: '24h',
  charts: {
    eventTimeline: {
      type: 'line',
      showGrid: true,
      showLegend: true,
      showTooltip: true,
      animate: true
    },
    storageGrowth: {
      type: 'area',
      showGrid: true,
      showLegend: true,
      showTooltip: true,
      animate: true
    },
    errorTracking: {
      type: 'line',
      showGrid: true,
      showLegend: true,
      showTooltip: true,
      animate: true
    }
  },
  metrics: {
    totalEvents: {
      visible: true,
      order: 1,
      trendVisible: true
    },
    storageUsed: {
      visible: true,
      order: 2,
      trendVisible: true
    },
    syncQueue: {
      visible: true,
      order: 3,
      trendVisible: true
    },
    successRate: {
      visible: true,
      order: 4,
      trendVisible: true
    }
  },
  exportFormat: 'csv',
  darkMode: false
};

export class SettingsService {
  private static instance: SettingsService;
  private settings: AnalyticsSettings = DEFAULT_SETTINGS;
  private readonly STORAGE_KEY = 'analytics_settings';

  private constructor() {
    this.loadSettings();
  }

  static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  async loadSettings(): Promise<void> {
    try {
      const stored = await localforage.getItem<AnalyticsSettings>(this.STORAGE_KEY);
      if (stored) {
        this.settings = {
          ...DEFAULT_SETTINGS,
          ...stored
        };
      }
    } catch (error) {
      console.error('Failed to load analytics settings:', error);
    }
  }

  async saveSettings(settings: Partial<AnalyticsSettings>): Promise<void> {
    try {
      this.settings = {
        ...this.settings,
        ...settings
      };
      await localforage.setItem(this.STORAGE_KEY, this.settings);
    } catch (error) {
      console.error('Failed to save analytics settings:', error);
      throw error;
    }
  }

  getSettings(): AnalyticsSettings {
    return { ...this.settings };
  }

  async updateChartSettings(chartId: string, settings: Partial<ChartSettings>): Promise<void> {
    const charts = {
      ...this.settings.charts,
      [chartId]: {
        ...this.settings.charts[chartId],
        ...settings
      }
    };
    await this.saveSettings({ charts });
  }

  async updateMetricSettings(metricId: string, settings: Partial<MetricSettings>): Promise<void> {
    const metrics = {
      ...this.settings.metrics,
      [metricId]: {
        ...this.settings.metrics[metricId],
        ...settings
      }
    };
    await this.saveSettings({ metrics });
  }

  async resetToDefaults(): Promise<void> {
    await this.saveSettings(DEFAULT_SETTINGS);
  }
}
