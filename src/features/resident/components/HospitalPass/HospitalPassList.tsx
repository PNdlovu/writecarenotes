import { FC } from 'react';
import { format } from 'date-fns';
import { useTranslation } from '@/lib/i18n';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Pencil, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { HospitalPass } from '../../types/hospitalPass';
import { useHospitalPasses } from '../../hooks/useHospitalPasses';

interface Props {
  passes: HospitalPass[] | undefined;
  isLoading: boolean;
}

export const HospitalPassList: FC<Props> = ({ passes, isLoading }) => {
  const { t } = useTranslation('resident');
  const { deletePass } = useHospitalPasses(passes?.[0]?.residentId ?? '');

  const getStatusColor = (status: HospitalPass['status']) => {
    switch (status) {
      case 'SCHEDULED':
        return 'default';
      case 'IN_PROGRESS':
        return 'blue';
      case 'COMPLETED':
        return 'green';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!passes?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t('hospitalPass.list.empty')}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('hospitalPass.list.hospital')}</TableHead>
          <TableHead>{t('hospitalPass.list.date')}</TableHead>
          <TableHead>{t('hospitalPass.list.reason')}</TableHead>
          <TableHead>{t('hospitalPass.list.transport')}</TableHead>
          <TableHead>{t('hospitalPass.list.status')}</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {passes.map((pass) => (
          <TableRow key={pass.id}>
            <TableCell>
              <div>{pass.hospitalName}</div>
              {pass.department && (
                <div className="text-sm text-muted-foreground">
                  {pass.department}
                </div>
              )}
            </TableCell>
            <TableCell>
              <div>{format(new Date(pass.appointmentDateTime), 'PPP')}</div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(pass.appointmentDateTime), 'p')}
              </div>
            </TableCell>
            <TableCell>{pass.reason}</TableCell>
            <TableCell>{t(`hospitalPass.transport.${pass.transportMethod.toLowerCase()}`)}</TableCell>
            <TableCell>
              <Badge variant={getStatusColor(pass.status)}>
                {t(`hospitalPass.status.${pass.status.toLowerCase()}`)}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Pencil className="mr-2 h-4 w-4" />
                    {t('common.edit')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => deletePass.mutate(pass.id)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    {t('common.delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
