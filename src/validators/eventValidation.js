import Joi from "joi";

export const eventValidationSchema = Joi.object({
    title: Joi.string()
        .min(3)
        .max(150)
        .required()
        .messages({
            "string.empty": "Event title is required",
            "string.min": "Title must be at least 3 characters long",
            "string.max": "Title cannot exceed 150 characters",
        }),

    description: Joi.string()
        .min(10)
        .required()
        .messages({
            "string.empty": "Description is required",
            "string.min": "Description must be at least 10 characters long",
        }),

    date: Joi.date()
        .greater("now")
        .required()
        .messages({
            "date.base": "Invalid date format",
            "date.greater": "Event date must be in the future",
            "any.required": "Date is required",
        }),

    location: Joi.string()
        .required()
        .messages({
            "string.empty": "Location is required",
        }),

    seats: Joi.number()
        .integer()
        .min(1)
        .required()
        .messages({
            "number.base": "Seats must be a number",
            "number.min": "At least one seat is required",
            "any.required": "Seats are required",
        }),
    imageUrl: Joi.string().uri().allow('').optional()
});


export const updateEventValidationSchema = Joi.object({
    title: Joi.string().trim().min(3).max(150),
    description: Joi.string().trim().min(10),
    date: Joi.date().greater("now"),
    location: Joi.string().trim(),
    totalSeats: Joi.number().min(1),
}).min(1);
