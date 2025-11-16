import express from "express";
import { verifyJWT }  from "../middlewares/authMiddleware.js";
import { createBooking,getMyBookings,cancelBooking } from "../controllers/bookingController.js";



const router = express.Router();


router.get("/my",verifyJWT, getMyBookings);

router.post("/", verifyJWT, createBooking);

router.delete("/:id", verifyJWT, cancelBooking);

export default router;