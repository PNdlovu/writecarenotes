import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  CommunicationNeeds,
  MobilityNeeds,
  SensoryNeeds,
  CognitiveNeeds,
  BehavioralSupports,
  SpecializedCare,
  ProgressTracking,
} from './types';
import { CommunicationSection } from './CommunicationSection';
import { MobilitySection } from './MobilitySection';
import { SensorySection } from './SensorySection';
import { CognitiveSection } from './CognitiveSection';
import { BehavioralSection } from './BehavioralSection';
import { SpecializedCareSection } from './SpecializedCareSection';
import { ProgressSection } from './ProgressSection';
import { Button } from '@/components/ui/Button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/Tabs';
import { ScrollArea } from '@/components/ui/ScrollArea';

interface SpecialNeedsAssessmentFormProps {
  initialData?: {
    communication: CommunicationNeeds;
    mobility: MobilityNeeds;
    sensory: SensoryNeeds;
    cognitive: CognitiveNeeds;
    behavioral: BehavioralSupports;
    specializedCare: SpecializedCare;
    progress: ProgressTracking;
  };
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

const defaultData = {
  communication: {
    primaryMethod: '',
    alternativeMethods: [],
    assistiveTechnology: [],
    communicationPreferences: [],
  },
  mobility: {
    mobilityAids: [],
    transferAssistance: '',
    environmentalModifications: [],
    safetyConsiderations: [],
  },
  sensory: {
    visual: {
      impairments: [],
      aids: [],
      accommodations: [],
    },
    auditory: {
      impairments: [],
      aids: [],
      accommodations: [],
    },
    tactile: {
      sensitivities: [],
      preferences: [],
      accommodations: [],
    },
  },
  cognitive: {
    comprehensionLevel: '',
    memorySupports: [],
    learningStyle: '',
    adaptations: [],
  },
  behavioral: {
    triggers: [],
    calmingStrategies: [],
    routines: [],
    reinforcements: [],
  },
  specializedCare: {
    medicalProcedures: [],
    equipmentNeeds: [],
    dietaryRequirements: [],
    emergencyProtocols: [],
  },
  progress: {
    goals: [],
    observations: [],
    adaptationEffectiveness: [],
  },
};

export function SpecialNeedsAssessmentForm({
  initialData,
  onSave,
  onCancel,
}: SpecialNeedsAssessmentFormProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData || defaultData);
  const [activeTab, setActiveTab] = useState('communication');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSection = <K extends keyof typeof data>(
    section: K,
    newData: typeof data[K]
  ) => {
    setData((prev) => ({
      ...prev,
      [section]: newData,
    }));
  };

  const validateData = () => {
    // Communication validation
    if (!data.communication.primaryMethod) {
      setError('Primary communication method is required');
      setActiveTab('communication');
      return false;
    }

    // Mobility validation
    if (!data.mobility.transferAssistance) {
      setError('Transfer assistance level is required');
      setActiveTab('mobility');
      return false;
    }

    // Cognitive validation
    if (!data.cognitive.comprehensionLevel || !data.cognitive.learningStyle) {
      setError('Comprehension level and learning style are required');
      setActiveTab('cognitive');
      return false;
    }

    // Specialized Care validation
    if (data.specializedCare.medicalProcedures.length === 0) {
      setError('At least one medical procedure must be specified');
      setActiveTab('specializedCare');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    try {
      if (!validateData()) return;

      setIsSaving(true);
      setError(null);
      await onSave(data);
      router.push('/assessments'); // Navigate to assessments list
    } catch (err) {
      setError('Failed to save assessment. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Special Needs Assessment</h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Assessment'}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <ScrollArea className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="mobility">Mobility</TabsTrigger>
            <TabsTrigger value="sensory">Sensory</TabsTrigger>
            <TabsTrigger value="cognitive">Cognitive</TabsTrigger>
            <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
            <TabsTrigger value="specializedCare">Specialized Care</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>
        </ScrollArea>

        <div className="mt-6">
          <TabsContent value="communication">
            <CommunicationSection
              data={data.communication}
              onChange={(newData) => updateSection('communication', newData)}
            />
          </TabsContent>

          <TabsContent value="mobility">
            <MobilitySection
              data={data.mobility}
              onChange={(newData) => updateSection('mobility', newData)}
            />
          </TabsContent>

          <TabsContent value="sensory">
            <SensorySection
              data={data.sensory}
              onChange={(newData) => updateSection('sensory', newData)}
            />
          </TabsContent>

          <TabsContent value="cognitive">
            <CognitiveSection
              data={data.cognitive}
              onChange={(newData) => updateSection('cognitive', newData)}
            />
          </TabsContent>

          <TabsContent value="behavioral">
            <BehavioralSection
              data={data.behavioral}
              onChange={(newData) => updateSection('behavioral', newData)}
            />
          </TabsContent>

          <TabsContent value="specializedCare">
            <SpecializedCareSection
              data={data.specializedCare}
              onChange={(newData) => updateSection('specializedCare', newData)}
            />
          </TabsContent>

          <TabsContent value="progress">
            <ProgressSection
              data={data.progress}
              onChange={(newData) => updateSection('progress', newData)}
            />
          </TabsContent>
        </div>
      </Tabs>

      <div className="flex justify-end space-x-2 mt-6">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Assessment'}
        </Button>
      </div>
    </div>
  );
}
