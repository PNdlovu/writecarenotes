/**
 * WriteCareNotes.com
 * @fileoverview Tool Card Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { ToolCardProps } from "./types"

export function ToolCard({ tool, onAccess }: ToolCardProps) {
  const Icon = tool.icon

  return (
    <Card className="p-6">
      <div className="rounded-lg bg-blue-50 p-3 w-fit">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
      <div className="mt-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">
            {tool.title}
          </h3>
          <Badge variant="outline">{tool.category}</Badge>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {tool.description}
        </p>
        <Button 
          variant="link" 
          className="mt-4 p-0"
          onClick={onAccess}
        >
          Access tool →
        </Button>
      </div>
    </Card>
  )
} 