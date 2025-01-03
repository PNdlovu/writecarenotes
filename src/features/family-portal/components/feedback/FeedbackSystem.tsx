import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Textarea } from "@/components/ui/Form/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog/Dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select";
import { 
  MessageSquare,
  Star,
  ThumbsUp,
  AlertTriangle,
  Send
} from 'lucide-react';

interface Feedback {
  id: string;
  type: 'appreciation' | 'suggestion' | 'concern';
  category: string;
  message: string;
  rating?: number;
  status: 'submitted' | 'in-review' | 'addressed' | 'closed';
  response?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface StaffAppreciation {
  staffId: string;
  staffName: string;
  department: string;
  message: string;
  createdAt: Date;
}

interface FeedbackSystemProps {
  residentId: string;
}

export const FeedbackSystem: React.FC<FeedbackSystemProps> = ({ residentId }) => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [appreciations, setAppreciations] = useState<StaffAppreciation[]>([]);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [showAppreciationDialog, setShowAppreciationDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [feedbackType, setFeedbackType] = useState<Feedback['type']>('suggestion');
  const [feedbackCategory, setFeedbackCategory] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackRating, setFeedbackRating] = useState<number>(5);

  useEffect(() => {
    fetchFeedbackData();
  }, [residentId]);

  const fetchFeedbackData = async () => {
    try {
      const [feedbackRes, appreciationsRes] = await Promise.all([
        fetch(`/api/feedback/${residentId}`),
        fetch(`/api/feedback/${residentId}/appreciations`)
      ]);

      if (!feedbackRes.ok || !appreciationsRes.ok) {
        throw new Error('Failed to fetch feedback data');
      }

      const [feedbackData, appreciationsData] = await Promise.all([
        feedbackRes.json(),
        appreciationsRes.json()
      ]);

      setFeedback(feedbackData);
      setAppreciations(appreciationsData);
    } catch (error) {
      console.error('Error fetching feedback data:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async () => {
    try {
      const response = await fetch(`/api/feedback/${residentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: feedbackType,
          category: feedbackCategory,
          message: feedbackMessage,
          rating: feedbackRating,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit feedback');

      setShowFeedbackDialog(false);
      resetFeedbackForm();
      fetchFeedbackData();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const submitAppreciation = async (staffId: string, message: string) => {
    try {
      const response = await fetch(`/api/feedback/${residentId}/appreciation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId,
          message,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit appreciation');

      setShowAppreciationDialog(false);
      fetchFeedbackData();
    } catch (error) {
      console.error('Error submitting appreciation:', error);
    }
  };

  const resetFeedbackForm = () => {
    setFeedbackType('suggestion');
    setFeedbackCategory('');
    setFeedbackMessage('');
    setFeedbackRating(5);
  };

  const getStatusColor = (status: Feedback['status']) => {
    switch (status) {
      case 'addressed':
        return 'success';
      case 'in-review':
        return 'warning';
      case 'closed':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return <div>Loading feedback system...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Feedback & Appreciation</h2>
            <p className="text-sm text-muted-foreground">
              Share your thoughts and recognize great care
            </p>
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowAppreciationDialog(true)}
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              Appreciate Staff
            </Button>
            <Button onClick={() => setShowFeedbackDialog(true)}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Give Feedback
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-4">Recent Feedback</h3>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {feedback.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Badge variant={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        <h4 className="font-medium mt-1">{item.category}</h4>
                      </div>
                      <Badge variant="outline">{item.type}</Badge>
                    </div>
                    <p className="text-sm mb-2">{item.message}</p>
                    {item.rating && (
                      <div className="flex items-center space-x-1 mb-2">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    )}
                    {item.response && (
                      <div className="bg-muted p-2 rounded-md mt-2">
                        <p className="text-sm">{item.response}</p>
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground mt-2">
                      Submitted on {formatDate(item.createdAt)}
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div>
            <h3 className="font-medium mb-4">Staff Appreciation</h3>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {appreciations.map((item) => (
                  <Card key={item.staffId} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{item.staffName}</h4>
                      <Badge variant="outline">{item.department}</Badge>
                    </div>
                    <p className="text-sm mb-2">{item.message}</p>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </Card>

      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Type of Feedback</label>
              <Select
                value={feedbackType}
                onValueChange={(value: Feedback['type']) => setFeedbackType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appreciation">Appreciation</SelectItem>
                  <SelectItem value="suggestion">Suggestion</SelectItem>
                  <SelectItem value="concern">Concern</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Category</label>
              <Select
                value={feedbackCategory}
                onValueChange={setFeedbackCategory}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="care">Care Quality</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="facilities">Facilities</SelectItem>
                  <SelectItem value="activities">Activities</SelectItem>
                  <SelectItem value="meals">Meals</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Your Message</label>
              <Textarea
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="Please share your thoughts..."
                rows={4}
              />
            </div>

            {feedbackType === 'appreciation' && (
              <div>
                <label className="text-sm font-medium">Rating</label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Star
                      key={rating}
                      className={`h-6 w-6 cursor-pointer ${
                        rating <= feedbackRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                      onClick={() => setFeedbackRating(rating)}
                    />
                  ))}
                </div>
              </div>
            )}

            <Button onClick={submitFeedback} className="w-full">
              <Send className="mr-2 h-4 w-4" />
              Submit Feedback
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showAppreciationDialog}
        onOpenChange={setShowAppreciationDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appreciate Staff Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Staff Member</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a staff member" />
                </SelectTrigger>
                <SelectContent>
                  {/* Staff members would be populated here */}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Your Message</label>
              <Textarea
                placeholder="Share what you appreciate about this staff member..."
                rows={4}
              />
            </div>

            <Button className="w-full">
              <ThumbsUp className="mr-2 h-4 w-4" />
              Send Appreciation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};


