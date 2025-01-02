import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog/Dialog";
import { Textarea } from "@/components/ui/Form/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select";
import { Utensils, AlertCircle } from 'lucide-react';

interface Meal {
  id: string;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  menu: string[];
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  dietaryTags: string[];
  feedback?: string;
}

interface DietaryPreference {
  type: string;
  description: string;
  restrictions: string[];
  allergies: string[];
  preferences: string[];
}

interface MealPlanningProps {
  residentId: string;
}

export const MealPlanning: React.FC<MealPlanningProps> = ({ residentId }) => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [dietaryPrefs, setDietaryPrefs] = useState<DietaryPreference | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    fetchMeals();
    fetchDietaryPreferences();
  }, [residentId, selectedDate]);

  const fetchMeals = async () => {
    try {
      const response = await fetch(
        `/api/meals/${residentId}?date=${selectedDate.toISOString()}`
      );
      if (!response.ok) throw new Error('Failed to fetch meals');
      const data = await response.json();
      setMeals(data);
    } catch (error) {
      console.error('Error fetching meals:', error);
    }
  };

  const fetchDietaryPreferences = async () => {
    try {
      const response = await fetch(`/api/dietary-preferences/${residentId}`);
      if (!response.ok) throw new Error('Failed to fetch dietary preferences');
      const data = await response.json();
      setDietaryPrefs(data);
    } catch (error) {
      console.error('Error fetching dietary preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async () => {
    if (!selectedMeal) return;

    try {
      await fetch(`/api/meals/${selectedMeal.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });
      
      setShowFeedbackDialog(false);
      setFeedback("");
      fetchMeals(); // Refresh meals to show updated feedback
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const submitSpecialRequest = async (request: string) => {
    try {
      await fetch(`/api/meals/${residentId}/special-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request }),
      });
    } catch (error) {
      console.error('Error submitting special request:', error);
    }
  };

  if (loading) {
    return <div>Loading meal planning...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Meal Planning</h2>
            <p className="text-sm text-muted-foreground">
              View menus and dietary information
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowFeedbackDialog(true)}>
            <Utensils className="mr-2 h-4 w-4" />
            Special Request
          </Button>
        </div>

        {dietaryPrefs && (
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">Dietary Profile</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Restrictions</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {dietaryPrefs.restrictions.map((restriction, i) => (
                    <Badge key={i} variant="secondary">{restriction}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Allergies</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {dietaryPrefs.allergies.map((allergy, i) => (
                    <Badge key={i} variant="destructive">{allergy}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Menu</TableHead>
                <TableHead>Nutrition</TableHead>
                <TableHead>Dietary Tags</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meals.map((meal) => (
                <TableRow key={meal.id}>
                  <TableCell className="font-medium">
                    {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
                  </TableCell>
                  <TableCell>
                    <ul className="list-disc list-inside">
                      {meal.menu.map((item, i) => (
                        <li key={i} className="text-sm">{item}</li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>Calories: {meal.nutritionalInfo.calories}</p>
                      <p>Protein: {meal.nutritionalInfo.protein}g</p>
                      <p>Carbs: {meal.nutritionalInfo.carbs}g</p>
                      <p>Fat: {meal.nutritionalInfo.fat}g</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {meal.dietaryTags.map((tag, i) => (
                        <Badge key={i} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedMeal(meal);
                        setShowFeedbackDialog(true);
                      }}
                    >
                      Feedback
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedMeal ? 'Meal Feedback' : 'Special Meal Request'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder={
                selectedMeal
                  ? "How was your meal? Any comments or suggestions?"
                  : "Describe your special meal request..."
              }
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <Button
              onClick={() => {
                if (selectedMeal) {
                  submitFeedback();
                } else {
                  submitSpecialRequest(feedback);
                }
              }}
            >
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};


