import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Event title is required"],
            trim: true,
            maxlength: [150, "Title cannot exceed 150 characters"],
            minlength: [3, "Title must be at least 3 characters long"],
            index: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
            minlength: [10, "Description must be at least 10 characters long"],
        },
        date: {
            type: Date,
            required: [true, "Date is required"],
            validate: {
                validator: function (value) {
                    return value > new Date();
                },
                message: "Event date must be in the future",
            },
        },
        location: {
            type: String,
            required: [true, "Location is required"],
            trim: true,
        },
        totalSeats: {
            type: Number,
            required: [true, "Seats are required"],
            min: [1, "At least one seat is required"],
        },
        seatsAvailable: {
            type: Number,
            required: true,
            min: [0, "Seats available cannot be negative"],
            default: function () {
                return this.totalSeats;
            },
        },
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Organizer is required"],
        },
        imageUrl: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            required: true,
            default: "pending",
        }
    },
    { timestamps: true }
);


eventSchema.pre("save", function (next) {
    if (this.date < new Date()) {
        return next(new Error("Event date must be in the future"));
    }
    next();
});

const Event = mongoose.model('Event', eventSchema);
export default Event;
