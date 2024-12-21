import React, { useState } from 'react';
import { format } from 'date-fns';
import { useResidentTranslation } from '@/features/i18n/hooks';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { Resident } from '../../types/resident.types';
import type { DoLS, DoLSAssessment, DoLSReview } from '../../types/dols.types';

interface DoLSManagerProps {
  resident: Resident;
  dolsList: DoLS[];
  onAddDoLS: (dols: Omit<DoLS, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateDoLS: (id: string, updates: Partial<DoLS>) => void;
  onAddAssessment: (dolsId: string, assessment: Omit<DoLSAssessment, 'id'>) => void;
  onAddReview: (dolsId: string, review: Omit<DoLSReview, 'id'>) => void;
  onUploadDocument: (dolsId: string, file: File) => Promise<void>;
  loading?: boolean;
}

export const DoLSManager: React.FC<DoLSManagerProps> = ({
  resident,
  dolsList,
  onAddDoLS,
  onUpdateDoLS,
  onAddAssessment,
  onAddReview,
  onUploadDocument,
  loading = false,
}) => {
  const { t } = useResidentTranslation();
  const [isAddingDoLS, setIsAddingDoLS] = useState(false);
  const [selectedDoLS, setSelectedDoLS] = useState<DoLS | null>(null);
  const [activeTab, setActiveTab] = useState('current');

  const getStatusBadgeVariant = (status: DoLS['status']) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      PENDING: 'secondary',
      ACTIVE: 'default',
      EXPIRED: 'destructive',
      WITHDRAWN: 'outline',
      REJECTED: 'destructive',
      REVIEW_REQUIRED: 'secondary',
      UNDER_REVIEW: 'default'
    };
    return variants[status] || 'default';
  };

  const handleRequestReview = (dols: DoLS) => {
    if (confirm('Are you sure you want to request a review of this DoLS?')) {
      onUpdateDoLS(dols.id, { status: 'REVIEW_REQUIRED' });
    }
  };

  const handleAddDoLS = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values = Object.fromEntries(formData.entries());
    
    onAddDoLS({
      residentId: resident.id,
      type: values.type as DoLS['type'],
      urgency: values.urgency as DoLS['urgency'],
      supervisingBody: values.supervisingBody as string,
      startDate: new Date(values.startDate as string),
      endDate: new Date(values.endDate as string),
      conditions: values.conditions ? (values.conditions as string).split('\n') : [],
      status: 'PENDING',
      assessments: [],
      reviews: [],
      documents: [],
    });
    
    setIsAddingDoLS(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>DoLS Management</CardTitle>
          <Button onClick={() => setIsAddingDoLS(true)}>
            Add New DoLS
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="current">Current DoLS</TabsTrigger>
              <TabsTrigger value="historical">Historical DoLS</TabsTrigger>
            </TabsList>
            <TabsContent value="current">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Supervising Body</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dolsList
                    .filter(d => d.status === 'ACTIVE' || d.status === 'PENDING')
                    .map((dols) => (
                      <TableRow key={dols.id}>
                        <TableCell>{dols.type.replace('_', ' ')}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(dols.status)}>
                            {dols.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm">Start: {format(dols.startDate, 'PPP')}</p>
                            <p className="text-sm text-muted-foreground">End: {format(dols.endDate, 'PPP')}</p>
                          </div>
                        </TableCell>
                        <TableCell>{dols.supervisingBody}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedDoLS(dols)}
                            >
                              View
                            </Button>
                            {dols.status === 'ACTIVE' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRequestReview(dols)}
                              >
                                Review
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="historical">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Supervising Body</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dolsList
                    .filter(d => ['EXPIRED', 'WITHDRAWN', 'REJECTED'].includes(d.status))
                    .map((dols) => (
                      <TableRow key={dols.id}>
                        <TableCell>{dols.type.replace('_', ' ')}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(dols.status)}>
                            {dols.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm">Start: {format(dols.startDate, 'PPP')}</p>
                            <p className="text-sm text-muted-foreground">End: {format(dols.endDate, 'PPP')}</p>
                          </div>
                        </TableCell>
                        <TableCell>{dols.supervisingBody}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDoLS(dols)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add DoLS Dialog */}
      <Dialog open={isAddingDoLS} onOpenChange={setIsAddingDoLS}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Add New DoLS</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddDoLS} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">DoLS Type</Label>
              <Select name="type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STANDARD_AUTHORISATION">Standard Authorisation</SelectItem>
                  <SelectItem value="URGENT_AUTHORISATION">Urgent Authorisation</SelectItem>
                  <SelectItem value="COURT_ORDER">Court Order</SelectItem>
                  <SelectItem value="EXTENSION_REQUEST">Extension Request</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency</Label>
              <Select name="urgency" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STANDARD">Standard</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supervisingBody">Supervising Body</Label>
              <Input
                id="supervisingBody"
                name="supervisingBody"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  type="date"
                  id="startDate"
                  name="startDate"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  type="date"
                  id="endDate"
                  name="endDate"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="conditions">Conditions</Label>
              <Textarea
                id="conditions"
                name="conditions"
                placeholder="Enter each condition on a new line"
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddingDoLS(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Add DoLS
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DoLS Details Dialog */}
      <Dialog open={!!selectedDoLS} onOpenChange={(open) => !open && setSelectedDoLS(null)}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>DoLS Details</DialogTitle>
          </DialogHeader>
          {selectedDoLS && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="assessments">Assessments</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Type:</div>
                    <div>{selectedDoLS.type.replace('_', ' ')}</div>
                    <div>Status:</div>
                    <div>
                      <Badge variant={getStatusBadgeVariant(selectedDoLS.status)}>
                        {selectedDoLS.status}
                      </Badge>
                    </div>
                    <div>Urgency:</div>
                    <div>{selectedDoLS.urgency}</div>
                    <div>Supervising Body:</div>
                    <div>{selectedDoLS.supervisingBody}</div>
                    <div>Start Date:</div>
                    <div>{format(selectedDoLS.startDate, 'PPP')}</div>
                    <div>End Date:</div>
                    <div>{format(selectedDoLS.endDate, 'PPP')}</div>
                  </div>
                </div>

                {selectedDoLS.conditions && selectedDoLS.conditions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Conditions</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {selectedDoLS.conditions.map((condition, index) => (
                        <li key={index} className="text-sm">{condition}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedDoLS.representative && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Representative</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Name:</div>
                      <div>{selectedDoLS.representative.name}</div>
                      <div>Type:</div>
                      <div>{selectedDoLS.representative.type}</div>
                      {selectedDoLS.representative.relationship && (
                        <>
                          <div>Relationship:</div>
                          <div>{selectedDoLS.representative.relationship}</div>
                        </>
                      )}
                    </div>
                    <div className="mt-2">
                      <h5 className="text-sm font-medium">Contact Details</h5>
                      <div className="pl-4 mt-1 space-y-1 text-sm">
                        <p>Phone: {selectedDoLS.representative.contactDetails.phone}</p>
                        {selectedDoLS.representative.contactDetails.email && (
                          <p>Email: {selectedDoLS.representative.contactDetails.email}</p>
                        )}
                        <p>Address: {selectedDoLS.representative.contactDetails.address}</p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="assessments" className="space-y-4">
                <ScrollArea className="h-[400px] pr-4">
                  {selectedDoLS.assessments.map((assessment, index) => (
                    <div key={assessment.id} className="mb-4">
                      <div className="flex items-center space-x-2">
                        <Badge variant={assessment.outcome === 'PASSED' ? 'default' : 'destructive'}>
                          {assessment.outcome}
                        </Badge>
                        <h4 className="font-medium">{assessment.type.replace('_', ' ')} Assessment</h4>
                      </div>
                      <div className="mt-2 space-y-1 text-sm">
                        <p>Date: {format(assessment.date, 'PPP')}</p>
                        <p>Assessor: {assessment.assessor.name} ({assessment.assessor.role})</p>
                        {assessment.recommendations && (
                          <p>Recommendations: {assessment.recommendations}</p>
                        )}
                      </div>
                      {index < selectedDoLS.assessments.length - 1 && <Separator className="my-4" />}
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                <ScrollArea className="h-[400px] pr-4">
                  {selectedDoLS.reviews.map((review, index) => (
                    <div key={review.id} className="mb-4">
                      <div className="flex items-center space-x-2">
                        <Badge variant={review.outcome === 'MAINTAINED' ? 'default' : 'secondary'}>
                          {review.outcome}
                        </Badge>
                        <h4 className="font-medium">{review.reviewType} Review</h4>
                      </div>
                      <div className="mt-2 space-y-1 text-sm">
                        <p>Date: {format(review.reviewDate, 'PPP')}</p>
                        <p>Reviewer: {review.reviewer.name} ({review.reviewer.role})</p>
                        {review.changes && (
                          <p>Changes: {review.changes}</p>
                        )}
                        <p>Next Review: {format(review.nextReviewDate, 'PPP')}</p>
                      </div>
                      {index < selectedDoLS.reviews.length - 1 && <Separator className="my-4" />}
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
