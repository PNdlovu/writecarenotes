import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select/Select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/Badge/Badge';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { Assessment } from '../../types/assessment.types';
import {
  sortAssessments,
  filterAssessmentsByStatus,
} from '../../utils/assessmentHelpers';

interface AssessmentListProps {
  assessments: Assessment[];
  onViewAssessment: (id: string) => void;
  onEditAssessment: (id: string) => void;
  onDeleteAssessment: (id: string) => void;
  onStartAssessment: (id: string) => void;
}

export function AssessmentList({
  assessments,
  onViewAssessment,
  onEditAssessment,
  onDeleteAssessment,
  onStartAssessment,
}: AssessmentListProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [sortBy, setSortBy] = React.useState<string>('date');

  const filteredAssessments = React.useMemo(() => {
    return assessments
      .filter((assessment) => {
        const matchesSearch = assessment.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesStatus =
          statusFilter === 'all' || assessment.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'date':
            return a.date.getTime() - b.date.getTime();
          case 'title':
            return a.title.localeCompare(b.title);
          case 'status':
            return a.status.localeCompare(b.status);
          default:
            return 0;
        }
      });
  }, [assessments, searchQuery, statusFilter, sortBy]);

  const getStatusBadge = (status: Assessment['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        );
      case 'overdue':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Overdue
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assessments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssessments.map((assessment) => (
              <TableRow key={assessment.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{assessment.title}</span>
                    {assessment.isRecurring && (
                      <Badge variant="outline" className="flex items-center">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Recurring
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{format(assessment.date, 'MMM d, yyyy')}</span>
                    <span className="text-sm text-muted-foreground">
                      {assessment.time}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                    {assessment.participants}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                <TableCell>
                  {assessment.score !== undefined ? `${assessment.score}%` : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewAssessment(assessment.id)}>
                        View Details
                      </DropdownMenuItem>
                      {assessment.status === 'pending' && (
                        <DropdownMenuItem onClick={() => onStartAssessment(assessment.id)}>
                          Start Assessment
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onEditAssessment(assessment.id)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onDeleteAssessment(assessment.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}


