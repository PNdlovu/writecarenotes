import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import type { DoLS } from '../../types/dols.types';
import type { Restriction } from '../RestrictionsLog/RestrictionsLog';

interface CarePlan {
  id: string;
  residentId: string;
  category: string;
  title: string;
  description: string;
  approach: string;
  restrictions?: string[];
  reviewDate: Date;
}

interface CarePlanIntegrationProps {
  dols: DoLS | null;
  restrictions: Restriction[];
  carePlans: CarePlan[];
  onUpdateCarePlan: (carePlanId: string, updates: Partial<CarePlan>) => void;
  onAddCarePlan: (carePlan: Omit<CarePlan, 'id'>) => void;
}

export const CarePlanIntegration: React.FC<CarePlanIntegrationProps> = ({
  dols,
  restrictions,
  carePlans,
  onUpdateCarePlan,
  onAddCarePlan,
}) => {
  const getRestrictionsForCarePlan = (carePlan: CarePlan) => {
    return restrictions.filter(r => 
      carePlan.restrictions?.includes(r.id)
    );
  };

  const getDoLSImpact = () => {
    if (!dols) return [];

    const impacts = [];

    // Check conditions that affect care plans
    if (dols.conditions) {
      impacts.push({
        type: 'CONDITIONS',
        items: dols.conditions.map(condition => ({
          text: condition,
          carePlans: carePlans.filter(cp => 
            cp.description.toLowerCase().includes(condition.toLowerCase())
          ),
        })),
      });
    }

    // Check restrictions that need care plan updates
    const activeRestrictions = restrictions.filter(r => r.approved);
    if (activeRestrictions.length > 0) {
      impacts.push({
        type: 'RESTRICTIONS',
        items: activeRestrictions.map(restriction => ({
          text: restriction.details,
          carePlans: carePlans.filter(cp => 
            cp.restrictions?.includes(restriction.id)
          ),
        })),
      });
    }

    return impacts;
  };

  const dolsImpacts = getDoLSImpact();

  return (
    <div className="space-y-6">
      <Alert>
        <AlertDescription>
          This section shows how DoLS conditions and restrictions are integrated into care plans.
        </AlertDescription>
      </Alert>

      <Card>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">DoLS Impact on Care Plans</h3>
          {dolsImpacts.length > 0 ? (
            dolsImpacts.map((impact, index) => (
              <>
                {index > 0 && <Separator className="my-4" />}
                <Card key={index} className="mb-4">
                  <div className="p-4">
                    <h4 className="text-md font-medium mb-2">
                      {impact.type === 'CONDITIONS' ? 'DoLS Conditions' : 'Active Restrictions'}
                    </h4>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-4">
                        {impact.items.map((item, idx) => (
                          <div key={idx} className="space-y-2">
                            <p className="font-medium">{item.text}</p>
                            <p className="text-sm text-muted-foreground">Affected Care Plans:</p>
                            {item.carePlans.length > 0 ? (
                              <div className="space-y-2">
                                {item.carePlans.map((carePlan, planIdx) => (
                                  <>
                                    {planIdx > 0 && <Separator className="my-4" />}
                                    <div key={planIdx} className="flex items-center space-x-2">
                                      <span>{carePlan.title}</span>
                                      <Badge variant="secondary">{carePlan.category}</Badge>
                                    </div>
                                  </>
                                ))}
                              </div>
                            ) : (
                              <Alert className="bg-yellow-50">
                                <AlertDescription className="flex items-center justify-between">
                                  <span>No affected care plans found</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAddCarePlan(item.text)}
                                  >
                                    Create Care Plan
                                  </Button>
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </Card>
              </>
            ))
          ) : (
            <Alert>
              <AlertDescription>
                Current DoLS and restrictions do not directly impact any care plans.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </Card>

      <Separator className="my-6" />

      <Card>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Care Plans with Restrictions</h3>
          <div className="space-y-6">
            {carePlans
              .filter(cp => cp.restrictions && cp.restrictions.length > 0)
              .map(carePlan => {
                const planRestrictions = getRestrictionsForCarePlan(carePlan);
                return (
                  <>
                    {carePlans.indexOf(carePlan) > 0 && <Separator className="my-4" />}
                    <div key={carePlan.id} className="relative pl-6 pb-6 border-l-2 border-blue-500">
                      <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-blue-500" />
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{carePlan.title}</span>
                          <Badge variant="secondary">{carePlan.category}</Badge>
                        </div>
                        <p className="text-sm">{carePlan.description}</p>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Associated Restrictions:</p>
                          {planRestrictions.map(restriction => (
                            <div key={restriction.id} className="flex items-center space-x-2">
                              <Badge variant={getVariantColor(restriction.type)}>
                                {restriction.type}
                              </Badge>
                              <span className="text-sm">{restriction.details}</span>
                              {!restriction.approved && (
                                <Badge variant="destructive">Pending Approval</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateCarePlan(carePlan)}
                          >
                            Update Plan
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            Review due: {carePlan.reviewDate.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })}
          </div>
        </div>
      </Card>
    </div>
  );

  function getVariantColor(type: Restriction['type']): 'default' | 'destructive' | 'secondary' | 'outline' {
    const variants: Record<Restriction['type'], 'default' | 'destructive' | 'secondary' | 'outline'> = {
      PHYSICAL: 'destructive',
      CHEMICAL: 'secondary',
      ENVIRONMENTAL: 'default',
      SURVEILLANCE: 'outline'
    };
    return variants[type];
  }

  function handleUpdateCarePlan(carePlan: CarePlan) {
    // Implementation would open a modal or navigate to care plan edit
    console.log('Update care plan:', carePlan);
  }

  function handleAddCarePlan(condition: string) {
    // Implementation would open a modal to create new care plan
    console.log('Add care plan for condition:', condition);
  }
};


