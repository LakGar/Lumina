import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      "login",
      "logout",
      "create_entry",
      "edit_entry",
      "delete_entry",
      "add_tag",
      "add_emotion",
    ],
  },
  details: {
    type: Object,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;
