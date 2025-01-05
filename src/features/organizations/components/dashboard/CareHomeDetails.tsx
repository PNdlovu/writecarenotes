/**
 * @fileoverview Care Home Details Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button/Button'

interface CareHomeDetailsProps {
  careHomeId: string
}

export function CareHomeDetails({ careHomeId }: CareHomeDetailsProps) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="residents">Residents</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Occupancy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-sm text-muted-foreground">34/40 beds</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Staff Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">95%</div>
                <p className="text-sm text-muted-foreground">2 vacancies</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>CQC Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Good</div>
                <p className="text-sm text-muted-foreground">Last updated: Jan 2024</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-sm text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="residents">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Resident Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add resident demographics chart */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Care Levels</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add care levels breakdown */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Admissions</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add recent admissions list */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Care Plan Status</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add care plan status overview */}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="staff">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Staff Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Staff:</span>
                    <span className="font-bold">45</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Full-time:</span>
                    <span className="font-bold">32</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Part-time:</span>
                    <span className="font-bold">13</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Agency:</span>
                    <span className="font-bold">5</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Training Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add training compliance chart */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shift Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add shift coverage overview */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Staff Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add staff performance metrics */}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rooms">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Room Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add room allocation chart */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add maintenance requests list */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Equipment Status</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add equipment status overview */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Room Usage</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add room usage metrics */}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Regulatory Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">CQC Status</h3>
                    <div className="text-2xl font-bold text-green-600">Compliant</div>
                  </div>
                  <div>
                    <h3 className="font-semibold">Last Inspection</h3>
                    <div className="text-xl">January 15, 2024</div>
                  </div>
                  <div>
                    <h3 className="font-semibold">Next Due</h3>
                    <div className="text-xl">July 15, 2024</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Policy Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add policy compliance metrics */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Audit History</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add audit history list */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Action Items</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add compliance action items */}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 


