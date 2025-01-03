/**
 * @writecarenotes.com
 * @fileoverview Smart Care Alert Dashboard Component
 * @version 1.0.0
 * @created 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Mobile-first dashboard component for the smart care alert system.
 * Optimized for touch interactions and small screens with progressive
 * enhancement for larger displays.
 */

import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Phone, Plus, Bell, Menu, User } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/Button/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { Sheet } from '@/components/ui/Sheet';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Separator } from '@/components/ui/Separator';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import { Typography } from '@/components/ui/Typography';
import { Alert } from '@/components/ui/Alert';
import { State } from '@/components/ui/State';

import { OnCallService } from '../services/OnCallService';
import { OnCallRecord, Staff } from '../types/OnCallTypes';
import { useOnCallState } from '../hooks/useOnCallState';
import { NewCallForm } from './NewCallForm';
import { CallDetailsView } from './CallDetailsView';
import { BaseCareComponent, BaseCareProps } from '../../base/BaseCareComponent';
import { CareHome } from '../../types/CareHome';
import { Organization } from '../../base/types';

interface SmartCareAlertDashboardProps extends BaseCareProps {
    careHome: CareHome;
    organization: Organization;
}

export const SmartCareAlertDashboard: React.FC<SmartCareAlertDashboardProps> = observer(({ 
    careHome, 
    organization,
    person,
    careType 
}) => {
    const [newCallOpen, setNewCallOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { 
        loading, 
        error, 
        activeRecords, 
        availableStaff,
        notifications,
        createNewCall,
        updateCall,
        assignStaff
    } = useOnCallState(careHome.id, careHome.region);
    const [selectedRecord, setSelectedRecord] = useState<OnCallRecord | null>(null);

    const handleNewCall = async (callData: Partial<OnCallRecord>) => {
        try {
            await createNewCall({
                ...callData,
                careHomeId: careHome.id,
                organizationId: organization.id,
                careType: careType,
                audit: {
                    createdAt: new Date(),
                    createdBy: person.id,
                    updatedAt: new Date(),
                    updatedBy: person.id,
                    version: 1
                }
            });
            setNewCallOpen(false);
        } catch (error) {
            console.error('Failed to create new call:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <State.Loading />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <Alert variant="destructive">
                    {error instanceof Error ? error.message : 'An error occurred'}
                </Alert>
            </div>
        );
    }

    const ActiveCallsList = () => (
        <ScrollArea className="h-[calc(100vh-16rem)]">
            {activeRecords.map((record) => (
                <div
                    key={record.id}
                    className="group relative p-4 cursor-pointer hover:bg-accent rounded-lg transition-colors"
                    onClick={() => setSelectedRecord(record)}
                >
                    <div className="flex items-start justify-between space-x-4">
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center space-x-2">
                                <Typography variant="h6">{record.category}</Typography>
                                <Badge variant={record.priority === 'urgent' ? 'destructive' : 'default'}>
                                    {record.priority}
                                </Badge>
                            </div>
                            <Typography variant="muted">{record.description}</Typography>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                <span>{new Date(record.timestamp).toLocaleTimeString()}</span>
                            </div>
                        </div>
                        {record.responderId && (
                            <Avatar>
                                <Avatar.Image src={`/avatars/${record.responderId}.jpg`} alt="Staff" />
                                <Avatar.Fallback>
                                    <User className="h-4 w-4" />
                                </Avatar.Fallback>
                            </Avatar>
                        )}
                    </div>
                </div>
            ))}
        </ScrollArea>
    );

    const StaffList = () => (
        <ScrollArea className="h-[calc(100vh-16rem)]">
            {availableStaff.map((staff) => (
                <div key={staff.id} className="p-4 border-b last:border-0">
                    <div className="flex items-center space-x-4">
                        <Avatar>
                            <Avatar.Image src={`/avatars/${staff.id}.jpg`} alt={staff.name} />
                            <Avatar.Fallback>
                                <User className="h-4 w-4" />
                            </Avatar.Fallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                            <Typography variant="h6">{staff.name}</Typography>
                            <Typography variant="muted">{staff.role}</Typography>
                            <div className="flex flex-wrap gap-1">
                                {staff.qualifications.map((qual) => (
                                    <Badge key={qual} variant="outline">
                                        {qual}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </ScrollArea>
    );

    return (
        <BaseCareComponent>
            <div className="min-h-screen bg-background">
                {/* Mobile Header */}
                <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b">
                    <div className="flex items-center justify-between p-4">
                        <Button variant="ghost" size="icon" onClick={() => setMenuOpen(true)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <Typography variant="h5">On-Call Dashboard</Typography>
                        <Badge variant="secondary" className="ml-2">
                            {notifications}
                            <Bell className="h-4 w-4 ml-1" />
                        </Badge>
                    </div>
                </div>

                {/* Main Content */}
                <div className={cn(
                    "container mx-auto p-4 space-y-4",
                    "lg:p-8",
                    "lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0"
                )}>
                    <Card>
                        <Card.Header>
                            <Card.Title>Active Calls</Card.Title>
                        </Card.Header>
                        <Card.Content>
                            <ActiveCallsList />
                        </Card.Content>
                    </Card>

                    <Card>
                        <Card.Header>
                            <Card.Title>Available Staff</Card.Title>
                        </Card.Header>
                        <Card.Content>
                            <StaffList />
                        </Card.Content>
                    </Card>
                </div>

                {/* Mobile FAB */}
                <div className="lg:hidden fixed bottom-6 right-6">
                    <Button
                        size="icon"
                        onClick={() => setNewCallOpen(true)}
                    >
                        <Plus className="h-5 w-5" />
                    </Button>
                </div>

                {/* Desktop Action Button */}
                <div className="hidden lg:block fixed bottom-8 right-8">
                    <Button
                        size="lg"
                        onClick={() => setNewCallOpen(true)}
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        New Call
                    </Button>
                </div>

                {/* Forms and Dialogs */}
                <NewCallForm
                    open={newCallOpen}
                    onClose={() => setNewCallOpen(false)}
                    onSubmit={handleNewCall}
                />

                {/* Mobile Menu */}
                <Sheet
                    open={menuOpen}
                    onOpenChange={setMenuOpen}
                    side="left"
                >
                    <div className="p-6 space-y-4">
                        <Typography variant="h5">On-Call Dashboard</Typography>
                        <Separator />
                        <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                                setNewCallOpen(true);
                                setMenuOpen(false);
                            }}
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            New Call
                        </Button>
                    </div>
                </Sheet>

                {/* Record Details */}
                <Sheet
                    open={!!selectedRecord}
                    onOpenChange={() => setSelectedRecord(null)}
                    side="right"
                >
                    {selectedRecord && (
                        <CallDetailsView
                            record={selectedRecord}
                            onClose={() => setSelectedRecord(null)}
                            onEdit={updateCall}
                            onAssign={assignStaff}
                        />
                    )}
                </Sheet>
            </div>
        </BaseCareComponent>
    );
});

export default SmartCareAlertDashboard;
