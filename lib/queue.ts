import { Queue } from "bullmq";
import { redis } from "./redis";

// Queue names
export const QUEUE_NAMES = {
  ETL: "etl-pipeline",
  CHAT: "ai-chat",
  TRANSCRIPTION: "voice-transcription",
} as const;

// ETL Queue for processing journal entries
export const etlQueue = new Queue(QUEUE_NAMES.ETL, {
  connection: redis,
});

// Chat Queue for AI chat responses
export const chatQueue = new Queue(QUEUE_NAMES.CHAT, {
  connection: redis,
});

// Transcription Queue for voice processing
export const transcriptionQueue = new Queue(QUEUE_NAMES.TRANSCRIPTION, {
  connection: redis,
});

// Job types
export interface ETLJobData {
  entryId: string;
  userId: string;
  content: string;
  voiceUrl?: string;
}

export interface ChatJobData {
  userId: string;
  message: string;
  sessionId: string;
}

export interface TranscriptionJobData {
  entryId: string;
  voiceUrl: string;
  userId: string;
}

// Export queue instances
export const queues = {
  etl: etlQueue,
  chat: chatQueue,
  transcription: transcriptionQueue,
};
