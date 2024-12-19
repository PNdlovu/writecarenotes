import { 
  FaUserNurse, 
  FaTablets, 
  FaChartLine, 
  FaNotesMedical, 
  FaLock, 
  FaUsers, 
  FaGlobe 
} from 'react-icons/fa';
import { SectionTitle } from '@/components/ui/section-title';
import { IconType } from 'react-icons';

interface FeatureProps {
  title: string;
  children: React.ReactNode;
  icon: IconType;
}

function SingleFeature({ title, children, icon: Icon }: FeatureProps) {
  return (
    <div className="w-full md:w-1/2 lg:w-1/3 p-4">
      <div className="h-full p-6 rounded-lg border bg-card hover:shadow-lg transition-all duration-300">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="text-primary text-2xl" />
        </div>
        <h3 className="mb-3 text-xl font-bold">
          {title}
        </h3>
        <p className="text-muted-foreground">
          {children}
        </p>
      </div>
    </div>
  );
}

export function Features() {
  return (
    <section className="py-16">
      <SectionTitle
        title="Main Features"
        paragraph="Everything you need to manage your care home efficiently"
        center
      />
      
      <div className="flex flex-wrap -mx-4 mt-12">
        <SingleFeature
          title="eMAR & Pain Management"
          icon={FaTablets}
        >
          Comprehensive electronic medication and pain management system with real-time tracking and alerts.
        </SingleFeature>

        <SingleFeature
          title="Digital Care Notes"
          icon={FaNotesMedical}
        >
          Detailed digital care documentation with easy access to historical records and real-time updates.
        </SingleFeature>

        <SingleFeature
          title="Robust Access Control"
          icon={FaLock}
        >
          Advanced role-based access control ensuring data security and compliance with privacy regulations.
        </SingleFeature>

        <SingleFeature
          title="Staff Scheduling"
          icon={FaUserNurse}
        >
          Intelligent staff scheduling system with shift management and qualification tracking.
        </SingleFeature>

        <SingleFeature
          title="Family Portal"
          icon={FaUsers}
        >
          Dedicated family portal for secure access to resident updates and communication with care staff.
        </SingleFeature>

        <SingleFeature
          title="Multi-Facility Dashboard"
          icon={FaChartLine}
        >
          Centralized dashboard for managing multiple facilities with comprehensive analytics and reporting.
        </SingleFeature>
      </div>
    </section>
  );
}
