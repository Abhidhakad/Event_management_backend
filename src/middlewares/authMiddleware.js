import jwt from "jsonwebtoken";
import User from "../models/userModel.js";


export const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded._id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const authorize = (...roles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized: No user information found. Please login again.",
                });
            }

            if (!roles.includes(req.user?.role)) {
                console.log(
                    `Access denied for user ${req.user._id} with role ${req.user.role}`
                );
                return res.status(403).json({
                    success: false,
                    message: "Forbidden: You do not have permission to access this resource.",
                });
            }
            next();
        } catch (error) {
            console.error("Error in authorize middleware:", error.message);
            return res.status(500).json({
                success: false,
                message: "Server error while authorizing user.",
            });
        }
    }
}