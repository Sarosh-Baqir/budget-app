import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../../db/database.js";
import { user } from "../../db/schema/user.js";
import blackListToken from "../../db/schema/blacklisttoken.js";
import {
  createOTP,
  createJWTToken,
  getToken,
  verifyToken,
} from "../utils/helper.js";
import sendEmail from "../utils/sendEmail.js";

import {
  successResponse,
  errorResponse,
  unauthorizeResponse,
} from "../utils/response.handle.js";

// API to register a new user
const registerUser = async (req, res) => {
  //console.log("in register controller");
  try {
    const { first_name, last_name, email, phone, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = createOTP();
    //console.log("otp: ", otp);

    try {
      await sendEmail(
        "Registration Request",
        `Hello ${first_name}`,
        `<h1>Hello ${first_name} ${last_name}</h1><p>Thank you for registering with us!</p><p>Your OTP for registration is <strong>${otp}</strong>.</p>`,
        email
      );

      const data = await db
        .insert(user)
        .values({
          first_name,
          last_name,
          email,
          phone,
          password: hashedPassword,
          otp,
        })
        .$returningId();

      return successResponse(
        res,
        "User Registered Successfully! An email has been sent with otp to your provided email.",
        {
          data,
        }
      );
    } catch (error) {
      return errorResponse(
        res,
        `Error in sending email = ${error.message}`,
        400
      );
    }
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// After Registration Verify the User
const verifyUser = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const data = await db.query.user.findFirst({
      where: eq(user.email, email),
    });
    //console.log("data: ", data);
    if (!data) {
      return errorResponse(res, "User Not Found", 404);
    }
    if (data.is_verified) {
      return errorResponse(res, "User is Already Verified", 400);
    }
    if (otp !== data.otp) {
      return errorResponse(res, "Invalid OTP!", 400);
    }

    try {
      await sendEmail(
        "Account Verification",
        `Hello ${data.first_name}`,
        `<h1>Hello ${data.first_name} ${data.last_name}</h1><h3>Hurray! Congratulations.</h3><p>Your account has been verified. Now you can login to the system.</p>`,
        data.email
      );
      await db
        .update(user)
        .set({ is_verified: true, otp: null })
        .where(eq(user.email, email));

      return successResponse(res, "User verified successfully!", email);
    } catch (error) {
      return errorResponse(
        res,
        `Error in sending email = ${error.message}`,
        400
      );
    }
    // const updatedUser = await database
    //     .update(user)
    //     .set({ is_verified: true, otp: null })
    //     .where(eq(user.email, email))
    //     .returning({ id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email, is_verified: user.is_verified })

    //   return successResponse(res, "User verified successfully!", updatedUser)
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get Otp
const getOTP = async (req, res) => {
  try {
    console.log("in getOTP controller");
    const email = req.params.email;
    console.log("email in params: ", email);
    const data = await db.query.user.findFirst({
      where: eq(user.email, email),
    });
    console.log(data);
    if (!data) {
      return errorResponse(res, "User Not Found", 404);
    }
    const newOtp = createOTP();

    try {
      await sendEmail(
        "New OTP Request",
        `Hello ${data.first_name}`,
        `<h1>Hello ${data.first_name} ${data.last_name}</h1><p>You request for a new otp!!</p><p>Your OTP is <strong>${newOtp}</strong>.</p>`,
        data.email
      );

      await db.update(user).set({ otp: newOtp }).where(eq(user.email, email));
      return successResponse(res, "OTP sent successfully!", newOtp);
    } catch (error) {
      return errorResponse(
        res,
        `Error in sending email = ${error.message}`,
        400
      );
    }

    //     const otp = await database.update(user).set({ otp: newOtp }).where(eq(user.email, email)).returning({ otp: user.otp })
    // return successResponse(res, "OTP sent successfully!", otp)
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  console.log("in verify otp controller");
  try {
    const { email, otp } = req.body;

    const data = await db.query.user.findFirst({
      where: eq(user.email, email),
      columns: {
        email: true,
        otp: true,
      },
    });
    console.log("data: ", data);

    if (!data) {
      return errorResponse(res, "Not Found", 404);
    }
    if (otp !== data.otp) {
      return errorResponse(res, "Invalid OTP", 400);
    }

    await db.update(user).set({ otp: null }).where(eq(user.email, email));

    return successResponse(res, "OTP verified successfully!", email);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// API for loggingIn
const login = async (req, res) => {
  console.log("in login controller");
  try {
    const { email, password } = req.body;

    const data = await db.query.user.findFirst({
      where: eq(user.email, email),
    });
    console.log(data);
    if (!data) {
      return unauthorizeResponse(res, "User not Registered!");
    }

    if (!data.is_verified) {
      return errorResponse(res, "User not verified", 403);
    }

    const isPasswordValid = await bcrypt.compare(password, data.password);

    if (!isPasswordValid) {
      return unauthorizeResponse(res, "Credentials are Wrong!");
    }

    const token = await createJWTToken(data.id);
    return successResponse(res, "Login Successfully", { data, token });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Any user will Update his password
const updatePassword = async (req, res) => {
  console.log("in update password controller");
  try {
    const { oldPassword, newPassword } = req.body;

    const data = await db.query.user.findFirst({
      where: eq(user.id, req.loggedInUserId),
    });

    const isMatch = await bcrypt.compare(oldPassword, data.password);

    if (!isMatch) {
      return errorResponse(res, "Old Password is incorrect!", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    try {
      // await sendEmail(
      //   "Password Updated Successfully!",
      //   `Hello ${data.first_name}`,
      //   `<h1>Hello ${data.first_name} ${data.last_name}</h1><p>Your Password has been updated against ${data.email}!</p>`,
      //   data.email
      // );

      await db
        .update(user)
        .set({ password: hashedPassword })
        .where(eq(user.id, req.loggedInUserId));

      return successResponse(
        res,
        "Password is updated, and email has been sent.",
        email
      );
    } catch (error) {
      return errorResponse(
        res,
        `Error in sending email = ${error.message}`,
        400
      );
    }

    //       const updatedUser = await database
    //   .update(user)
    //   .set({ password: hashedPassword })
    //   .where(eq(user.id, req.loggedInUserId))
    //   .returning({ id: user.id, email: user.email })

    // return successResponse(res, "Password is updated", updatedUser)
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// First send request to get-otp and then verify-otp and then reset-password
const resetPassword = async (req, res) => {
  console.log("in reset password controller");
  try {
    const { email, newPassword, otp } = req.body;

    const data = await db.query.user.findFirst({
      where: eq(user.email, email),
      columns: {
        id: true,
        is_verified: true,
        otp: true,
        password: true,
        first_name: true,
        last_name: true,
        email: true,
      },
    });
    console.log(data);

    if (!data) {
      return errorResponse(res, "User Not Found", 404);
    }

    if (!data.is_verified) {
      return errorResponse(res, "Account is not verified", 403);
    }
    if (data.otp !== otp) {
      return errorResponse(res, "Invalid Otp!", 400);
    }

    const isSameAsCurrentPassword = await bcrypt.compare(
      newPassword,
      data.password
    );

    if (isSameAsCurrentPassword) {
      return errorResponse(
        res,
        "Your previous password and newPassword should not be the same",
        400
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // try {
    //   await sendEmail("Password Reset Successfully!", `Hello ${data.first_name}`, `<h1>Hello ${data.first_name} ${data.last_name}</h1><p>Your Password has been updated against ${data.email}!</p>`, data.email);
    //   const updatedUser = await database
    //     .update(user)
    //     .set({ password: hashedPassword })
    //     .where(eq(user.email, email))
    //     .returning({ id: user.id, email: user.email })

    //   return successResponse(res, "Password is Reset", updatedUser)
    // } catch (error) {
    //   return errorResponse(res, `Error in sending email = ${error.message}`, 400);
    // }

    const updatedUser = await db
      .update(user)
      .set({ password: hashedPassword })
      .where(eq(user.email, email));

    return successResponse(res, "Password is Reset", updatedUser);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

//Logout API It will delete the token from Bearer header
const logOut = async (req, res) => {
  try {
    const token = getToken(req);
    const decodedToken = verifyToken(token);
    if (!token) {
      return unauthorizeResponse(res, "Authentication token is required");
    }

    const data = await db
      .insert(blackListToken)
      .values({ token, expire_time: decodedToken.exp });
    return successResponse(res, "Log out successfully", data);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export {
  registerUser,
  verifyUser,
  getOTP,
  verifyOTP,
  login,
  updatePassword,
  resetPassword,
  logOut,
};
