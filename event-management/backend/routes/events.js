import express from "express";
import { body } from "express-validator";
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
  getEventParticipants,
  checkInParticipant,
  getStats,
} from "../controllers/eventController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public (optionally authenticated for role-based filtering)
router.get("/", (req, res, next) => {
  // Attach user if token present, but don't require it
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    protect(req, res, () => next());
  } else {
    next();
  }
}, getEvents);

router.get("/stats", protect, authorize("admin", "organizer"), getStats);
router.get("/my-events", protect, authorize("admin", "organizer"), getMyEvents);
router.get("/:id", getEvent);

// Organizer/Admin routes
router.post(
  "/",
  protect,
  authorize("admin", "organizer"),
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("category").notEmpty().withMessage("Category is required"),
    body("startDate").isISO8601().withMessage("Valid start date required"),
    body("endDate").isISO8601().withMessage("Valid end date required"),
    body("registrationDeadline")
      .isISO8601()
      .withMessage("Valid registration deadline required"),
    body("capacity")
      .isInt({ min: 1 })
      .withMessage("Capacity must be at least 1"),
    body("venue.name").notEmpty().withMessage("Venue name is required"),
    body("venue.city").notEmpty().withMessage("Venue city is required"),
  ],
  createEvent
);

router.put("/:id", protect, authorize("admin", "organizer"), updateEvent);
router.delete("/:id", protect, authorize("admin", "organizer"), deleteEvent);

router.get(
  "/:id/participants",
  protect,
  authorize("admin", "organizer"),
  getEventParticipants
);

router.put(
  "/:id/checkin/:registrationId",
  protect,
  authorize("admin", "organizer"),
  checkInParticipant
);

export default router;
