import mongoose from "mongoose";

const journalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  rawContent: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: false,
  },
  moodScore: {
    type: Number,
    required: false,
  },
  wasVoiceNote: {
    type: Boolean,
    default: false,
  },
  wordCount: {
    type: Number,
    required: false,
  },
  tags: {
    type: [mongoose.Schema.ObjectId],
    ref: "EntryTag",
    required: false,
  },
  emotionalLabels: {
    type: [mongoose.Schema.ObjectId],
    ref: "EmotionalLabel",
    required: false,
  },
  voiceRecording: {
    type: mongoose.Schema.ObjectId,
    ref: "VoiceRecording",
    required: false,
  },
  summary: {
    type: mongoose.Schema.ObjectId,
    ref: "Summary",
    required: false,
  },
  reflection: {
    type: mongoose.Schema.ObjectId,
    ref: "Reflection",
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Journal = mongoose.model("Journal", journalSchema);

export default Journal;
