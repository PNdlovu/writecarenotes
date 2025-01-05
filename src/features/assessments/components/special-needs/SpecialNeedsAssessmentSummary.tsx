import {
  CommunicationNeeds,
  MobilityNeeds,
  SensoryNeeds,
  CognitiveNeeds,
  BehavioralSupports,
  SpecializedCare,
  ProgressTracking,
} from './types';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertTitle } from '@/components/ui/Alert';
import { ScrollArea } from '@/components/ui/ScrollArea';

interface SpecialNeedsAssessmentSummaryProps {
  data: {
    communication: CommunicationNeeds;
    mobility: MobilityNeeds;
    sensory: SensoryNeeds;
    cognitive: CognitiveNeeds;
    behavioral: BehavioralSupports;
    specializedCare: SpecializedCare;
    progress: ProgressTracking;
  };
}

export function SpecialNeedsAssessmentSummary({
  data,
}: SpecialNeedsAssessmentSummaryProps) {
  const renderList = (items: string[], emptyMessage: string = 'None specified') => {
    if (!items?.length) return <p className="text-gray-500 italic">{emptyMessage}</p>;
    return (
      <ul className="list-disc list-inside space-y-1">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  };

  return (
    <ScrollArea className="h-[800px]">
      <div className="space-y-6 p-4">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Communication Summary</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Primary Method</h4>
                <Badge>{data.communication.primaryMethod}</Badge>
              </div>
              <div>
                <h4 className="font-medium">Alternative Methods</h4>
                {renderList(data.communication.alternativeMethods)}
              </div>
              <div>
                <h4 className="font-medium">Assistive Technology</h4>
                {renderList(data.communication.assistiveTechnology)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Mobility Summary</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Transfer Assistance</h4>
                <Badge variant="secondary">{data.mobility.transferAssistance}</Badge>
              </div>
              <div>
                <h4 className="font-medium">Mobility Aids</h4>
                {renderList(data.mobility.mobilityAids)}
              </div>
              <div>
                <h4 className="font-medium">Safety Considerations</h4>
                {renderList(data.mobility.safetyConsiderations)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Sensory Needs</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium">Visual</h4>
                <div className="ml-4 space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">Impairments:</span>
                    {renderList(data.sensory.visual.impairments)}
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Aids:</span>
                    {renderList(data.sensory.visual.aids)}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Auditory</h4>
                <div className="ml-4 space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">Impairments:</span>
                    {renderList(data.sensory.auditory.impairments)}
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Aids:</span>
                    {renderList(data.sensory.auditory.aids)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Cognitive & Behavioral</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Cognitive Status</h4>
                <div className="space-y-2">
                  <Badge>{data.cognitive.comprehensionLevel}</Badge>
                  <Badge className="ml-2">{data.cognitive.learningStyle}</Badge>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Behavioral Triggers</h4>
                {renderList(data.behavioral.triggers)}
              </div>
              <div>
                <h4 className="font-medium">Calming Strategies</h4>
                {renderList(data.behavioral.calmingStrategies)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Specialized Care</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert variant="warning">
                <AlertTitle>Critical Care Requirements</AlertTitle>
                <div className="mt-2">
                  <h4 className="font-medium">Medical Procedures</h4>
                  {renderList(data.specializedCare.medicalProcedures)}
                </div>
              </Alert>
              <div>
                <h4 className="font-medium">Equipment Needs</h4>
                {renderList(data.specializedCare.equipmentNeeds)}
              </div>
              <div>
                <h4 className="font-medium">Dietary Requirements</h4>
                {renderList(data.specializedCare.dietaryRequirements)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Progress Overview</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Current Goals</h4>
                {data.progress.goals.map((goal, index) => (
                  <div key={index} className="mt-2 p-3 bg-gray-50 rounded-md">
                    <p className="font-medium">{goal.description}</p>
                    <div className="mt-2">
                      <span className="text-sm text-gray-600">Strategies:</span>
                      {renderList(goal.strategies)}
                    </div>
                    <p className="mt-2 text-sm italic">{goal.progress}</p>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-medium">Recent Observations</h4>
                {renderList(data.progress.observations)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
