import mongoose from "mongoose";

const reflectionSchema = new mongoose.Schema({
  insights: [
    {
      type: String,
    },
  ],
  suggestions: [
    {
      type: String,
    },
  ],
  patterns: [
    {
      type: String,
    },
  ],
  journalId: {
    type: mongoose.Schema.ObjectId,
    ref: "Journal",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Reflection = mongoose.model("Reflection", reflectionSchema);

export default Reflection;
