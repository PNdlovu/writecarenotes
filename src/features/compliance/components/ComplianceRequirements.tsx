import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import type { ComplianceRequirement } from '../types'

interface ComplianceRequirementsProps {
  requirements: ComplianceRequirement[]
}

export function ComplianceRequirements({ requirements }: ComplianceRequirementsProps) {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setOpenItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      CARE_QUALITY: 'bg-blue-100 text-blue-800',
      HEALTH_SAFETY: 'bg-green-100 text-green-800',
      MEDICATION_MANAGEMENT: 'bg-purple-100 text-purple-800',
      INFECTION_CONTROL: 'bg-red-100 text-red-800',
      STAFF_TRAINING: 'bg-yellow-100 text-yellow-800',
      RESIDENT_RIGHTS: 'bg-pink-100 text-pink-800',
      DATA_PROTECTION: 'bg-indigo-100 text-indigo-800',
      ENVIRONMENTAL: 'bg-orange-100 text-orange-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-4">
      {requirements.map((requirement) => (
        <Collapsible
          key={requirement.id}
          open={openItems.includes(requirement.id)}
          onOpenChange={() => toggleItem(requirement.id)}
        >
          <Card>
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge className={getCategoryColor(requirement.category)}>
                    {requirement.category.replace(/_/g, ' ')}
                  </Badge>
                  <CardTitle className="text-sm font-medium">
                    {requirement.title}
                  </CardTitle>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {openItems.includes(requirement.id) ? (
                      <ChevronUpIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-1">Description</h4>
                    <p className="text-sm text-gray-600">{requirement.description}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-1">Required Documentation</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {requirement.documentationRequired.map((doc, index) => (
                        <li key={index}>{doc}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-1">Assessment Criteria</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {requirement.assessmentCriteria.map((criteria, index) => (
                        <li key={index}>{criteria}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Last Updated: {new Date(requirement.lastUpdated).toLocaleDateString()}</span>
                    <span>Next Review: {new Date(requirement.nextReviewDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  )
}
