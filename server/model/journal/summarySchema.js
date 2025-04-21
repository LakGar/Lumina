import mongoose from "mongoose";

const summarySchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  keyPoints: [
    {
      type: String,
    },
  ],
  sentiment: {
    type: String,
    enum: ["positive", "negative", "neutral"],
  },
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

const Summary = mongoose.model("Summary", summarySchema);

export default Summary;
