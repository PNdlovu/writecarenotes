'use client'

import Link from 'next/link'
import { CareHome } from '../../types/organization.types'
import { CareHomeMetricsSummary } from '../../repositories/analyticsRepository'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge/Badge'
import { Button } from '@/components/ui/Button/Button'
import { ArrowUpRight, Users, Percent, Shield } from 'lucide-react'

interface CareHomesListProps {
  careHomes: CareHome[]
  metrics: CareHomeMetricsSummary[]
}

export function CareHomesList({ careHomes, metrics }: CareHomesListProps) {
  const getMetricsForCareHome = (careHomeId: string) => {
    return metrics.find(m => m.careHomeId === careHomeId)?.metrics
  }

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800'
    if (score >= 70) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getOccupancyColor = (occupancy: number) => {
    if (occupancy >= 85) return 'text-green-600'
    if (occupancy >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Residents</TableHead>
          <TableHead>Staff</TableHead>
          <TableHead>Occupancy</TableHead>
          <TableHead>Compliance</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {careHomes.map(careHome => {
          const metrics = getMetricsForCareHome(careHome.id)
          return (
            <TableRow key={careHome.id}>
              <TableCell className="font-medium">
                {careHome.name}
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  {metrics?.residents || 0}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  {metrics?.staff || 0}
                </div>
              </TableCell>
              <TableCell>
                <span className={getOccupancyColor(metrics?.occupancy || 0)}>
                  <Percent className="h-4 w-4 inline mr-1" />
                  {Math.round(metrics?.occupancy || 0)}%
                </span>
              </TableCell>
              <TableCell>
                <Badge className={getComplianceColor(metrics?.compliance || 0)}>
                  <Shield className="h-4 w-4 mr-1" />
                  {Math.round(metrics?.compliance || 0)}%
                </Badge>
              </TableCell>
              <TableCell>
                <Link href={`/care-homes/${careHome.id}`}>
                  <Button variant="ghost" size="sm">
                    View
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}


