import mongoose from "mongoose";

const preferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  theme: {
    type: String,
    default: "dark",
  },
  language: {
    type: String,
    default: "en",
  },
  fontSize: {
    type: String,
    default: "medium",
  },
  fontFamily: {
    type: String,
    default: "sans-serif",
  },
  fontWeight: {
    type: String,
    default: "normal",
  },
  fontColor: {
    type: String,
    default: "#000000",
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

const Preference = mongoose.model("Preference", preferenceSchema);

export default Preference;
