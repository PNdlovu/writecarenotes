import { useState } from 'react';
import { EmergencyProtocol, RichMediaDocumentation } from '../../types/clinical.types';
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
import { Badge } from '@/components/ui/Badge';

interface EmergencyAssessmentFormProps {
  initialData?: EmergencyProtocol;
  onSave: (data: EmergencyProtocol) => void;
  onCancel: () => void;
  onMediaUpload: (files: FileList, type: keyof RichMediaDocumentation) => Promise<string[]>;
}

const EMERGENCY_TYPES = [
  'Medical Emergency',
  'Fall',
  'Behavioral Crisis',
  'Missing Person',
  'Environmental Hazard',
  'Medication Incident',
  'Other',
] as const;

const SEVERITY_LEVELS = ['Critical', 'High', 'Medium', 'Low'] as const;

export function EmergencyAssessmentForm({
  initialData,
  onSave,
  onCancel,
  onMediaUpload,
}: EmergencyAssessmentFormProps) {
  const [data, setData] = useState<EmergencyProtocol>(
    initialData || {
      type: '',
      severity: 'Medium',
      immediateActions: [],
      notificationList: [],
      documentation: {
        photos: [],
        videos: [],
        voiceNotes: [],
      },
      followUpRequired: false,
    }
  );

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMediaUpload = async (files: FileList, type: keyof RichMediaDocumentation) => {
    try {
      setIsUploading(true);
      setError(null);
      const urls = await onMediaUpload(files, type);
      
      const newMedia = urls.map((url) => ({
        id: Math.random().toString(36).substr(2, 9),
        url,
        type: files[0]?.type || '',
        description: '',
        timestamp: new Date(),
        ...(type === 'videos' ? { duration: 0 } : {}),
        ...(type === 'voiceNotes' ? { duration: 0, transcript: '' } : {}),
      }));

      setData({
        ...data,
        documentation: {
          ...data.documentation,
          [type]: [...data.documentation[type], ...newMedia],
        },
      });
    } catch (err) {
      setError('Failed to upload media. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeMedia = (type: keyof RichMediaDocumentation, id: string) => {
    setData({
      ...data,
      documentation: {
        ...data.documentation,
        [type]: data.documentation[type].filter((item) => item.id !== id),
      },
    });
  };

  const updateMediaDescription = (
    type: keyof RichMediaDocumentation,
    id: string,
    description: string
  ) => {
    setData({
      ...data,
      documentation: {
        ...data.documentation,
        [type]: data.documentation[type].map((item) =>
          item.id === id ? { ...item, description } : item
        ),
      },
    });
  };

  const validate = (): boolean => {
    if (!data.type) {
      setError('Emergency type is required');
      return false;
    }
    if (data.immediateActions.length === 0) {
      setError('At least one immediate action is required');
      return false;
    }
    if (data.notificationList.length === 0) {
      setError('At least one notification contact is required');
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
          <h3 className="text-lg font-semibold">Emergency Details</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Emergency Type</Label>
              <Select
                value={data.type}
                onValueChange={(value) => setData({ ...data, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select emergency type" />
                </SelectTrigger>
                <SelectContent>
                  {EMERGENCY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Severity Level</Label>
              <Select
                value={data.severity}
                onValueChange={(value: typeof SEVERITY_LEVELS[number]) =>
                  setData({ ...data, severity: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select severity level" />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITY_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      <div className="flex items-center">
                        <Badge
                          variant={
                            level === 'Critical'
                              ? 'destructive'
                              : level === 'High'
                              ? 'warning'
                              : level === 'Medium'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {level}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Immediate Actions Taken</Label>
              <Textarea
                value={data.immediateActions.join('\n')}
                onChange={(e) =>
                  setData({
                    ...data,
                    immediateActions: e.target.value.split('\n').filter(Boolean),
                  })
                }
                placeholder="Enter each action on a new line"
                rows={4}
              />
            </div>

            <div>
              <Label>Notification List</Label>
              <Textarea
                value={data.notificationList.join('\n')}
                onChange={(e) =>
                  setData({
                    ...data,
                    notificationList: e.target.value.split('\n').filter(Boolean),
                  })
                }
                placeholder="Enter each contact on a new line (Name - Role - Contact)"
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Documentation</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label>Photos</Label>
              <div className="mt-2 space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) =>
                    e.target.files && handleMediaUpload(e.target.files, 'photos')
                  }
                  disabled={isUploading}
                />
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {data.documentation.photos.map((photo) => (
                    <div key={photo.id} className="relative">
                      <img
                        src={photo.url}
                        alt={photo.description}
                        className="w-full h-40 object-cover rounded"
                      />
                      <Input
                        value={photo.description}
                        onChange={(e) =>
                          updateMediaDescription('photos', photo.id, e.target.value)
                        }
                        placeholder="Add description"
                        className="mt-2"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => removeMedia('photos', photo.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label>Videos</Label>
              <div className="mt-2 space-y-2">
                <Input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={(e) =>
                    e.target.files && handleMediaUpload(e.target.files, 'videos')
                  }
                  disabled={isUploading}
                />
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {data.documentation.videos.map((video) => (
                    <div key={video.id} className="relative">
                      <video
                        src={video.url}
                        controls
                        className="w-full rounded"
                      />
                      <Input
                        value={video.description}
                        onChange={(e) =>
                          updateMediaDescription('videos', video.id, e.target.value)
                        }
                        placeholder="Add description"
                        className="mt-2"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => removeMedia('videos', video.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label>Voice Notes</Label>
              <div className="mt-2 space-y-2">
                <Input
                  type="file"
                  accept="audio/*"
                  multiple
                  onChange={(e) =>
                    e.target.files && handleMediaUpload(e.target.files, 'voiceNotes')
                  }
                  disabled={isUploading}
                />
                <div className="space-y-4 mt-4">
                  {data.documentation.voiceNotes.map((note) => (
                    <div key={note.id} className="relative">
                      <audio src={note.url} controls className="w-full" />
                      <Input
                        value={note.description}
                        onChange={(e) =>
                          updateMediaDescription('voiceNotes', note.id, e.target.value)
                        }
                        placeholder="Add description"
                        className="mt-2"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => removeMedia('voiceNotes', note.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Follow-up</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={data.followUpRequired}
              onChange={(e) =>
                setData({ ...data, followUpRequired: e.target.checked })
              }
              className="rounded border-gray-300"
            />
            <Label>Follow-up Required</Label>
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
        <Button onClick={handleSave} disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Save Assessment'}
        </Button>
      </div>
    </div>
  );
}
