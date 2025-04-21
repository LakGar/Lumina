import mongoose from "mongoose";

const voiceRecordingSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  format: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const VoiceRecording = mongoose.model("VoiceRecording", voiceRecordingSchema);

export default VoiceRecording;
