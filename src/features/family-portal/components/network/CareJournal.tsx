import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form/textarea";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CareJournalProps {
  residentId: string;
  familyMemberId: string;
}

export const CareJournal: React.FC<CareJournalProps> = ({
  residentId,
  familyMemberId,
}) => {
  const [newEntry, setNewEntry] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const moodEmojis = {
    HAPPY: '😊',
    NEUTRAL: '😐',
    SAD: '😢',
    CONCERNED: '😟',
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex gap-2">
            {Object.entries(moodEmojis).map(([mood, emoji]) => (
              <Button
                key={mood}
                variant={selectedMood === mood ? "default" : "outline"}
                onClick={() => setSelectedMood(mood)}
                className="text-2xl"
              >
                {emoji}
              </Button>
            ))}
          </div>
          <Textarea
            placeholder="Share your observations, updates, or thoughts..."
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-between items-center">
            <Button variant="outline">
              📎 Add Photos
            </Button>
            <Button>
              Post Update
            </Button>
          </div>
        </div>
      </Card>

      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {/* Mock entries - replace with actual data */}
          <Card className="p-4">
            <div className="flex items-start gap-4">
              <Avatar>
                <img src="https://github.com/shadcn.png" alt="Author" />
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Jane Doe</p>
                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                  </div>
                  <span className="text-2xl">😊</span>
                </div>
                <p className="mt-2">Had a great morning walk with mom today. She seemed very energetic and engaged in conversation.</p>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm">👍 5</Button>
                  <Button variant="outline" size="sm">❤️ 3</Button>
                  <Button variant="outline" size="sm">💬 Reply</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};


