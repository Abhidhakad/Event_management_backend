import express from "express";

import { getAllEvents,deleteEvent } from "../controllers/eventController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import { getAllUsers } from "../controllers/authController.js";
import { verifyAdmin } from "../middlewares/adminMiddleware.js";
import { getAllBookings } from "../controllers/bookingController.js";
import { updateEventStatus } from "../controllers/eventController.js";
import { updateUserRole } from "../controllers/authController.js";

const router = express.Router();


// admin routes
router.get("/events",verifyJWT,verifyAdmin,getAllEvents);
router.get("/users",verifyJWT,verifyAdmin,getAllUsers);
router.get("/bookings",verifyJWT,verifyAdmin,getAllBookings)

router.patch("/events/:id/status", verifyJWT, verifyAdmin, updateEventStatus);
router.delete('/events/:id', verifyJWT,verifyAdmin, deleteEvent);
router.patch("/users/:id/role", verifyJWT, verifyAdmin, updateUserRole);

export default router;