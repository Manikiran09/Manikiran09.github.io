import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    registrationId: {
      type: String,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "attended", "waitlisted"],
      default: "confirmed",
    },
    paymentStatus: {
      type: String,
      enum: ["free", "pending", "paid", "refunded"],
      default: "free",
    },
    paymentAmount: {
      type: Number,
      default: 0,
    },
    customFieldResponses: [
      {
        label: String,
        value: String,
      },
    ],
    checkInTime: Date,
    notes: {
      type: String,
      trim: true,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    cancelledAt: Date,
  },
  { timestamps: true }
);

// Ensure a user can register for the same event only once
registrationSchema.index({ event: 1, participant: 1 }, { unique: true });
registrationSchema.index({ registrationId: 1 });
registrationSchema.index({ status: 1 });

// Auto-generate registrationId before saving
registrationSchema.pre("save", async function (next) {
  if (!this.registrationId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    this.registrationId = `EVT-${timestamp}-${random}`;
  }
  next();
});

const Registration = mongoose.model("Registration", registrationSchema);
export default Registration;
