import { validationResult } from "express-validator";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";

// @desc   Get all published events (with filters & pagination)
// @route  GET /api/events
export const getEvents = async (req, res) => {
  try {
    const {
      category,
      search,
      city,
      startDate,
      endDate,
      isFree,
      status,
      page = 1,
      limit = 12,
      sort = "-createdAt",
    } = req.query;

    const query = {};

    // Only admins/organizers can see non-published events via this base route
    if (!req.user || req.user.role === "user") {
      query.status = "published";
    } else if (status) {
      query.status = status;
    }

    if (category) query.category = category;
    if (isFree !== undefined) query.isFree = isFree === "true";
    if (city) query["venue.city"] = new RegExp(city, "i");
    if (startDate) query.startDate = { $gte: new Date(startDate) };
    if (endDate) query.endDate = { ...query.endDate, $lte: new Date(endDate) };

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const events = await Event.find(query)
      .populate("organizer", "name email organization")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      count: events.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      events,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get single event
// @route  GET /api/events/:id
export const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "organizer",
      "name email organization"
    );
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });

    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Create event
// @route  POST /api/events
export const createEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const eventData = { ...req.body, organizer: req.user._id };
    if (eventData.fee && eventData.fee > 0) eventData.isFree = false;

    const event = await Event.create(eventData);
    res.status(201).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update event
// @route  PUT /api/events/:id
export const updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });

    // Only organizer or admin can update
    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to update this event" });
    }

    if (req.body.fee !== undefined) {
      req.body.isFree = req.body.fee === 0;
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("organizer", "name email");

    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete event
// @route  DELETE /api/events/:id
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });

    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to delete this event" });
    }

    await Registration.deleteMany({ event: event._id });
    await event.deleteOne();

    res.json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get events by organizer
// @route  GET /api/events/my-events
export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).sort(
      "-createdAt"
    );
    res.json({ success: true, count: events.length, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get event participants (organizer/admin)
// @route  GET /api/events/:id/participants
export const getEventParticipants = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });

    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view participants",
      });
    }

    const { status, page = 1, limit = 50 } = req.query;
    const filter = { event: req.params.id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const registrations = await Registration.find(filter)
      .populate("participant", "name email phone organization")
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

// @desc   Check-in participant (organizer/admin)
// @route  PUT /api/events/:id/checkin/:registrationId
export const checkInParticipant = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });

    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const registration = await Registration.findOne({
      registrationId: req.params.registrationId,
      event: req.params.id,
    });

    if (!registration)
      return res
        .status(404)
        .json({ success: false, message: "Registration not found" });

    registration.status = "attended";
    registration.checkInTime = new Date();
    await registration.save();

    res.json({ success: true, message: "Participant checked in", registration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get stats for admin dashboard
// @route  GET /api/events/stats
export const getStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const publishedEvents = await Event.countDocuments({ status: "published" });
    const totalRegistrations = await Registration.countDocuments();
    const confirmedRegistrations = await Registration.countDocuments({
      status: "confirmed",
    });

    const categoryStats = await Event.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const upcomingEvents = await Event.countDocuments({
      startDate: { $gte: new Date() },
      status: "published",
    });

    res.json({
      success: true,
      stats: {
        totalEvents,
        publishedEvents,
        upcomingEvents,
        totalRegistrations,
        confirmedRegistrations,
        categoryStats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
