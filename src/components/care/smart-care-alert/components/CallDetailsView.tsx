/**
 * @writecarenotes.com
 * @fileoverview Call Details View Component
 * @version 1.0.0
 * @created 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import React from 'react';
import { Phone, Clock, MapPin, User, AlertTriangle, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { Typography } from '@/components/ui/Typography';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Separator } from '@/components/ui/Separator';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import { Alert } from '@/components/ui/Alert';

import { OnCallRecord } from '../types/OnCallTypes';

interface CallDetailsViewProps {
    record: OnCallRecord;
    onClose: () => void;
    onEdit: (record: OnCallRecord) => Promise<void>;
    onAssign: (record: OnCallRecord, staffId: string) => Promise<void>;
}

export const CallDetailsView: React.FC<CallDetailsViewProps> = ({
    record,
    onClose,
    onEdit,
    onAssign
}) => {
    const formatTimestamp = (date: Date) => {
        return new Date(date).toLocaleString();
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <Typography variant="h5">Call Details</Typography>
                    <Badge
                        variant={record.status === 'active' ? 'default' : 'secondary'}
                    >
                        {record.status}
                    </Badge>
                </div>

                <div className="space-y-6">
                    {/* Priority Alert */}
                    {record.priority === 'urgent' && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <Alert.Title>Urgent Call</Alert.Title>
                            <Alert.Description>
                                This call requires immediate attention
                            </Alert.Description>
                        </Alert>
                    )}

                    {/* Basic Information */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{formatTimestamp(record.timestamp)}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <Typography variant="muted">
                                Unit {record.location.unit}, Floor {record.location.floor}
                                {record.location.room && `, Room ${record.location.room}`}
                            </Typography>
                        </div>

                        {record.responderId && (
                            <div className="flex items-center space-x-4">
                                <Avatar>
                                    <Avatar.Image src={`/avatars/${record.responderId}.jpg`} alt="Staff" />
                                    <Avatar.Fallback>
                                        <User className="h-4 w-4" />
                                    </Avatar.Fallback>
                                </Avatar>
                                <div>
                                    <Typography variant="muted">Assigned to</Typography>
                                    <Typography variant="h6">{record.responderName}</Typography>
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Description */}
                    <div className="space-y-2">
                        <Typography variant="h6">Description</Typography>
                        <Typography variant="muted" className="whitespace-pre-wrap">
                            {record.description}
                        </Typography>
                    </div>

                    {/* Status Updates */}
                    {record.updates && record.updates.length > 0 && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <Typography variant="h6">Updates</Typography>
                                <ScrollArea className="h-48">
                                    <div className="space-y-4">
                                        {record.updates.map((update, index) => (
                                            <div key={index} className="flex items-start space-x-2">
                                                <div className="mt-1">
                                                    {update.type === 'status' ? (
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <Typography variant="muted" className="text-sm">
                                                        {formatTimestamp(update.timestamp)}
                                                    </Typography>
                                                    <Typography>{update.message}</Typography>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-auto p-6 bg-muted/10 border-t">
                <div className="flex flex-col space-y-2">
                    {!record.responderId && (
                        <Button
                            variant="default"
                            className="w-full"
                            onClick={() => onAssign(record, 'STAFF_ID')}
                        >
                            <User className="h-4 w-4 mr-2" />
                            Assign Staff
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};
