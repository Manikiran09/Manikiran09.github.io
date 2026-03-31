import express from "express";
import {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getRegistration,
  getAllRegistrations,
  updateRegistrationStatus,
} from "../controllers/registrationController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, registerForEvent);
router.get("/my", protect, getMyRegistrations);
router.get("/", protect, authorize("admin", "organizer"), getAllRegistrations);
router.get("/:id", protect, getRegistration);
router.put("/:id/cancel", protect, cancelRegistration);
router.put(
  "/:id/status",
  protect,
  authorize("admin", "organizer"),
  updateRegistrationStatus
);

export default router;
