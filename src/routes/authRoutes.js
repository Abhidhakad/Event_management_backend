import express from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser, } from "../controllers/authController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const authRouter = express.Router();


authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.get("/refreshtoken", refreshAccessToken);
authRouter.post("/logout", verifyJWT, logoutUser);
authRouter.get("/me", verifyJWT, (req, res) => {
     const user = req?.user;
     res.status(200).json({
          user: {
               id: user._id,
               name: user.name,
               email: user.email,
               role: user.role,
          },
     })
})

// // authRouter.get("/profile", authMiddleware, getProfile);


export default authRouter;

