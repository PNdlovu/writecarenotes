import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SettingsViewProps {
  region: string;
}

export default function SettingsView({ region }: SettingsViewProps) {
  return (
    <div className="space-y-4 p-8">
      <h1 className="text-2xl font-bold tracking-tight">Settings - {region}</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Organization Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Manage organization details and preferences</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Manage user accounts and permissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Facility Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Configure facility-specific settings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Configure notification preferences</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Manage third-party integrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Security and authentication settings</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


