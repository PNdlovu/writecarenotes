/**
 * @fileoverview Video Call Component integrated with Enhanced Telehealth
 * @version 1.1.0
 * @created 2024-12-12
 * @updated 2024-12-12
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Real-time video communication component utilizing Enhanced Telehealth service
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Badge } from "@/components/ui/Badge/Badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog/Dialog";
import { useAccessibility } from '../../hooks/useAccessibility';
import { useToast } from "@/components/ui/UseToast";
import { EnhancedTelehealth } from '@/features/telehealth/services/enhancedTelehealth';

interface VideoCallProps {
  residentId: string;
  familyMemberId: string;
  isGroup?: boolean;
  careHomeId: string;
}

interface Participant {
  id: string;
  name: string;
  role: string;
  stream?: MediaStream;
  audioEnabled: boolean;
  videoEnabled: boolean;
}

export const VideoCall: React.FC<VideoCallProps> = ({
  residentId,
  familyMemberId,
  careHomeId,
  isGroup = false,
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [consultationId, setConsultationId] = useState<string>();
  const [quality, setQuality] = useState<'SD' | 'HD' | 'FHD'>('HD');
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();
  const telehealthService = new EnhancedTelehealth();
  const { getAriaProps } = useAccessibility();

  useEffect(() => {
    initializeCall();
  }, []);

  const initializeCall = async () => {
    try {
      // Create a consultation request
      const consultation = await telehealthService.facilitateRemoteConsultations(careHomeId, {
        residentId,
        type: 'GP',
        urgency: 'ROUTINE',
        participants: [
          {
            id: familyMemberId,
            role: 'RESIDENT',
            name: 'Family Member'
          }
        ],
        status: 'PENDING'
      });

      setConsultationId(consultation.id);

      // Initialize participants with the consultation data
      if (consultation.participants) {
        setParticipants(consultation.participants.map(p => ({
          id: p.id,
          name: p.name,
          role: p.role,
          audioEnabled: true,
          videoEnabled: true
        })));
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize video call",
        variant: "destructive"
      });
    }
  };

  const endCall = async () => {
    if (consultationId) {
      await telehealthService.recordConsultation(consultationId, {
        endTime: new Date().toISOString(),
        summary: 'Family video call completed'
      });
    }
    // Additional cleanup...
  };

  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    } else {
      try {
        const stream = localVideoRef.current?.srcObject as MediaStream;
        if (stream) {
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          
          const chunks: BlobPart[] = [];
          mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
          mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `recording-${new Date().toISOString()}.webm`;
            a.click();
          };
          
          mediaRecorder.start();
          setIsRecording(true);
        }
      } catch (error) {
        toast({
          title: "Recording Error",
          description: "Failed to start recording",
          variant: "destructive"
        });
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing
        setIsScreenSharing(false);
      } else {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
      }
    } catch (error) {
      toast({
        title: "Screen Share Error",
        description: "Failed to share screen",
        variant: "destructive"
      });
    }
  };

  const toggleAudio = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const inviteParticipant = (email: string) => {
    // Implement invitation logic
    toast({
      title: "Invitation Sent",
      description: `Invitation sent to ${email}`,
    });
    setShowInviteDialog(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Video Call</h2>
          <p className="text-muted-foreground">
            {isGroup ? 'Group Video Session' : 'One-on-One Call'}
          </p>
        </div>
        <div className="space-x-2">
          <Button onClick={() => setShowInviteDialog(true)}>
            Invite Participants
          </Button>
          <Button variant="outline" onClick={() => setQuality(q => q === 'HD' ? 'SD' : 'HD')}>
            Quality: {quality}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Local Video */}
        <Card className="relative">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full rounded-lg"
            {...getAriaProps('video')}
          />
          <Badge className="absolute top-2 left-2">
            You {isMuted && '(Muted)'} {isVideoOff && '(Video Off)'}
          </Badge>
        </Card>

        {/* Remote Videos */}
        <div className="grid grid-cols-2 gap-2">
          {participants.map(participant => (
            <Card key={participant.id} className="relative">
              <video
                ref={el => {
                  if (el) remoteVideoRefs.current[participant.id] = el;
                }}
                autoPlay
                playsInline
                className="w-full rounded-lg"
                {...getAriaProps('video')}
              />
              <Badge className="absolute top-2 left-2">
                {participant.name}
              </Badge>
            </Card>
          ))}
        </div>
      </div>

      {/* Controls */}
      <Card className="p-4">
        <div className="flex justify-center space-x-4">
          <Button
            variant={isMuted ? "destructive" : "default"}
            onClick={toggleAudio}
            {...getAriaProps('button')}
          >
            {isMuted ? 'Unmute' : 'Mute'}
          </Button>
          <Button
            variant={isVideoOff ? "destructive" : "default"}
            onClick={toggleVideo}
            {...getAriaProps('button')}
          >
            {isVideoOff ? 'Start Video' : 'Stop Video'}
          </Button>
          <Button
            variant={isScreenSharing ? "secondary" : "default"}
            onClick={toggleScreenShare}
            {...getAriaProps('button')}
          >
            {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
          </Button>
          <Button
            variant={isRecording ? "secondary" : "default"}
            onClick={toggleRecording}
            {...getAriaProps('button')}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Button>
          <Button
            variant="destructive"
            onClick={endCall}
            {...getAriaProps('button')}
          >
            End Call
          </Button>
        </div>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Participants</DialogTitle>
            <DialogDescription>
              Enter email addresses to invite participants
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Enter email address"
              {...getAriaProps('textbox')}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => inviteParticipant('')}>
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


