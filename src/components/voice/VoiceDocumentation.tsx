/**
 * @fileoverview Voice Documentation Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { VoiceAssistant } from '@/features/voice/services/voiceAssistant';

interface VoiceDocumentationProps {
  careHomeId: string;
  residentId?: string;
  medicationId?: string;
  module?: string;
  section?: string;
}

export function VoiceDocumentation({
  careHomeId,
  residentId,
  medicationId,
  module = 'general',
  section,
}: VoiceDocumentationProps) {
  const { data: session } = useSession();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceAssistant] = useState(() => new VoiceAssistant());
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Process any pending offline documentation
    voiceAssistant.processRetryQueue().catch(console.error);
  }, [voiceAssistant]);

  const startRecording = async () => {
    try {
      setError(null);
      setStatus('recording');
      setIsListening(true);
      
      await voiceAssistant.startListening({
        module,
        section,
        residentId,
        medicationId,
      });
      
      // Provide audio feedback
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Recording started');
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      setError('Failed to start recording. Please check microphone permissions.');
      setStatus('error');
      setIsListening(false);
    }
  };

  const stopRecording = async () => {
    try {
      setStatus('processing');
      await voiceAssistant.stopListening();
      setIsListening(false);
      
      // Provide audio feedback
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Recording stopped');
        window.speechSynthesis.speak(utterance);
      }
      
      setStatus('idle');
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setError('Failed to stop recording. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Voice Documentation</h3>
        <div className="flex items-center space-x-2">
          {status === 'recording' && (
            <span className="flex items-center">
              <span className="animate-pulse w-3 h-3 bg-red-500 rounded-full mr-2" />
              Recording...
            </span>
          )}
          <button
            onClick={isListening ? stopRecording : startRecording}
            className={`px-4 py-2 rounded ${
              isListening
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            disabled={status === 'processing'}
          >
            {isListening ? 'Stop Recording' : 'Start Recording'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h4 className="font-medium">Voice Commands</h4>
        </div>
        <div className="p-4">
          <ul className="space-y-2 text-sm">
            <li>
              <span className="font-medium">Start recording:</span> Click the "Start Recording" button
            </li>
            <li>
              <span className="font-medium">Stop recording:</span> Click the "Stop Recording" button or say "stop"
            </li>
            <li>
              <span className="font-medium">Switch module:</span> Say "switch to [module name]"
              <br />
              <span className="text-gray-600">
                Example: "switch to medications", "switch to care plans"
              </span>
            </li>
            <li>
              <span className="font-medium">Save note:</span> Say "save"
            </li>
            <li>
              <span className="font-medium">Cancel note:</span> Say "cancel"
            </li>
            <li>
              <span className="font-medium">Verify note:</span> Say "verify"
            </li>
          </ul>
        </div>
      </div>

      {transcript && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h4 className="font-medium">Current Transcript</h4>
          </div>
          <div className="p-4">
            <p className="text-gray-700 whitespace-pre-wrap">{transcript}</p>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-500">
        <p>
          Note: Voice recognition works best in a quiet environment. Speak clearly and at a normal pace.
          All voice recordings are processed locally before being securely transmitted.
        </p>
      </div>
    </div>
  );
} 


