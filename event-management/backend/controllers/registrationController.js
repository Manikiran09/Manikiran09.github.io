import Registration from "../models/Registration.js";
import Event from "../models/Event.js";

// @desc   Register for an event
// @route  POST /api/registrations
export const registerForEvent = async (req, res) => {
  const { eventId, customFieldResponses, notes } = req.body;

  try {
    const event = await Event.findById(eventId);
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });

    if (event.status !== "published")
      return res
        .status(400)
        .json({ success: false, message: "Event is not accepting registrations" });

    if (new Date() > new Date(event.registrationDeadline))
      return res
        .status(400)
        .json({ success: false, message: "Registration deadline has passed" });

    if (event.registeredCount >= event.capacity)
      return res
        .status(400)
        .json({ success: false, message: "Event is at full capacity" });

    // Check for duplicate registration
    const existing = await Registration.findOne({
      event: eventId,
      participant: req.user._id,
    });
    if (existing && existing.status !== "cancelled")
      return res.status(400).json({
        success: false,
        message: "You are already registered for this event",
      });

    // If previously cancelled, update instead of creating new
    if (existing && existing.status === "cancelled") {
      existing.status = "confirmed";
      existing.customFieldResponses = customFieldResponses || [];
      existing.notes = notes;
      existing.cancellationReason = undefined;
      existing.cancelledAt = undefined;
      await existing.save();

      await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: 1 } });

      return res.status(200).json({
        success: true,
        message: "Re-registered successfully",
        registration: existing,
      });
    }

    const registration = await Registration.create({
      event: eventId,
      participant: req.user._id,
      customFieldResponses: customFieldResponses || [],
      paymentStatus: event.isFree ? "free" : "pending",
      paymentAmount: event.fee || 0,
      notes,
    });

    // Increment event registeredCount
    await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: 1 } });

    await registration.populate("event", "title startDate venue");
    await registration.populate("participant", "name email");

    res.status(201).json({
      success: true,
      message: "Registered successfully",
      registration,
    });
  } catch (error) {
    if (error.code === 11000)
      return res
        .status(400)
        .json({ success: false, message: "Already registered for this event" });
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Cancel registration
// @route  PUT /api/registrations/:id/cancel
export const cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration)
      return res
        .status(404)
        .json({ success: false, message: "Registration not found" });

    if (registration.participant.toString() !== req.user._id.toString())
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });

    if (registration.status === "cancelled")
      return res
        .status(400)
        .json({ success: false, message: "Registration is already cancelled" });

    registration.status = "cancelled";
    registration.cancellationReason = req.body.reason || "";
    registration.cancelledAt = new Date();
    await registration.save();

    await Event.findByIdAndUpdate(registration.event, {
      $inc: { registeredCount: -1 },
    });

    res.json({ success: true, message: "Registration cancelled", registration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get my registrations
// @route  GET /api/registrations/my
export const getMyRegistrations = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { participant: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const registrations = await Registration.find(filter)
      .populate({
        path: "event",
        select: "title startDate endDate venue category banner status",
      })
      .sort("-createdAt")
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Registration.countDocuments(filter);

    res.json({
      success: true,
      count: registrations.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      registrations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get a single registration by ID
// @route  GET /api/registrations/:id
export const getRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate("event", "title startDate endDate venue category")
      .populate("participant", "name email phone organization");

    if (!registration)
      return res
        .status(404)
        .json({ success: false, message: "Registration not found" });

    // Only the participant, event organizer or admin can view
    const event = await Event.findById(registration.event._id);
    if (
      registration.participant._id.toString() !== req.user._id.toString() &&
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    res.json({ success: true, registration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all registrations (admin)
// @route  GET /api/registrations
export const getAllRegistrations = async (req, res) => {
  try {
    const { status, eventId, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (eventId) filter.event = eventId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const registrations = await Registration.find(filter)
      .populate("event", "title startDate")
      .populate("participant", "name email organization")
      .sort("-createdAt")
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Registration.countDocuments(filter);

    res.json({
      success: true,
      count: registrations.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      registrations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update registration status (admin / organizer)
// @route  PUT /api/registrations/:id/status
export const updateRegistrationStatus = async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ["pending", "confirmed", "cancelled", "attended", "waitlisted"];

  if (!allowedStatuses.includes(status))
    return res
      .status(400)
      .json({ success: false, message: "Invalid status value" });

  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration)
      return res
        .status(404)
        .json({ success: false, message: "Registration not found" });

    const event = await Event.findById(registration.event);
    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const prevStatus = registration.status;
    registration.status = status;
    if (status === "attended" && !registration.checkInTime) {
      registration.checkInTime = new Date();
    }
    await registration.save();

    // Adjust count if status changed to/from cancelled
    if (prevStatus === "cancelled" && status !== "cancelled") {
      await Event.findByIdAndUpdate(registration.event, {
        $inc: { registeredCount: 1 },
      });
    } else if (prevStatus !== "cancelled" && status === "cancelled") {
      await Event.findByIdAndUpdate(registration.event, {
        $inc: { registeredCount: -1 },
      });
    }

    res.json({ success: true, registration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
