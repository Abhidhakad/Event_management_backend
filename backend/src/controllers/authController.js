import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateAccessAndRefreshTokens } from "../utils/token.js";
import cookieOptions from "../config/cookieOptions.js";
import { registerSchema, loginSchema } from "../validators/authValidation.js"




export const registerUser = async (req, res) => {
    try {
        const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.map((detail) => detail.message);
            return res.status(400).json({ error: errors, success: false });
        }

        const { name, email, password, role } = value;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: "User already registered", success: false });
        }

        const user = await User.create({ name, email, password, role });
        if (!user) {
            return res.status(500).json({ error: "Internal server error", success: false });
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(201)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                accessToken,
                message: "User registered successfully.",
                success: true,
            });
    } catch (error) {
        console.error("Error in registerUser:", error.message);
        res.status(500).json({ error: "Internal server error", success: false });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({ message: "Invalid credentials", success: false });
        }

        const { email, password } = value;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials", success: false });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials", success: false });
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json({
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                accessToken,
                message: "User logged in successfully.",
                success: true,
            });
    } catch (error) {
        console.error("Error in loginUser:", error.message);
        res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const refreshAccessToken = async (req, res) => {
    try {

        const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;


        if (!incomingRefreshToken) {
            return res.status(401).json({ message: "Unauthorized: No refresh token provided" });
        }

        let decodedToken;
        try {
            decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        } catch (err) {
            return res.status(401).json({ message: "Unauthorized: Invalid or expired refresh token" });
        }


        const user = await User.findById(decodedToken._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user?.refreshToken !== incomingRefreshToken) {
            return res.status(403).json({ message: "Forbidden: Refresh token does not match" });
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);
        user.refreshToken = newRefreshToken;
        await user.save();
        res
            .cookie("refreshToken", newRefreshToken, cookieOptions)
            .status(200)
            .json({
                accessToken,
                message: "Access token refreshed successfully",
            });

    } catch (error) {
        console.error("Error in refreshAccessToken:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


export const getAllUsers = async (req, res) => {
    try {
        const adminId = req.user.id;
        const users = await User.find({ _id: { $ne: adminId } }).select("-password");
        res.status(200).json(
            users,
        );
    } catch (error) {
        console.error("Error fetching all users:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal Server Error while fetching users.",
        });
    }
};


export const updateUserRole = async (req, res) => {
    try {
        const userId = req.params.id;
        const { role } = req.body;

        if (!role || !["user", "organizer", "admin"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role. Must be 'user', 'organizer', or 'admin'.",
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        user.role = role;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User role updated to '${role}'`,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while updating user role",
        });
    }
};


export const logoutUser = async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    refreshToken: '',
                },
            },
            { new: true }
        );

        return res
            .status(200)
            .clearCookie("refreshToken", cookieOptions)
            .json({ message: "Logged out successfully", success: true });
    }
    catch (error) {
        console.error("Error in logoutUser:", error.message);
        res.status(500).json({ message: "Internal Server Error", success: false });
    }
}
