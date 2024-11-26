import express from "express";
import {
  registerUser,
  verifyUser,
  getOTP,
  verifyOTP,
  login,
  updatePassword,
  resetPassword,
  logOut,
} from "../controllers/userController.js";

import {
  authentication,
  checkUserAlreadyRegistered,
} from "../middlewares/auth_middlewares.js";

import { validationMiddleware } from "../middlewares/validation_schema.js";
import {
  registerUserValidationSchema,
  verifyUserValidationSchema,
  getOTPValidationSchema,
  verifyOtpValidationSchema,
  loginValidationSchema,
  updatePasswordValidationSchema,
  resetPasswordValidationSchema,
} from "../validation_schemas/user.validation.schemas.js";

const router = express.Router();

// // Route to create a new user (sign-up)
// router.post("/signup", registerUser);

// router.post("/verify-user", verifyUser);

// router.get("/get-otp/:email", getOTP);

// router.post("/verify-otp", verifyOTP);
// router.post("/login", login);

// router.post("/update-password", authentication, updatePassword);

// router.post("/forget-password", resetPassword);

// router.post("/logout", authentication, logOut);

router.get(
  "/get-otp/:email",
  validationMiddleware(getOTPValidationSchema, (req) => req.params),
  getOTP
);

router.post(
  "/register",
  validationMiddleware(registerUserValidationSchema, (req) => req.body),
  checkUserAlreadyRegistered,
  registerUser
);
router.post(
  "/verify-user",
  validationMiddleware(verifyUserValidationSchema, (req) => req.body),
  verifyUser
);

router.post(
  "/verify-otp",
  validationMiddleware(verifyOtpValidationSchema, (req) => req.body),
  verifyOTP
);
router.post(
  "/login",
  validationMiddleware(loginValidationSchema, (req) => req.body),
  login
);
router.post(
  "/update-password",
  authentication,
  validationMiddleware(updatePasswordValidationSchema, (req) => req.body),
  updatePassword
);
router.post(
  "/forget-password",
  validationMiddleware(resetPasswordValidationSchema, (req) => req.body),
  resetPassword
);

router.post("/logout", authentication, logOut);

export default router;
