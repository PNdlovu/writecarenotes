/**
 * WriteCareNotes.com
 * @fileoverview Dashboard Tabs Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Phibu Cloud Solutions Ltd.
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Users, FileText, Bell } from "lucide-react"
import { EmptyPlaceholder } from "@/components/empty-placeholder"

export function DashboardTabs() {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="residents">Residents</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="alerts">Alerts</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Residents
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Care Plans
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Recent Activity
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Alerts
              </CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      <TabsContent value="residents" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Residents</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <EmptyPlaceholder>
              <EmptyPlaceholder.Icon name="users" />
              <EmptyPlaceholder.Title>No residents</EmptyPlaceholder.Title>
              <EmptyPlaceholder.Description>
                You haven&apos;t added any residents yet.
              </EmptyPlaceholder.Description>
            </EmptyPlaceholder>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="documents" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <EmptyPlaceholder>
              <EmptyPlaceholder.Icon name="file" />
              <EmptyPlaceholder.Title>No documents</EmptyPlaceholder.Title>
              <EmptyPlaceholder.Description>
                You haven&apos;t created any documents yet.
              </EmptyPlaceholder.Description>
            </EmptyPlaceholder>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="alerts" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <EmptyPlaceholder>
              <EmptyPlaceholder.Icon name="bell" />
              <EmptyPlaceholder.Title>No alerts</EmptyPlaceholder.Title>
              <EmptyPlaceholder.Description>
                You don&apos;t have any active alerts.
              </EmptyPlaceholder.Description>
            </EmptyPlaceholder>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
} 