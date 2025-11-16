import Joi from "joi";

const registerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(6)
    .max(128)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])"))
    .required()
    .messages({
      "string.pattern.base":
        "Password must include uppercase, lowercase, number, and special character",
    }),
  role: Joi.string().trim().lowercase().valid("user", "admin", "organizer").default("user"),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});


export {loginSchema,registerSchema};
