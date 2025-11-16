import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        maxlength: [50, "Name cannot exceed 50 characters"],
        minLength: [3, "Name cannot be less than 3 characters"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (email) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            },
            message: "Please provide a valid email address",
        },
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
        type: String,
        enum: ['user', 'organizer', 'admin'],
        default: 'user',
    },
     refreshToken: {
            type: String
        }
}, { timestamps: true })



userSchema.pre("save", async function (next) {
    try {
        if (!this.isModified("password")) {
            return next();
        }
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
        next();
    } catch (error) {
        next(error);
    }
});



userSchema.methods.generateAccessToken = function () {
    try {
        const token = jwt.sign(
            { _id:this._id, userType:this.role },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY
            })
        return token;
    } catch (error) {
        console.error("Error generating auth token:", error);
        throw new Error("Failed to generate auth token");
    }
}


userSchema.methods.generateRefreshToken = function () {
    try {
        return jwt.sign(
            { _id:this._id, userType:this.role },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY
            }
        )
    } catch (error) {
        console.error("Error generating auth token:", error);
        throw new Error("Failed to generate auth token");
    }
}

const User = mongoose.model('User', userSchema);
export default User;