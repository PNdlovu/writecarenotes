import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useResidentTranslation } from '@/lib/i18n/hooks';
import { HospitalPassForm } from './HospitalPassForm';
import { HospitalPassList } from './HospitalPassList';
import { useHospitalPasses } from '../../hooks/useHospitalPasses';

interface Props {
  residentId: string;
}

export const HospitalPass: FC<Props> = ({ residentId }) => {
  const { t } = useResidentTranslation();
  const { passes, isLoading, error } = useHospitalPasses(residentId);

  if (error) {
    return <div>Error loading hospital passes</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('hospitalPass.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <HospitalPassForm residentId={residentId} />
        <HospitalPassList passes={passes} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
};

export default HospitalPass;
