import { useState } from 'react';
import { CulturalAssessment } from '../../types/clinical.types';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert';

interface CulturalAssessmentFormProps {
  initialData?: CulturalAssessment;
  onSave: (data: CulturalAssessment) => void;
  onCancel: () => void;
}

const LANGUAGE_PROFICIENCY = ['Fluent', 'Intermediate', 'Basic', 'None'] as const;
const INTERPRETER_NEEDS = ['Always', 'Sometimes', 'Never'] as const;

export function CulturalAssessmentForm({
  initialData,
  onSave,
  onCancel,
}: CulturalAssessmentFormProps) {
  const [data, setData] = useState<CulturalAssessment>(
    initialData || {
      culturalBackground: {
        ethnicity: '',
        religion: '',
        primaryLanguage: '',
        additionalLanguages: [],
        languageProficiency: 'Fluent',
        interpreterNeeds: 'Never',
      },
      preferences: {
        dietary: [],
        religious: [],
        social: [],
        communication: [],
      },
      customs: {
        important: [],
        celebrations: [],
        taboos: [],
      },
      familyDynamics: {
        structure: '',
        decisionMaking: '',
        keyContacts: [],
      },
    }
  );

  const [error, setError] = useState<string | null>(null);

  const validate = (): boolean => {
    if (!data.culturalBackground.ethnicity) {
      setError('Ethnicity is required');
      return false;
    }
    if (!data.culturalBackground.primaryLanguage) {
      setError('Primary language is required');
      return false;
    }
    if (!data.familyDynamics.structure) {
      setError('Family structure information is required');
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (validate()) {
      onSave(data);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Cultural Background</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Ethnicity</Label>
              <Input
                value={data.culturalBackground.ethnicity}
                onChange={(e) =>
                  setData({
                    ...data,
                    culturalBackground: {
                      ...data.culturalBackground,
                      ethnicity: e.target.value,
                    },
                  })
                }
                placeholder="Enter ethnicity"
              />
            </div>

            <div>
              <Label>Religion</Label>
              <Input
                value={data.culturalBackground.religion}
                onChange={(e) =>
                  setData({
                    ...data,
                    culturalBackground: {
                      ...data.culturalBackground,
                      religion: e.target.value,
                    },
                  })
                }
                placeholder="Enter religion"
              />
            </div>

            <div>
              <Label>Primary Language</Label>
              <Input
                value={data.culturalBackground.primaryLanguage}
                onChange={(e) =>
                  setData({
                    ...data,
                    culturalBackground: {
                      ...data.culturalBackground,
                      primaryLanguage: e.target.value,
                    },
                  })
                }
                placeholder="Enter primary language"
              />
            </div>

            <div>
              <Label>Additional Languages</Label>
              <Textarea
                value={data.culturalBackground.additionalLanguages.join('\n')}
                onChange={(e) =>
                  setData({
                    ...data,
                    culturalBackground: {
                      ...data.culturalBackground,
                      additionalLanguages: e.target.value.split('\n').filter(Boolean),
                    },
                  })
                }
                placeholder="Enter each language on a new line"
                rows={3}
              />
            </div>

            <div>
              <Label>Language Proficiency</Label>
              <Select
                value={data.culturalBackground.languageProficiency}
                onValueChange={(value: typeof LANGUAGE_PROFICIENCY[number]) =>
                  setData({
                    ...data,
                    culturalBackground: {
                      ...data.culturalBackground,
                      languageProficiency: value,
                    },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select proficiency level" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_PROFICIENCY.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Interpreter Needs</Label>
              <Select
                value={data.culturalBackground.interpreterNeeds}
                onValueChange={(value: typeof INTERPRETER_NEEDS[number]) =>
                  setData({
                    ...data,
                    culturalBackground: {
                      ...data.culturalBackground,
                      interpreterNeeds: value,
                    },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select interpreter needs" />
                </SelectTrigger>
                <SelectContent>
                  {INTERPRETER_NEEDS.map((need) => (
                    <SelectItem key={need} value={need}>
                      {need}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Cultural Preferences</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Dietary Preferences</Label>
              <Textarea
                value={data.preferences.dietary.join('\n')}
                onChange={(e) =>
                  setData({
                    ...data,
                    preferences: {
                      ...data.preferences,
                      dietary: e.target.value.split('\n').filter(Boolean),
                    },
                  })
                }
                placeholder="Enter each dietary preference on a new line"
                rows={4}
              />
            </div>

            <div>
              <Label>Religious Practices</Label>
              <Textarea
                value={data.preferences.religious.join('\n')}
                onChange={(e) =>
                  setData({
                    ...data,
                    preferences: {
                      ...data.preferences,
                      religious: e.target.value.split('\n').filter(Boolean),
                    },
                  })
                }
                placeholder="Enter each religious practice on a new line"
                rows={4}
              />
            </div>

            <div>
              <Label>Social Preferences</Label>
              <Textarea
                value={data.preferences.social.join('\n')}
                onChange={(e) =>
                  setData({
                    ...data,
                    preferences: {
                      ...data.preferences,
                      social: e.target.value.split('\n').filter(Boolean),
                    },
                  })
                }
                placeholder="Enter each social preference on a new line"
                rows={4}
              />
            </div>

            <div>
              <Label>Communication Preferences</Label>
              <Textarea
                value={data.preferences.communication.join('\n')}
                onChange={(e) =>
                  setData({
                    ...data,
                    preferences: {
                      ...data.preferences,
                      communication: e.target.value.split('\n').filter(Boolean),
                    },
                  })
                }
                placeholder="Enter each communication preference on a new line"
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Cultural Customs</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Important Customs</Label>
              <Textarea
                value={data.customs.important.join('\n')}
                onChange={(e) =>
                  setData({
                    ...data,
                    customs: {
                      ...data.customs,
                      important: e.target.value.split('\n').filter(Boolean),
                    },
                  })
                }
                placeholder="Enter each important custom on a new line"
                rows={4}
              />
            </div>

            <div>
              <Label>Celebrations & Observances</Label>
              <Textarea
                value={data.customs.celebrations.join('\n')}
                onChange={(e) =>
                  setData({
                    ...data,
                    customs: {
                      ...data.customs,
                      celebrations: e.target.value.split('\n').filter(Boolean),
                    },
                  })
                }
                placeholder="Enter each celebration or observance on a new line"
                rows={4}
              />
            </div>

            <div>
              <Label>Cultural Taboos</Label>
              <Textarea
                value={data.customs.taboos.join('\n')}
                onChange={(e) =>
                  setData({
                    ...data,
                    customs: {
                      ...data.customs,
                      taboos: e.target.value.split('\n').filter(Boolean),
                    },
                  })
                }
                placeholder="Enter each taboo on a new line"
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Family Dynamics</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Family Structure</Label>
              <Textarea
                value={data.familyDynamics.structure}
                onChange={(e) =>
                  setData({
                    ...data,
                    familyDynamics: {
                      ...data.familyDynamics,
                      structure: e.target.value,
                    },
                  })
                }
                placeholder="Describe family structure and roles"
                rows={4}
              />
            </div>

            <div>
              <Label>Decision Making Process</Label>
              <Textarea
                value={data.familyDynamics.decisionMaking}
                onChange={(e) =>
                  setData({
                    ...data,
                    familyDynamics: {
                      ...data.familyDynamics,
                      decisionMaking: e.target.value,
                    },
                  })
                }
                placeholder="Describe how decisions are made within the family"
                rows={4}
              />
            </div>

            <div>
              <Label>Key Family Contacts</Label>
              <Textarea
                value={data.familyDynamics.keyContacts.join('\n')}
                onChange={(e) =>
                  setData({
                    ...data,
                    familyDynamics: {
                      ...data.familyDynamics,
                      keyContacts: e.target.value.split('\n').filter(Boolean),
                    },
                  })
                }
                placeholder="Enter each key contact on a new line (Name - Relationship - Contact)"
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save Assessment</Button>
      </div>
    </div>
  );
}
