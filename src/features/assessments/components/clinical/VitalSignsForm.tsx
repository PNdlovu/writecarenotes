import { useState } from 'react';
import { VitalSigns } from '../../types/clinical.types';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert';
import { Label } from '@/components/ui/Label';

interface VitalSignsFormProps {
  initialData?: VitalSigns;
  onSave: (data: VitalSigns) => void;
  onCancel: () => void;
}

export function VitalSignsForm({ initialData, onSave, onCancel }: VitalSignsFormProps) {
  const [data, setData] = useState<VitalSigns>(initialData || {
    temperature: 0,
    bloodPressure: { systolic: 0, diastolic: 0 },
    heartRate: 0,
    respiratoryRate: 0,
    oxygenSaturation: 0,
    pain: 0,
    timestamp: new Date(),
  });

  const [errors, setErrors] = useState<Partial<Record<keyof VitalSigns, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof VitalSigns, string>> = {};

    if (data.temperature < 35 || data.temperature > 42) {
      newErrors.temperature = 'Temperature must be between 35°C and 42°C';
    }

    if (data.bloodPressure.systolic < 70 || data.bloodPressure.systolic > 200) {
      newErrors.bloodPressure = 'Systolic pressure must be between 70 and 200';
    }

    if (data.bloodPressure.diastolic < 40 || data.bloodPressure.diastolic > 130) {
      newErrors.bloodPressure = 'Diastolic pressure must be between 40 and 130';
    }

    if (data.heartRate < 40 || data.heartRate > 200) {
      newErrors.heartRate = 'Heart rate must be between 40 and 200';
    }

    if (data.respiratoryRate < 8 || data.respiratoryRate > 40) {
      newErrors.respiratoryRate = 'Respiratory rate must be between 8 and 40';
    }

    if (data.oxygenSaturation < 70 || data.oxygenSaturation > 100) {
      newErrors.oxygenSaturation = 'Oxygen saturation must be between 70% and 100%';
    }

    if (data.pain < 0 || data.pain > 10) {
      newErrors.pain = 'Pain must be between 0 and 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave({ ...data, timestamp: new Date() });
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Vital Signs</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="temperature">Temperature (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={data.temperature}
                onChange={(e) => setData({ ...data, temperature: parseFloat(e.target.value) })}
              />
              {errors.temperature && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.temperature}</AlertDescription>
                </Alert>
              )}
            </div>

            <div>
              <Label>Blood Pressure (mmHg)</Label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Systolic"
                  value={data.bloodPressure.systolic}
                  onChange={(e) => 
                    setData({
                      ...data,
                      bloodPressure: {
                        ...data.bloodPressure,
                        systolic: parseInt(e.target.value)
                      }
                    })
                  }
                />
                <span className="text-2xl">/</span>
                <Input
                  type="number"
                  placeholder="Diastolic"
                  value={data.bloodPressure.diastolic}
                  onChange={(e) =>
                    setData({
                      ...data,
                      bloodPressure: {
                        ...data.bloodPressure,
                        diastolic: parseInt(e.target.value)
                      }
                    })
                  }
                />
              </div>
              {errors.bloodPressure && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.bloodPressure}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
              <Input
                id="heartRate"
                type="number"
                value={data.heartRate}
                onChange={(e) => setData({ ...data, heartRate: parseInt(e.target.value) })}
              />
              {errors.heartRate && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.heartRate}</AlertDescription>
                </Alert>
              )}
            </div>

            <div>
              <Label htmlFor="respiratoryRate">Respiratory Rate (breaths/min)</Label>
              <Input
                id="respiratoryRate"
                type="number"
                value={data.respiratoryRate}
                onChange={(e) => setData({ ...data, respiratoryRate: parseInt(e.target.value) })}
              />
              {errors.respiratoryRate && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.respiratoryRate}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="oxygenSaturation">Oxygen Saturation (%)</Label>
              <Input
                id="oxygenSaturation"
                type="number"
                value={data.oxygenSaturation}
                onChange={(e) => setData({ ...data, oxygenSaturation: parseInt(e.target.value) })}
              />
              {errors.oxygenSaturation && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.oxygenSaturation}</AlertDescription>
                </Alert>
              )}
            </div>

            <div>
              <Label htmlFor="pain">Pain Level (0-10)</Label>
              <Input
                id="pain"
                type="number"
                min="0"
                max="10"
                value={data.pain}
                onChange={(e) => setData({ ...data, pain: parseInt(e.target.value) })}
              />
              {errors.pain && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.pain}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Vital Signs</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
