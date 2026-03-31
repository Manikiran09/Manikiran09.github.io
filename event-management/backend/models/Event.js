import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Event category is required"],
      enum: [
        "Conference",
        "Workshop",
        "Seminar",
        "Hackathon",
        "Cultural",
        "Sports",
        "Networking",
        "Webinar",
        "Exhibition",
        "Other",
      ],
    },
    banner: {
      type: String,
      default: "",
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    venue: {
      name: { type: String, required: true },
      address: { type: String },
      city: { type: String, required: true },
      state: { type: String },
      country: { type: String, default: "India" },
      isOnline: { type: Boolean, default: false },
      onlineLink: { type: String },
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    registrationDeadline: {
      type: Date,
      required: [true, "Registration deadline is required"],
    },
    capacity: {
      type: Number,
      required: [true, "Event capacity is required"],
      min: [1, "Capacity must be at least 1"],
    },
    registeredCount: {
      type: Number,
      default: 0,
    },
    fee: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFree: {
      type: Boolean,
      default: true,
    },
    tags: [{ type: String, trim: true }],
    agenda: [
      {
        time: String,
        title: String,
        speaker: String,
        description: String,
      },
    ],
    speakers: [
      {
        name: { type: String },
        bio: { type: String },
        designation: { type: String },
        photo: { type: String },
      },
    ],
    status: {
      type: String,
      enum: ["draft", "published", "cancelled", "completed"],
      default: "published",
    },
    customFields: [
      {
        label: String,
        fieldType: {
          type: String,
          enum: ["text", "email", "number", "select", "checkbox"],
          default: "text",
        },
        options: [String],
        required: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

// Virtual: availableSlots
eventSchema.virtual("availableSlots").get(function () {
  return this.capacity - this.registeredCount;
});

// Virtual: isFull
eventSchema.virtual("isFull").get(function () {
  return this.registeredCount >= this.capacity;
});

eventSchema.set("toJSON", { virtuals: true });
eventSchema.set("toObject", { virtuals: true });

// Index for search
eventSchema.index({ title: "text", description: "text", tags: "text" });
eventSchema.index({ startDate: 1, status: 1 });
eventSchema.index({ category: 1 });

const Event = mongoose.model("Event", eventSchema);
export default Event;
