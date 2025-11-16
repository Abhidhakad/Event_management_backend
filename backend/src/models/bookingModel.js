import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
            index: true, 
        },
        event_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: [true, "Event is required"],
            index: true,
        },
        ticket_id: {
            type: String,
            required: true,
            unique: true,
            default: () => uuidv4()
        },
        seats:{
            type:Number,
            required:[true,"Seats number is required"],
            default:1,
        },
        bookingDate: {
            type: Date,
            default: Date.now,
            immutable: true, // cannot be changed after creation
        },

    },
    { timestamps: true,versionKey: false, }
);

bookingSchema.index({ userId: 1, eventId: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
