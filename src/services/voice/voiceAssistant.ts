/**
 * @fileoverview Voice Assistant Service for Care Home Documentation
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

interface VoiceCommand {
  command: string;
  context: {
    module: string;
    section?: string;
    residentId?: string;
    medicationId?: string;
  };
  timestamp: string;
}

interface TranscriptionResult {
  text: string;
  confidence: number;
  segments: {
    text: string;
    start: number;
    end: number;
    confidence: number;
  }[];
}

interface DocumentationUpdate {
  id: string;
  type: 'NOTE' | 'MEDICATION' | 'CARE_PLAN' | 'ASSESSMENT';
  content: string;
  metadata: {
    residentId?: string;
    medicationId?: string;
    careHomeId: string;
    recordedBy: string;
    transcriptionConfidence: number;
  };
  status: 'DRAFT' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export class VoiceAssistant {
  private recognition: any;
  private isListening: boolean = false;
  private commandBuffer: string[] = [];
  private currentContext: VoiceCommand['context'] = { module: 'general' };

  constructor() {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      // @ts-ignore
      this.recognition = new webkitSpeechRecognition();
      this.setupRecognition();
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-GB';

    this.recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;
        
        if (event.results[i].isFinal) {
          this.processTranscript({
            text: transcript,
            confidence,
            segments: [{
              text: transcript,
              start: 0,
              end: transcript.length,
              confidence,
            }],
          });
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
    };
  }

  async startListening(context?: VoiceCommand['context']): Promise<void> {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported in this browser');
    }

    if (context) {
      this.currentContext = context;
    }

    if (!this.isListening) {
      this.isListening = true;
      this.recognition.start();
    }
  }

  async stopListening(): Promise<void> {
    if (this.isListening) {
      this.isListening = false;
      this.recognition.stop();
    }
  }

  private async processTranscript(result: TranscriptionResult): Promise<void> {
    // Check for commands
    if (this.isCommand(result.text)) {
      await this.executeCommand({
        command: result.text,
        context: this.currentContext,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Process as documentation
    await this.createDocumentationUpdate({
      id: crypto.randomUUID(),
      type: this.determineDocumentationType(this.currentContext),
      content: result.text,
      metadata: {
        ...this.currentContext,
        careHomeId: this.currentContext.module,
        recordedBy: 'voice-assistant',
        transcriptionConfidence: result.confidence,
      },
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
    });
  }

  private isCommand(text: string): boolean {
    const commandPrefixes = ['start', 'stop', 'switch to', 'save', 'cancel', 'verify'];
    return commandPrefixes.some(prefix => text.toLowerCase().startsWith(prefix));
  }

  private async executeCommand(command: VoiceCommand): Promise<void> {
    const text = command.command.toLowerCase();

    if (text.startsWith('switch to')) {
      const module = text.replace('switch to', '').trim();
      this.currentContext = { ...this.currentContext, module };
      await this.announceContextChange(module);
      return;
    }

    if (text === 'save') {
      await this.saveCurrentDocumentation();
      return;
    }

    if (text === 'cancel') {
      await this.cancelCurrentDocumentation();
      return;
    }

    if (text === 'verify') {
      await this.verifyCurrentDocumentation();
      return;
    }
  }

  private determineDocumentationType(context: VoiceCommand['context']): DocumentationUpdate['type'] {
    switch (context.module) {
      case 'medications':
        return 'MEDICATION';
      case 'care-plans':
        return 'CARE_PLAN';
      case 'assessments':
        return 'ASSESSMENT';
      default:
        return 'NOTE';
    }
  }

  private async announceContextChange(module: string): Promise<void> {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`Switched to ${module} module`);
      window.speechSynthesis.speak(utterance);
    }
  }

  private async createDocumentationUpdate(update: DocumentationUpdate): Promise<void> {
    try {
      const response = await fetch('/api/documentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      });

      if (!response.ok) {
        throw new Error('Failed to create documentation update');
      }
    } catch (error) {
      console.error('Failed to create documentation update:', error);
      // Store locally for retry
      this.storeForRetry(update);
    }
  }

  private async saveCurrentDocumentation(): Promise<void> {
    // Implementation for saving current documentation
  }

  private async cancelCurrentDocumentation(): Promise<void> {
    // Implementation for canceling current documentation
  }

  private async verifyCurrentDocumentation(): Promise<void> {
    // Implementation for verifying current documentation
  }

  private storeForRetry(update: DocumentationUpdate): void {
    // Store failed updates for retry when online
    const retryQueue = JSON.parse(localStorage.getItem('voiceAssistantRetryQueue') || '[]');
    retryQueue.push(update);
    localStorage.setItem('voiceAssistantRetryQueue', JSON.stringify(retryQueue));
  }

  async processRetryQueue(): Promise<void> {
    const retryQueue = JSON.parse(localStorage.getItem('voiceAssistantRetryQueue') || '[]');
    if (retryQueue.length === 0) return;

    const newQueue = [];
    for (const update of retryQueue) {
      try {
        await this.createDocumentationUpdate(update);
      } catch (error) {
        newQueue.push(update);
      }
    }

    localStorage.setItem('voiceAssistantRetryQueue', JSON.stringify(newQueue));
  }
} 


