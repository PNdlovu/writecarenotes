import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button/Button';
import { Progress } from '@/components/ui/Progress';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Badge } from '@/components/ui/Badge/Badge';
import { Separator } from '@/components/ui/Separator';
import { Alert, AlertDescription } from '@/components/ui/Alert';

interface Question {
  id: string;
  type: 'multiple_choice' | 'text' | 'rating' | 'checklist';
  question: string;
  required: boolean;
  options?: string[];
  answer?: string | string[];
  score?: number;
}

interface Section {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  completed: boolean;
}

interface AssessmentCompletionProps {
  sections: Section[];
  currentSection: number;
  onSectionChange: (index: number) => void;
  onSaveProgress: () => void;
  onSubmit: () => void;
  onAnswerChange: (sectionId: string, questionId: string, answer: string | string[]) => void;
}

export function AssessmentCompletion({
  sections,
  currentSection,
  onSectionChange,
  onSaveProgress,
  onSubmit,
  onAnswerChange,
}: AssessmentCompletionProps) {
  const totalSections = sections.length;
  const completedSections = sections.filter((s) => s.completed).length;
  const progress = (completedSections / totalSections) * 100;

  const currentSectionData = sections[currentSection];
  const isFirstSection = currentSection === 0;
  const isLastSection = currentSection === sections.length - 1;

  const handleNext = () => {
    if (!isLastSection) {
      onSectionChange(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstSection) {
      onSectionChange(currentSection - 1);
    }
  };

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${question.id}-${index}`}
                  name={question.id}
                  value={option}
                  checked={question.answer === option}
                  onChange={(e) => onAnswerChange(currentSectionData.id, question.id, e.target.value)}
                  className="h-4 w-4 border-gray-300"
                />
                <label
                  htmlFor={`${question.id}-${index}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        );

      case 'text':
        return (
          <textarea
            className="w-full min-h-[100px] p-2 border rounded-md"
            value={question.answer as string || ''}
            onChange={(e) => onAnswerChange(currentSectionData.id, question.id, e.target.value)}
            placeholder="Enter your answer here..."
          />
        );

      case 'rating':
        return (
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                variant={question.answer === rating.toString() ? 'default' : 'outline'}
                size="sm"
                onClick={() => onAnswerChange(currentSectionData.id, question.id, rating.toString())}
              >
                {rating}
              </Button>
            ))}
          </div>
        );

      case 'checklist':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`${question.id}-${index}`}
                  checked={Array.isArray(question.answer) && question.answer.includes(option)}
                  onChange={(e) => {
                    const currentAnswers = Array.isArray(question.answer) ? question.answer : [];
                    const newAnswers = e.target.checked
                      ? [...currentAnswers, option]
                      : currentAnswers.filter((a) => a !== option);
                    onAnswerChange(currentSectionData.id, question.id, newAnswers);
                  }}
                  className="h-4 w-4 border-gray-300 rounded"
                />
                <label
                  htmlFor={`${question.id}-${index}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">Assessment Progress</h2>
            <p className="text-sm text-muted-foreground">
              {completedSections} of {totalSections} sections completed
            </p>
          </div>
          <Button variant="outline" onClick={onSaveProgress}>
            <Save className="h-4 w-4 mr-2" />
            Save Progress
          </Button>
        </div>
        <Progress value={progress} className="h-2" />
      </Card>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{currentSectionData.title}</h3>
              <Badge variant="outline">
                Section {currentSection + 1} of {totalSections}
              </Badge>
            </div>
            {currentSectionData.description && (
              <p className="text-sm text-muted-foreground mb-4">
                {currentSectionData.description}
              </p>
            )}
          </div>

          <Separator />

          <ScrollArea className="h-[calc(100vh-400px)]">
            <div className="space-y-8">
              {currentSectionData.questions.map((question, index) => (
                <div key={question.id} className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="font-medium">
                        {index + 1}. {question.question}
                      </h4>
                      {question.required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    {question.score !== undefined && (
                      <Badge variant="secondary">
                        Score: {question.score}
                      </Badge>
                    )}
                  </div>
                  {renderQuestion(question)}
                </div>
              ))}
            </div>
          </ScrollArea>

          <Separator />

          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstSection}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="flex space-x-2">
              {isLastSection ? (
                <Button onClick={onSubmit} className="bg-green-600 hover:bg-green-700">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Assessment
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={isLastSection}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {currentSectionData.completed && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            This section has been completed. You can review and edit your answers before final submission.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}


