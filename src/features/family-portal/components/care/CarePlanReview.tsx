import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { 
  ClipboardList, 
  Target, 
  Calendar,
  FileText,
  MessageSquare,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface CarePlanGoal {
  id: string;
  category: string;
  description: string;
  targetDate: Date;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'needs-review';
  notes: string[];
}

interface CarePlanReview {
  id: string;
  date: Date;
  attendees: string[];
  summary: string;
  recommendations: string[];
  nextReviewDate: Date;
}

interface CarePlanDocument {
  id: string;
  title: string;
  type: string;
  lastUpdated: Date;
  url: string;
}

interface CarePlanReviewProps {
  residentId: string;
}

export const CarePlanReview: React.FC<CarePlanReviewProps> = ({ residentId }) => {
  const [goals, setGoals] = useState<CarePlanGoal[]>([]);
  const [reviews, setReviews] = useState<CarePlanReview[]>([]);
  const [documents, setDocuments] = useState<CarePlanDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<CarePlanDocument | null>(null);

  useEffect(() => {
    fetchCarePlanData();
  }, [residentId]);

  const fetchCarePlanData = async () => {
    try {
      const [goalsRes, reviewsRes, documentsRes] = await Promise.all([
        fetch(`/api/care-plan/${residentId}/goals`),
        fetch(`/api/care-plan/${residentId}/reviews`),
        fetch(`/api/care-plan/${residentId}/documents`)
      ]);

      if (!goalsRes.ok || !reviewsRes.ok || !documentsRes.ok) {
        throw new Error('Failed to fetch care plan data');
      }

      const [goalsData, reviewsData, documentsData] = await Promise.all([
        goalsRes.json(),
        reviewsRes.json(),
        documentsRes.json()
      ]);

      setGoals(goalsData);
      setReviews(reviewsData);
      setDocuments(documentsData);
    } catch (error) {
      console.error('Error fetching care plan data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: CarePlanGoal['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'needs-review':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div>Loading care plan review...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Care Plan Review</h2>
            <p className="text-sm text-muted-foreground">
              Track care goals and progress
            </p>
          </div>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Review
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-500" />
              <h3 className="font-medium">Active Goals</h3>
            </div>
            <p className="text-2xl mt-2">
              {goals.filter(g => g.status === 'in-progress').length}
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <h3 className="font-medium">Completed</h3>
            </div>
            <p className="text-2xl mt-2">
              {goals.filter(g => g.status === 'completed').length}
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <h3 className="font-medium">Next Review</h3>
            </div>
            <p className="text-2xl mt-2">
              {reviews.length > 0 && formatDate(reviews[0].nextReviewDate)}
            </p>
          </Card>
        </div>

        <Accordion type="single" collapsible className="mb-6">
          <AccordionItem value="goals">
            <AccordionTrigger>
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Care Goals</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {goals.map((goal) => (
                    <Card key={goal.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Badge variant={getStatusColor(goal.status)}>
                            {goal.status}
                          </Badge>
                          <h4 className="font-medium mt-1">{goal.category}</h4>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Target: {formatDate(goal.targetDate)}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{goal.description}</p>
                      <Progress value={goal.progress} className="mb-2" />
                      <div className="space-y-1">
                        {goal.notes.map((note, i) => (
                          <p key={i} className="text-sm text-muted-foreground">
                            • {note}
                          </p>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="reviews">
            <AccordionTrigger>
              <div className="flex items-center space-x-2">
                <ClipboardList className="h-5 w-5" />
                <span>Past Reviews</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">
                          Review on {formatDate(review.date)}
                        </h4>
                        <Badge variant="outline">
                          {review.attendees.length} Attendees
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{review.summary}</p>
                      <div className="space-y-1">
                        {review.recommendations.map((rec, i) => (
                          <p key={i} className="text-sm text-muted-foreground">
                            • {rec}
                          </p>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="documents">
            <AccordionTrigger>
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Care Documents</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
                      onClick={() => setSelectedDocument(doc)}
                    >
                      <div>
                        <p className="font-medium">{doc.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.type} • Updated {formatDate(doc.lastUpdated)}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex justify-between items-center">
          <Button variant="outline">
            <MessageSquare className="mr-2 h-4 w-4" />
            Add Note
          </Button>
          <Button variant="outline">Export Care Plan</Button>
        </div>
      </Card>

      {selectedDocument && (
        <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedDocument.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <iframe
                src={selectedDocument.url}
                className="w-full h-[500px]"
                title={selectedDocument.title}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};


