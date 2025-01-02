import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button/Button'
import { Progress } from '@/components/ui/Progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select/Select'
import { Badge } from '@/components/ui/Badge/Badge'
import type { HandoverSession, ComplianceStatus } from '../../types/handover'

interface HandoverQualityProps {
  session: HandoverSession
  onUpdateQuality: (
    updates: Pick<HandoverSession, 'qualityScore' | 'complianceStatus'>
  ) => void
}

const complianceStatuses: ComplianceStatus[] = [
  'COMPLIANT',
  'NON_COMPLIANT',
  'NEEDS_REVIEW',
]

const complianceColors = {
  COMPLIANT: 'bg-green-500',
  NON_COMPLIANT: 'bg-red-500',
  NEEDS_REVIEW: 'bg-yellow-500',
}

const qualityLevels = [
  { score: 20, label: 'Poor' },
  { score: 40, label: 'Fair' },
  { score: 60, label: 'Good' },
  { score: 80, label: 'Very Good' },
  { score: 100, label: 'Excellent' },
]

export const HandoverQuality: React.FC<HandoverQualityProps> = ({
  session,
  onUpdateQuality,
}) => {
  const handleQualityUpdate = (score: number) => {
    onUpdateQuality({
      qualityScore: score,
      complianceStatus: session.complianceStatus,
    })
  }

  const handleComplianceUpdate = (status: ComplianceStatus) => {
    onUpdateQuality({
      qualityScore: session.qualityScore,
      complianceStatus: status,
    })
  }

  const getQualityLabel = (score: number | undefined) => {
    if (!score) return 'Not Rated'
    const level = qualityLevels.find((l) => score <= l.score)
    return level ? level.label : 'Excellent'
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-medium">Quality Score</h3>
        <div className="mt-4 space-y-4">
          <Progress value={session.qualityScore} className="h-2" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {getQualityLabel(session.qualityScore)}
            </span>
            <span className="text-sm text-gray-500">
              {session.qualityScore || 0}/100
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {qualityLevels.map(({ score, label }) => (
              <Button
                key={score}
                variant={session.qualityScore === score ? 'default' : 'outline'}
                onClick={() => handleQualityUpdate(score)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium">Compliance Status</h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-center space-x-4">
            <Select
              value={session.complianceStatus}
              onValueChange={(value: ComplianceStatus) =>
                handleComplianceUpdate(value)
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {complianceStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge className={complianceColors[session.complianceStatus]}>
              {session.complianceStatus}
            </Badge>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium">Quality Checklist</h3>
        <div className="mt-4 space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={session.qualityScore !== undefined}
              readOnly
            />
            <span>Quality score assigned</span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={session.complianceStatus !== undefined}
              readOnly
            />
            <span>Compliance status set</span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={session.status === 'VERIFIED'}
              readOnly
            />
            <span>Handover verified</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
