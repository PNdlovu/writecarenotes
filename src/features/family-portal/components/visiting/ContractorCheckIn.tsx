import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/form/textarea";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/form/checkbox";
import { 
  Tool, 
  Wrench, 
  Zap, 
  Flame, 
  HardHat,
  Clipboard,
  AlertTriangle
} from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface ContractorVisit {
  id: string;
  contractorName: string;
  company: string;
  contractorType: string;
  purpose: string;
  workArea: string[];
  expectedDuration: string;
  checkinTime?: Date;
  checkoutTime?: Date;
  status: 'scheduled' | 'checked-in' | 'checked-out' | 'cancelled';
  workPermit?: {
    type: string;
    number: string;
    validUntil: Date;
  };
  riskAssessment?: {
    completed: boolean;
    notes: string;
  };
  documents: {
    type: string;
    url: string;
    verified: boolean;
  }[];
}

const contractorTypes = [
  { value: 'electrician', label: 'Electrician', icon: Zap },
  { value: 'plumber', label: 'Plumber', icon: Wrench },
  { value: 'gas_engineer', label: 'Gas Engineer', icon: Flame },
  { value: 'maintenance', label: 'General Maintenance', icon: Tool },
  { value: 'construction', label: 'Construction', icon: HardHat },
] as const;

const formSchema = z.object({
  contractorName: z.string().min(2, "Name is required"),
  company: z.string().min(2, "Company name is required"),
  contractorType: z.string(),
  purpose: z.string().min(10, "Please provide detailed purpose of visit"),
  workArea: z.array(z.string()).min(1, "Select at least one work area"),
  expectedDuration: z.string(),
  workPermit: z.object({
    type: z.string(),
    number: z.string(),
    validUntil: z.date()
  }).optional(),
  riskAssessment: z.object({
    completed: z.boolean(),
    notes: z.string()
  }),
  documents: z.array(z.object({
    type: z.string(),
    url: z.string(),
    verified: z.boolean()
  }))
});

export const ContractorCheckIn: React.FC = () => {
  const [visits, setVisits] = useState<ContractorVisit[]>([]);
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workArea: [],
      riskAssessment: {
        completed: false,
        notes: ""
      },
      documents: []
    }
  });

  useEffect(() => {
    fetchContractorVisits();
  }, []);

  const fetchContractorVisits = async () => {
    try {
      const response = await fetch('/api/contractor-visits');
      if (!response.ok) throw new Error('Failed to fetch contractor visits');
      const data = await response.json();
      setVisits(data);
    } catch (error) {
      console.error('Error fetching contractor visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (data: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch('/api/contractor-visits/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to check in contractor');

      setShowCheckInDialog(false);
      form.reset();
      fetchContractorVisits();
    } catch (error) {
      console.error('Error checking in contractor:', error);
    }
  };

  const handleCheckOut = async (visitId: string) => {
    try {
      const response = await fetch(`/api/contractor-visits/${visitId}/check-out`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to check out contractor');

      fetchContractorVisits();
    } catch (error) {
      console.error('Error checking out contractor:', error);
    }
  };

  const getContractorIcon = (type: string) => {
    const contractorType = contractorTypes.find(t => t.value === type);
    const Icon = contractorType?.icon || Tool;
    return <Icon className="h-4 w-4" />;
  };

  if (loading) {
    return <div>Loading contractor check-in...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Contractor Check-In</h2>
            <p className="text-sm text-muted-foreground">
              Manage contractor and maintenance visits
            </p>
          </div>
          <Button onClick={() => setShowCheckInDialog(true)}>
            <HardHat className="mr-2 h-4 w-4" />
            New Contractor Check-In
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contractor</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Work Area</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visits.map((visit) => (
              <TableRow key={visit.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{visit.contractorName}</p>
                    <p className="text-sm text-muted-foreground">
                      {visit.company}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getContractorIcon(visit.contractorType)}
                    <span>{visit.contractorType}</span>
                  </div>
                </TableCell>
                <TableCell>{visit.purpose}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {visit.workArea.map((area, i) => (
                      <Badge key={i} variant="outline">{area}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      visit.status === 'checked-in'
                        ? 'success'
                        : visit.status === 'checked-out'
                        ? 'secondary'
                        : 'default'
                    }
                  >
                    {visit.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {visit.status === 'checked-in' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCheckOut(visit.id)}
                    >
                      Check Out
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contractor Check-In</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCheckIn)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contractorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contractor Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="contractorType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contractor Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contractor type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contractorTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center space-x-2">
                              <type.icon className="h-4 w-4" />
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose of Visit</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe the work to be carried out..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="riskAssessment.completed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Risk Assessment Completed
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCheckInDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Complete Check-In
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};


