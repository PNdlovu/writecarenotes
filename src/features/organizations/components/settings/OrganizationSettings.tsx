'use client'

import { useState } from 'react'
import { useOrganization } from '../../hooks/useOrganization'
import { OrganizationSettings as Settings } from '../../types/organization.types'
import { Button } from '@/components/ui/Button/Button'
import { Input } from '@/components/ui/Input/Input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Card } from '@/components/ui/Card'
import { toast } from '@/components/ui/UseToast'
import { Loader2 } from 'lucide-react'

export function OrganizationSettings() {
  const { organization, updateOrganization, updateSettings } = useOrganization()
  const [isLoading, setIsLoading] = useState(false)

  if (!organization) return null

  const handleUpdateGeneral = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      contactDetails: {
        ...organization.contactDetails,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        website: formData.get('website') as string,
        address: {
          ...organization.contactDetails.address,
          street: formData.get('street') as string,
          city: formData.get('city') as string,
          state: formData.get('state') as string,
          postalCode: formData.get('postalCode') as string,
          country: formData.get('country') as string,
        },
      },
    }

    try {
      await updateOrganization(data)
      toast({
        title: 'Settings updated',
        description: 'Your organization settings have been updated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update organization settings.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePreferences = async (settings: Partial<Settings>) => {
    setIsLoading(true)
    try {
      await updateSettings({
        ...organization.settings,
        ...settings,
      })
      toast({
        title: 'Preferences updated',
        description: 'Your preferences have been updated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update preferences.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Organization Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization preferences and settings
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <form onSubmit={handleUpdateGeneral} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Organization Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={organization.name}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={organization.contactDetails.email}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      defaultValue={organization.contactDetails.phone}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    defaultValue={organization.contactDetails.website}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Address</Label>
                  <Input
                    name="street"
                    placeholder="Street"
                    defaultValue={organization.contactDetails.address.street}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      name="city"
                      placeholder="City"
                      defaultValue={organization.contactDetails.address.city}
                    />
                    <Input
                      name="state"
                      placeholder="State"
                      defaultValue={organization.contactDetails.address.state}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      name="postalCode"
                      placeholder="Postal Code"
                      defaultValue={organization.contactDetails.address.postalCode}
                    />
                    <Input
                      name="country"
                      placeholder="Country"
                      defaultValue={organization.contactDetails.address.country}
                    />
                  </div>
                </div>
              </div>

              <Button disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={organization.settings.notifications.email}
                    onCheckedChange={(checked) =>
                      handleUpdatePreferences({
                        notifications: {
                          ...organization.settings.notifications,
                          email: checked,
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via SMS
                    </p>
                  </div>
                  <Switch
                    checked={organization.settings.notifications.sms}
                    onCheckedChange={(checked) =>
                      handleUpdatePreferences({
                        notifications: {
                          ...organization.settings.notifications,
                          sms: checked,
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications
                    </p>
                  </div>
                  <Switch
                    checked={organization.settings.notifications.push}
                    onCheckedChange={(checked) =>
                      handleUpdatePreferences({
                        notifications: {
                          ...organization.settings.notifications,
                          push: checked,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="color"
                      value={organization.settings.theme.primaryColor}
                      onChange={(e) =>
                        handleUpdatePreferences({
                          theme: {
                            ...organization.settings.theme,
                            primaryColor: e.target.value,
                          },
                        })
                      }
                      className="w-20 h-10"
                    />
                    <span className="text-sm text-muted-foreground">
                      {organization.settings.theme.primaryColor}
                    </span>
                  </div>
                </div>

                <div>
                  <Label>Logo</Label>
                  <div className="mt-2">
                    <Button variant="outline">
                      Upload Logo
                    </Button>
                  </div>
                  {organization.settings.theme.logo && (
                    <div className="mt-4">
                      <img
                        src={organization.settings.theme.logo}
                        alt="Organization logo"
                        className="max-w-[200px]"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


