import React from 'react';
import { Tab } from '@headlessui/react';
import { classNames } from '../../utils/classNames';
import { useDietaryManagement } from '../../hooks/useDietaryManagement';
import { useOrganization } from '../../hooks/useOrganization';
import { DateRangePicker } from '../common/DateRangePicker';
import { MealPlansPanel } from './MealPlansPanel';
import { MenuItemsPanel } from './MenuItemsPanel';
import { MealServicesPanel } from './MealServicesPanel';
import { NutritionLogsPanel } from './NutritionLogsPanel';
import { DietaryAlertsPanel } from './DietaryAlertsPanel';

export const DietaryDashboard: React.FC = () => {
  const { currentOrganization } = useOrganization();
  const [dateRange, setDateRange] = React.useState<[Date | null, Date | null]>([
    new Date(new Date().setMonth(new Date().getMonth() - 1)),
    new Date()
  ]);

  const dietaryManagement = useDietaryManagement(currentOrganization.id);

  const tabs = [
    'Meal Plans',
    'Menu Items',
    'Meal Services',
    'Nutrition Logs',
    'Dietary Alerts'
  ];

  return (
    <div className="w-full px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dietary Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage meal plans, dietary restrictions, and nutrition tracking
        </p>
      </div>

      <div className="mb-6">
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          startLabel="Start Date"
          endLabel="End Date"
        />
      </div>

      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          {tabs.map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                )
              }
            >
              {tab}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels className="mt-4">
          <Tab.Panel>
            <MealPlansPanel
              dateRange={dateRange}
              useMealPlans={dietaryManagement.useMealPlans}
              useCreateMealPlan={dietaryManagement.useCreateMealPlan}
              useUpdateMealPlan={dietaryManagement.useUpdateMealPlan}
            />
          </Tab.Panel>

          <Tab.Panel>
            <MenuItemsPanel
              useMenuItems={dietaryManagement.useMenuItems}
              useCreateMenuItem={dietaryManagement.useCreateMenuItem}
            />
          </Tab.Panel>

          <Tab.Panel>
            <MealServicesPanel
              selectedDate={dietaryManagement.selectedDate}
              setSelectedDate={dietaryManagement.setSelectedDate}
              useMealServices={dietaryManagement.useMealServices}
              useRecordMealService={dietaryManagement.useRecordMealService}
            />
          </Tab.Panel>

          <Tab.Panel>
            <NutritionLogsPanel
              dateRange={dateRange}
              useNutritionLogs={dietaryManagement.useNutritionLogs}
              useCreateNutritionLog={dietaryManagement.useCreateNutritionLog}
              generateNutritionReport={dietaryManagement.generateNutritionReport}
            />
          </Tab.Panel>

          <Tab.Panel>
            <DietaryAlertsPanel
              useDietaryAlerts={dietaryManagement.useDietaryAlerts}
              useCreateDietaryAlert={dietaryManagement.useCreateDietaryAlert}
              useResolveDietaryAlert={dietaryManagement.useResolveDietaryAlert}
            />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};


