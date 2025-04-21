import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  plan: {
    type: String,
    required: true,
    enum: ["free", "premium", "enterprise"],
  },
  status: {
    type: String,
    required: true,
    enum: ["active", "cancelled", "expired", "trial"],
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  features: [
    {
      type: String,
    },
  ],
  paymentMethod: {
    type: String,
    enum: ["credit_card", "paypal", "apple_pay", "google_pay"],
  },
  lastBillingDate: {
    type: Date,
  },
  nextBillingDate: {
    type: Date,
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

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
