import { Card } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { AlertTriangle, Clock, Package, AlertCircle } from 'lucide-react';

export function MedicationAlerts() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Medication Alerts</h2>
        <Badge variant="outline" className="bg-red-50">
          4 Critical Alerts
        </Badge>
      </div>
      
      <Card className="p-4">
        <div className="space-y-4">
          {/* PRN Alert */}
          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
            {/* Alert content */}
          </div>

          {/* Drug Interaction Alert */}
          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
            {/* Alert content */}
          </div>

          {/* Stock Alert */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            {/* Alert content */}
          </div>
        </div>
      </Card>
    </div>
  );
} 