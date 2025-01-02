import React, { useState } from 'react';
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Form/input";
import { Badge } from "@/components/ui/Badge/Badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select";

interface ResourceLibraryProps {
  residentId: string;
}

export const ResourceLibrary: React.FC<ResourceLibraryProps> = ({
  residentId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const resourceTypes = ['ALL', 'DOCUMENT', 'INSTRUCTION', 'EDUCATION', 'PROTOCOL'];

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={selectedType}
          onValueChange={setSelectedType}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {resourceTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button>
          Upload New
        </Button>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="space-y-4">
          {/* Mock resources - replace with actual data */}
          <Card className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">Care Instructions - Morning Routine</h3>
                <p className="text-sm text-muted-foreground">Uploaded by Jane Doe • 2 days ago</p>
                <div className="flex gap-2 mt-2">
                  <Badge>Instructions</Badge>
                  <Badge variant="outline">Morning Care</Badge>
                </div>
              </div>
              <Button variant="outline">
                Download
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">Emergency Contact Protocol</h3>
                <p className="text-sm text-muted-foreground">Uploaded by John Smith • 1 week ago</p>
                <div className="flex gap-2 mt-2">
                  <Badge>Protocol</Badge>
                  <Badge variant="outline">Emergency</Badge>
                </div>
              </div>
              <Button variant="outline">
                Download
              </Button>
            </div>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};


