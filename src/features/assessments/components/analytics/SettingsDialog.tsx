import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Settings2Icon } from 'lucide-react';
import { SettingsService, AnalyticsSettings } from '../../services/analytics/SettingsService';
import { AlertService, AlertThreshold } from '../../services/analytics/AlertService';

export function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<AnalyticsSettings | null>(null);
  const [thresholds, setThresholds] = useState<AlertThreshold[]>([]);
  const settingsService = SettingsService.getInstance();
  const alertService = AlertService.getInstance();

  useEffect(() => {
    const loadSettings = async () => {
      const currentSettings = settingsService.getSettings();
      setSettings(currentSettings);
    };
    loadSettings();
  }, [open]);

  const handleSave = async (newSettings: Partial<AnalyticsSettings>) => {
    try {
      await settingsService.saveSettings(newSettings);
      setSettings(settingsService.getSettings());
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleReset = async () => {
    try {
      await settingsService.resetToDefaults();
      setSettings(settingsService.getSettings());
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  };

  if (!settings) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings2Icon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Analytics Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Refresh Interval (ms)</Label>
                <Input
                  type="number"
                  value={settings.refreshInterval}
                  onChange={(e) => handleSave({ refreshInterval: Number(e.target.value) })}
                  className="w-32"
                  min={1000}
                  step={1000}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Default Time Range</Label>
                <select
                  value={settings.defaultTimeRange}
                  onChange={(e) => handleSave({ defaultTimeRange: e.target.value as any })}
                  className="border rounded px-2 py-1"
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Export Format</Label>
                <select
                  value={settings.exportFormat}
                  onChange={(e) => handleSave({ exportFormat: e.target.value as any })}
                  className="border rounded px-2 py-1"
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Dark Mode</Label>
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => handleSave({ darkMode: checked })}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            {Object.entries(settings.metrics).map(([id, metric]) => (
              <div key={id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{id}</Label>
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={metric.visible}
                      onCheckedChange={(checked) => 
                        handleSave({
                          metrics: {
                            ...settings.metrics,
                            [id]: { ...metric, visible: checked }
                          }
                        })
                      }
                    />
                    <Input
                      placeholder="Custom Label"
                      value={metric.customLabel || ''}
                      onChange={(e) =>
                        handleSave({
                          metrics: {
                            ...settings.metrics,
                            [id]: { ...metric, customLabel: e.target.value }
                          }
                        })
                      }
                      className="w-40"
                    />
                    <Input
                      type="color"
                      value={metric.customColor || '#000000'}
                      onChange={(e) =>
                        handleSave({
                          metrics: {
                            ...settings.metrics,
                            [id]: { ...metric, customColor: e.target.value }
                          }
                        })
                      }
                      className="w-20"
                    />
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="charts" className="space-y-4">
            {Object.entries(settings.charts).map(([id, chart]) => (
              <div key={id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{id}</Label>
                  <div className="flex items-center gap-4">
                    <select
                      value={chart.type}
                      onChange={(e) =>
                        handleSave({
                          charts: {
                            ...settings.charts,
                            [id]: { ...chart, type: e.target.value as any }
                          }
                        })
                      }
                      className="border rounded px-2 py-1"
                    >
                      <option value="line">Line</option>
                      <option value="area">Area</option>
                      <option value="bar">Bar</option>
                    </select>
                    <Switch
                      checked={chart.showGrid}
                      onCheckedChange={(checked) =>
                        handleSave({
                          charts: {
                            ...settings.charts,
                            [id]: { ...chart, showGrid: checked }
                          }
                        })
                      }
                    />
                    <Label className="text-sm">Grid</Label>
                    <Switch
                      checked={chart.showLegend}
                      onCheckedChange={(checked) =>
                        handleSave({
                          charts: {
                            ...settings.charts,
                            [id]: { ...chart, showLegend: checked }
                          }
                        })
                      }
                    />
                    <Label className="text-sm">Legend</Label>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            {thresholds.map((threshold) => (
              <div key={threshold.metric} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{threshold.metric}</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      value={threshold.warning}
                      onChange={(e) =>
                        alertService.updateThreshold(threshold.metric, {
                          warning: Number(e.target.value)
                        })
                      }
                      className="w-24"
                      placeholder="Warning"
                    />
                    <Input
                      type="number"
                      value={threshold.error}
                      onChange={(e) =>
                        alertService.updateThreshold(threshold.metric, {
                          error: Number(e.target.value)
                        })
                      }
                      className="w-24"
                      placeholder="Error"
                    />
                    <Switch
                      checked={threshold.enabled}
                      onCheckedChange={(checked) =>
                        alertService.updateThreshold(threshold.metric, {
                          enabled: checked
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
