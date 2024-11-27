import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import fs from "fs"
import { db } from "../../db/database.js";
import { user } from "../../db/schema/user.js";
import blackListToken from "../../db/schema/blacklisttoken.js";
import { createOTP, createJWTToken, getToken, verifyToken } from "../utils/helper.js";
import sendEmail from "../utils/sendEmail.js";
import { successResponse, errorResponse, unauthorizeResponse } from "../utils/response.handle.js";
import { registrationEmail, accountVerificationEmail, getNewOtpEmail, passwordUpdateEmail } from "../utils/emailTemplate.js";


const registerUser = async (req, res) => {
  const { first_name, last_name, email, phone, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = createOTP();
  try {
    await db.transaction(async (transaction) => {
      const data = await transaction
        .insert(user)
        .values({
          first_name,
          last_name,
          email,
          phone,
          password: hashedPassword,
          otp,
        }).$returningId()
        const verificationUrl = `http://localhost:3000/verify?email=${encodeURIComponent(
          email
        )}&otp=${otp}`;
      
      const emailContent = registrationEmail(first_name, last_name, otp, verificationUrl);
      await sendEmail("Registration Successful - Welcome!", emailContent, email);
      return successResponse(
        res,
        "User Registered Successfully! An email has been sent with OTP to your provided email."
      );
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}

const verifyUser = async (req, res) => {
  try {
    const { email, otp } = req.body

    const data = await db.query.user.findFirst({ where: eq(user.email, email) })
    if (!data) {
      return errorResponse(res, "User Not Found", 404)
    }
    if (data.is_verified) {
      return errorResponse(res, "User is Already Verified", 400)
    }
    if (otp !== data.otp) {
      return errorResponse(res, "Invalid OTP!", 400)
    }

    await db.transaction(async (transaction) => {
      await transaction
        .update(user)
        .set({ is_verified: true, otp: null, updated_at: new Date() })
        .where(eq(user.email, email))
      if (data) {
        const { first_name, last_name, email } = data;
      
        // const emailContent = accountVerificationEmail(first_name, last_name, email);
        // await sendEmail("User Verified - Congratulations!", emailContent, email);
      }
      return successResponse(
        res,
        "User verified successfully!",
        data
      );
    })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

const getNewOTP = async (req, res) => {
  try {
    const email = req.params.email
    const check = await db.query.user.findFirst({ where: eq(user.email, email) })
    if (!check) {
      return errorResponse(res, "User Not Found", 404)
    }
    const otp = createOTP()

    await db.transaction(async (transaction) => {
      const data = await transaction
        .update(user)
        .set({ otp: otp })
        .where(eq(user.email, email))
      
      if (check) {
        const { first_name, last_name, email } = check;
        const emailContent = getNewOtpEmail(first_name, last_name, otp);
        await sendEmail("Request for new OTP", emailContent, email);
      }
      
      return successResponse(
        res,
        "OTP sent successfully to your email address!"
      );
    })

  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body

    const check = await db.query.user.findFirst({ where: eq(user.email, email) })

    if (otp !== check.otp) {
      return errorResponse(res, "Invalid OTP!", 400)
    }

    await db.transaction(async (transaction) => {
      const data = await transaction
        .update(user)
        .set({ otp: null })
        .where(eq(user.email, email))
      return successResponse(
        res,
        "OTP verified successfully!"
      );
    })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const data = await db.query.user.findFirst({
      where: eq(user.email, email),
    })

    const isPasswordValid = await bcrypt.compare(password, data.password)

    if (!isPasswordValid) {
      return unauthorizeResponse(res, "Credentials are Wrong!")
    }

    const { accessToken, refreshToken } = await createJWTToken(data.id)
    return successResponse(res, "Login Successfully",
      {
        data,
        accessToken,
        refreshToken
      })
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body

    const userData = await db.query.user.findFirst({ where: eq(user.id, req.loggedInUserId) })

    const isMatch = await bcrypt.compare(oldPassword, userData.password)

    if (!isMatch) {
      return errorResponse(res, "Old Password is incorrect!", 400)
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    await db.transaction(async (transaction) => {
      const data = await transaction
        .update(user)
        .set({ password: hashedPassword, updated_at: new Date() })
        .where(eq(user.id, req.loggedInUserId))
      
      if (userData) {
        const { first_name, last_name, email } = userData;
      
        const emailContent = passwordUpdateEmail(first_name, last_name, email);
        await sendEmail("Password Updated", emailContent, email);
      }
      return successResponse(
        res,
        "Password Has Been Updated"
      );
    })

  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}


const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body

    const userData = await db.query.user.findFirst({
      where: eq(user.email, email),
    })

    const isSameAsCurrentPassword = await bcrypt.compare(newPassword, userData.password)

    if (isSameAsCurrentPassword) {
      return errorResponse(res, "Your previous password and newPassword should not be the same", 400)
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await db.transaction(async (transaction) => {
      const data = await transaction
        .update(user)
        .set({ password: hashedPassword, updated_at: new Date() })
        .where(eq(user.email, email))
      
      // if (data && data.length > 0) {
      //   const { first_name, last_name, email } = userData;
      
      //   const emailContent = passwordResetEmail(first_name, last_name, email);
      //   await sendEmail("Password Reset", emailContent, email);
      // }
      return successResponse(
        res,
        "Password Has Been reset"
      );
    })

  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

// const profilePicture = async (req, res) => {
//   try {
//     const profilePicturePath = req.file.path

//     const currentPicture = await database.query.user.findFirst({
//       where: eq(user.id, req.loggedInUserId),
//       columns: {
//         profile_picture: true,
//       },
//     })

//     if (currentPicture && currentPicture.profile_picture) {
//       if (fs.existsSync(currentPicture.profile_picture)) {
//         fs.unlinkSync(currentPicture.profile_picture)
//       }
//     }

//     const updatedUser = await database
//       .update(user)
//       .set({ profile_picture: profilePicturePath, updated_at: new Date() })
//       .where(eq(user.id, req.loggedInUserId))
//       .returning()

//     const updated_url = `/${updatedUser[0].profile_picture.replace(/^public/, "").replace(/\\/g, "/")}`
//     const percentage = calculateProfileCompletion(updatedUser[0])
//     const data = await database
//       .update(user)
//       .set({
//         profile_completion: percentage,
//         profile_picture: updated_url
//       })
//       .where(eq(user.id, req.loggedInUserId))
//       .returning()
//     return successResponse(res, "Profile picture is set successfully!", data)
//   } catch (error) {
//     return errorResponse(res, error.message, 500)
//   }
// }

//Logout API It will delete the token from Bearer header

const logOut = async (req, res) => {
  try {
    const token = getToken(req)
    const decodedToken = verifyToken(token)
    if (!token) {
      return unauthorizeResponse(res, "Authentication token is required")
    }

    const data = await database.insert(blackListToken).values({ token, expire_time: decodedToken.exp })
    return successResponse(res, "Log out successfully")
  } catch (error) {
    return errorResponse(res, error.message, 500)
  }
}

export {
  registerUser,
  verifyUser,
  getNewOTP,
  verifyOTP,
  login,
  updatePassword,
  resetPassword,
  logOut,
};
