import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const needsAssessmentSchema = z.object({
  // Physical Health
  medicalConditions: z.string(),
  medications: z.string(),
  allergies: z.string(),
  dietaryRequirements: z.string(),
  mobilityNeeds: z.string(),
  
  // Mental Health
  mentalHealthNeeds: z.string(),
  emotionalSupport: z.string(),
  behaviouralSupport: z.string(),
  traumaHistory: z.string(),
  
  // Educational
  currentEducation: z.string(),
  educationalNeeds: z.string(),
  learningDifficulties: z.string(),
  educationalSupport: z.string(),
  
  // Social & Development
  socialSkills: z.string(),
  peerRelationships: z.string(),
  familyRelationships: z.string(),
  culturalNeeds: z.string(),
  religiousNeeds: z.string(),
  
  // Life Skills
  independentLiving: z.string(),
  selfCare: z.string(),
  lifeskillsTraining: z.string(),
  
  // Safety & Risk
  riskAssessment: z.string(),
  safetyMeasures: z.string(),
  triggerFactors: z.string(),
  deescalationStrategies: z.string(),
  
  // Communication
  communicationStyle: z.string(),
  languageNeeds: z.string(),
  communicationSupport: z.string(),
  
  // Therapeutic Support
  therapyNeeds: z.string(),
  counsellingSupport: z.string(),
  specialistInterventions: z.string(),
});

type NeedsAssessmentValues = z.infer<typeof needsAssessmentSchema>;

export const NeedsAssessment = () => {
  const form = useForm<NeedsAssessmentValues>({
    resolver: zodResolver(needsAssessmentSchema),
  });

  const onSubmit = async (data: NeedsAssessmentValues) => {
    try {
      // TODO: Implement API call
      console.log('Needs assessment data:', data);
    } catch (error) {
      console.error('Error saving needs assessment:', error);
    }
  };

  const renderNeedsSection = (title: string, fields: { name: keyof NeedsAssessmentValues, label: string }[]) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map(({ name, label }) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Comprehensive Needs Assessment</CardTitle>
          <CardDescription>
            Complete assessment of child's needs across all areas of care
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {renderNeedsSection('Physical Health', [
                { name: 'medicalConditions', label: 'Medical Conditions & History' },
                { name: 'medications', label: 'Current Medications & Treatment' },
                { name: 'allergies', label: 'Allergies & Sensitivities' },
                { name: 'dietaryRequirements', label: 'Dietary Requirements' },
                { name: 'mobilityNeeds', label: 'Mobility Needs & Support' },
              ])}

              {renderNeedsSection('Mental Health & Emotional Wellbeing', [
                { name: 'mentalHealthNeeds', label: 'Mental Health Needs' },
                { name: 'emotionalSupport', label: 'Emotional Support Requirements' },
                { name: 'behaviouralSupport', label: 'Behavioural Support Needs' },
                { name: 'traumaHistory', label: 'Trauma History & Support Needs' },
              ])}

              {renderNeedsSection('Educational Needs', [
                { name: 'currentEducation', label: 'Current Educational Setting' },
                { name: 'educationalNeeds', label: 'Educational Support Needs' },
                { name: 'learningDifficulties', label: 'Learning Difficulties' },
                { name: 'educationalSupport', label: 'Additional Educational Support' },
              ])}

              {renderNeedsSection('Social & Developmental Needs', [
                { name: 'socialSkills', label: 'Social Skills Development' },
                { name: 'peerRelationships', label: 'Peer Relationships' },
                { name: 'familyRelationships', label: 'Family Relationships' },
                { name: 'culturalNeeds', label: 'Cultural Needs & Identity' },
                { name: 'religiousNeeds', label: 'Religious & Spiritual Needs' },
              ])}

              {renderNeedsSection('Life Skills Development', [
                { name: 'independentLiving', label: 'Independent Living Skills' },
                { name: 'selfCare', label: 'Self-Care Abilities' },
                { name: 'lifeskillsTraining', label: 'Life Skills Training Needs' },
              ])}

              {renderNeedsSection('Safety & Risk Management', [
                { name: 'riskAssessment', label: 'Risk Assessment' },
                { name: 'safetyMeasures', label: 'Safety Measures Required' },
                { name: 'triggerFactors', label: 'Known Triggers' },
                { name: 'deescalationStrategies', label: 'De-escalation Strategies' },
              ])}

              {renderNeedsSection('Communication Needs', [
                { name: 'communicationStyle', label: 'Communication Style' },
                { name: 'languageNeeds', label: 'Language Requirements' },
                { name: 'communicationSupport', label: 'Communication Support Needs' },
              ])}

              {renderNeedsSection('Therapeutic Support', [
                { name: 'therapyNeeds', label: 'Therapy Requirements' },
                { name: 'counsellingSupport', label: 'Counselling Support' },
                { name: 'specialistInterventions', label: 'Specialist Interventions' },
              ])}

              <Button type="submit" className="w-full">Save Assessment</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
