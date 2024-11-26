import { z } from "zod";

const passwordContainsMixture = (value) => {
  if (typeof value !== "string") return false;
  const containsNumber = /\d/.test(value);
  const containsCharacter = /[a-zA-Z]/.test(value);
  return containsNumber && containsCharacter;
};
// Define validation schema for user registration/ These schemas help ensure that incoming data to the API endpoints meets specified criteria
const registerUserValidationSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(1)
    .regex(/^[A-Za-z\s]+$/),
  last_name: z
    .string()
    .trim()
    .min(1)
    .regex(/^[A-Za-z\s]+$/),
  email: z.string().trim().min(1).email(),
  phone: z.string().trim().min(11).max(15).regex(/^\d+$/),
  password: z.string().trim().min(8).refine(passwordContainsMixture, {
    message: "Password must be a mixture of numbers and characters",
  }),
});
// Define validation schema for user Verification
const verifyUserValidationSchema = z.object({
  email: z.string().min(1).email(),
  otp: z.string().min(6).max(7),
});
// Define validation schema for getting OTP
const getOTPValidationSchema = z.object({
  email: z.string().min(1).email(),
});
// Define validation schema for Verifying OTP
const verifyOtpValidationSchema = z.object({
  email: z.string().min(1).email(),
  otp: z.string().min(6).max(7),
});
// Define validation schema for login
const loginValidationSchema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(8),
});
// Define Validation schema for update Password Endpoint
const updatePasswordValidationSchema = z
  .object({
    oldPassword: z.string().min(8),
    newPassword: z.string().min(8).refine(passwordContainsMixture, {
      message: "Password must be a mixture of numbers and characters",
    }),
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must be different from the old password",
  });
// Define Validation Schema for reset-password endpoint
const resetPasswordValidationSchema = z.object({
  email: z.string().email().min(1),
  newPassword: z.string().min(8).refine(passwordContainsMixture, {
    message: "Password must be a mixture of numbers and characters",
  }),
  otp: z.string().min(6).max(7),
});

export {
  registerUserValidationSchema,
  verifyUserValidationSchema,
  getOTPValidationSchema,
  verifyOtpValidationSchema,
  loginValidationSchema,
  updatePasswordValidationSchema,
  resetPasswordValidationSchema,
};
