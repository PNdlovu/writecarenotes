import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Form/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog/Dialog";
import { Textarea } from "@/components/ui/Form/textarea";
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
import { Checkbox } from "@/components/ui/Form/checkbox";
import { 
  ClipboardCheck,
  UserCheck,
  Building2,
  Stethoscope,
  Scale,
  FileCheck,
  Shield,
  AlertTriangle,
  Users,
  BadgeCheck
} from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface ProfessionalVisit {
  id: string;
  visitorName: string;
  organization: string;
  visitorType: string;
  purpose: string;
  badgeId: string;
  expectedDuration: string;
  checkinTime?: Date;
  checkoutTime?: Date;
  status: 'scheduled' | 'checked-in' | 'checked-out' | 'cancelled';
  credentials: {
    type: string;
    number: string;
    validUntil: Date;
    verified: boolean;
  };
  visitAreas: string[];
  confidentiality: boolean;
  requiresAccess: string[];
  notes?: string;
}

const regulatoryBodies = {
  england: {
    name: 'England',
    inspectors: [
      { 
        value: 'cqc_inspector', 
        label: 'CQC Inspector',
        icon: ClipboardCheck,
        requiresVerification: true,
        organization: 'Care Quality Commission'
      },
      {
        value: 'ofsted_inspector',
        label: 'Ofsted Inspector',
        icon: FileCheck,
        requiresVerification: true,
        organization: 'Ofsted'
      }
    ]
  },
  scotland: {
    name: 'Scotland',
    inspectors: [
      {
        value: 'care_inspectorate_scotland',
        label: 'Care Inspectorate Scotland',
        icon: ClipboardCheck,
        requiresVerification: true,
        organization: 'Care Inspectorate Scotland'
      },
      {
        value: 'sssc_inspector',
        label: 'SSSC Inspector',
        icon: Shield,
        requiresVerification: true,
        organization: 'Scottish Social Services Council'
      }
    ]
  },
  wales: {
    name: 'Wales',
    inspectors: [
      {
        value: 'ciw_inspector',
        label: 'CIW Inspector',
        icon: ClipboardCheck,
        requiresVerification: true,
        organization: 'Care Inspectorate Wales'
      },
      {
        value: 'scw_inspector',
        label: 'SCW Inspector',
        icon: Shield,
        requiresVerification: true,
        organization: 'Social Care Wales'
      }
    ]
  },
  northernIreland: {
    name: 'Northern Ireland',
    inspectors: [
      {
        value: 'rqia_inspector',
        label: 'RQIA Inspector',
        icon: ClipboardCheck,
        requiresVerification: true,
        organization: 'Regulation and Quality Improvement Authority'
      },
      {
        value: 'niscc_inspector',
        label: 'NISCC Inspector',
        icon: Shield,
        requiresVerification: true,
        organization: 'Northern Ireland Social Care Council'
      }
    ]
  },
  ireland: {
    name: 'Republic of Ireland',
    inspectors: [
      {
        value: 'hiqa_inspector',
        label: 'HIQA Inspector',
        icon: ClipboardCheck,
        requiresVerification: true,
        organization: 'Health Information and Quality Authority'
      },
      {
        value: 'coru_inspector',
        label: 'CORU Inspector',
        icon: Shield,
        requiresVerification: true,
        organization: 'Health and Social Care Professionals Council'
      }
    ]
  }
};

const professionalTypes = [
  ...Object.values(regulatoryBodies).flatMap(region => region.inspectors),
  { 
    value: 'social_worker', 
    label: 'Social Worker',
    icon: Users,
    requiresVerification: true,
    organization: 'Local Authority'
  },
  { 
    value: 'healthcare_professional', 
    label: 'Healthcare Professional',
    icon: Stethoscope,
    requiresVerification: true,
    organization: 'NHS/HSE'
  },
  { 
    value: 'safeguarding_team', 
    label: 'Safeguarding Team',
    icon: Shield,
    requiresVerification: true,
    organization: 'Local Authority'
  },
  { 
    value: 'quality_assessor', 
    label: 'Quality Assessor',
    icon: Scale,
    requiresVerification: true,
    organization: 'Independent'
  }
] as const;

const formSchema = z.object({
  visitorName: z.string().min(2, "Name is required"),
  organization: z.string().min(2, "Organization is required"),
  visitorType: z.string(),
  purpose: z.string().min(10, "Please provide detailed purpose of visit"),
  badgeId: z.string().min(2, "Official ID/Badge number is required"),
  expectedDuration: z.string(),
  credentials: z.object({
    type: z.string(),
    number: z.string(),
    validUntil: z.date(),
    verified: z.boolean()
  }),
  visitAreas: z.array(z.string()).min(1, "Select at least one area to visit"),
  confidentiality: z.boolean(),
  requiresAccess: z.array(z.string()),
  notes: z.string().optional()
});

export const ProfessionalVisitorCheckIn: React.FC = () => {
  const [visits, setVisits] = useState<ProfessionalVisit[]>([]);
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'failed'>('pending');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      visitAreas: [],
      confidentiality: false,
      requiresAccess: [],
      credentials: {
        type: '',
        number: '',
        verified: false,
        validUntil: new Date()
      }
    }
  });

  useEffect(() => {
    fetchProfessionalVisits();
  }, []);

  const fetchProfessionalVisits = async () => {
    try {
      const response = await fetch('/api/professional-visits');
      if (!response.ok) throw new Error('Failed to fetch professional visits');
      const data = await response.json();
      setVisits(data);
    } catch (error) {
      console.error('Error fetching professional visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyCredentials = async (credentials: typeof formSchema.shape.credentials) => {
    try {
      const visitorType = form.getValues('visitorType');
      const verificationEndpoint = getVerificationEndpoint(visitorType);
      
      const response = await fetch(verificationEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...credentials,
          visitorType,
          organization: form.getValues('organization')
        }),
      });

      if (!response.ok) throw new Error('Credential verification failed');

      const result = await response.json();
      setVerificationStatus(result.verified ? 'verified' : 'failed');
      return result.verified;
    } catch (error) {
      console.error('Error verifying credentials:', error);
      setVerificationStatus('failed');
      return false;
    }
  };

  const getVerificationEndpoint = (visitorType: string): string => {
    const endpoints: Record<string, string> = {
      cqc_inspector: '/api/verify/cqc',
      ofsted_inspector: '/api/verify/ofsted',
      care_inspectorate_scotland: '/api/verify/care-inspectorate-scotland',
      sssc_inspector: '/api/verify/sssc',
      ciw_inspector: '/api/verify/ciw',
      scw_inspector: '/api/verify/scw',
      rqia_inspector: '/api/verify/rqia',
      niscc_inspector: '/api/verify/niscc',
      hiqa_inspector: '/api/verify/hiqa',
      coru_inspector: '/api/verify/coru',
      default: '/api/verify/professional'
    };

    return endpoints[visitorType] || endpoints.default;
  };

  const handleCheckIn = async (data: z.infer<typeof formSchema>) => {
    try {
      // First verify credentials
      const isVerified = await verifyCredentials(data.credentials);
      if (!isVerified) {
        throw new Error('Credential verification failed');
      }

      const response = await fetch('/api/professional-visits/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to check in professional visitor');

      setShowCheckInDialog(false);
      form.reset();
      fetchProfessionalVisits();
    } catch (error) {
      console.error('Error checking in professional visitor:', error);
    }
  };

  const handleCheckOut = async (visitId: string) => {
    try {
      const response = await fetch(`/api/professional-visits/${visitId}/check-out`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to check out professional visitor');

      fetchProfessionalVisits();
    } catch (error) {
      console.error('Error checking out professional visitor:', error);
    }
  };

  const getProfessionalIcon = (type: string) => {
    const professionalType = professionalTypes.find(t => t.value === type);
    const Icon = professionalType?.icon || UserCheck;
    return <Icon className="h-4 w-4" />;
  };

  useEffect(() => {
    const selectedType = form.getValues('visitorType');
    const inspector = professionalTypes.find(t => t.value === selectedType);
    if (inspector) {
      form.setValue('organization', inspector.organization);
    }
  }, [form.watch('visitorType')]);

  if (loading) {
    return <div>Loading professional visitor check-in...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Professional Visitor Check-In</h2>
            <p className="text-sm text-muted-foreground">
              Manage regulatory and healthcare professional visits
            </p>
          </div>
          <Button onClick={() => setShowCheckInDialog(true)}>
            <BadgeCheck className="mr-2 h-4 w-4" />
            New Professional Check-In
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Visitor</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visits.map((visit) => (
              <TableRow key={visit.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{visit.visitorName}</p>
                    <p className="text-sm text-muted-foreground">
                      Badge: {visit.badgeId}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getProfessionalIcon(visit.visitorType)}
                    <span>{visit.visitorType.replace('_', ' ')}</span>
                  </div>
                </TableCell>
                <TableCell>{visit.organization}</TableCell>
                <TableCell>{visit.purpose}</TableCell>
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
            <DialogTitle>Professional Visitor Check-In</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCheckIn)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="visitorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visitor Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="organization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization</FormLabel>
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
                name="visitorType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visitor Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visitor type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(regulatoryBodies).map(([region, data]) => (
                          <div key={region}>
                            <div className="px-2 py-1.5 text-sm font-semibold bg-muted">
                              {data.name} Inspectors
                            </div>
                            {data.inspectors.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center space-x-2">
                                  <type.icon className="h-4 w-4" />
                                  <span>{type.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                        <div className="px-2 py-1.5 text-sm font-semibold bg-muted">
                          Other Professionals
                        </div>
                        {professionalTypes
                          .filter(type => !Object.values(regulatoryBodies)
                            .flatMap(r => r.inspectors)
                            .some(i => i.value === type.value))
                          .map((type) => (
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
                name="badgeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Official ID/Badge Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
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
                        placeholder="Describe the purpose of your visit..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confidentiality"
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
                        I understand and agree to maintain confidentiality
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {verificationStatus === 'failed' && (
                <div className="flex items-center space-x-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Credential verification failed. Please check your details.</span>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCheckInDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={verificationStatus === 'failed'}
                >
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


