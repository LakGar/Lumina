import mongoose from "mongoose";

const entryTagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  color: {
    type: String,
    default: "#000000",
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

const EntryTag = mongoose.model("EntryTag", entryTagSchema);

export default EntryTag;
