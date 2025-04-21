import mongoose from "mongoose";

const emotionalLabelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  emoji: {
    type: String,
    required: true,
  },
  intensity: {
    type: Number,
    min: 1,
    max: 5,
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

const EmotionalLabel = mongoose.model("EmotionalLabel", emotionalLabelSchema);

export default EmotionalLabel;
