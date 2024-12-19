import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Plus } from 'lucide-react';
import { AssessmentForm } from '../templates/AssessmentForm';
import { AssessmentType } from '../../types/assessment.types';
import { assessmentApi } from '../../api/assessments';

interface NewAssessmentButtonProps {
  residentId: string;
  onAssessmentCreated?: () => void;
}

export const NewAssessmentButton: React.FC<NewAssessmentButtonProps> = ({
  residentId,
  onAssessmentCreated,
}) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: {
    title: string;
    type: AssessmentType;
    dueDate: Date;
    description?: string;
    residentId: string;
  }) => {
    try {
      const response = await assessmentApi.createAssessment({
        ...data,
        residentId,
      });

      if (!response.ok) {
        throw new Error('Failed to create assessment');
      }

      setOpen(false);
      router.refresh();
      onAssessmentCreated?.();
    } catch (error) {
      console.error('Error creating assessment:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Assessment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Assessment</DialogTitle>
        </DialogHeader>
        <AssessmentForm
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};


