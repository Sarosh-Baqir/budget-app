import jwt from "jsonwebtoken";
import { JWT_PRIVATE_KEY, JWT_ACCESS_EXPIRATION_TIME, JWT_REFRESH_EXPIRATION_TIME } from "./constants.js";
import { db } from "../../db/database.js";
import { budget } from "../../db/schema/budget.js";
import { eq } from "drizzle-orm";
import { category } from "../../db/schema/category.js";
import { label } from "../../db/schema/label.js";

const createOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const createJWTToken = async (payload) => {
  try {
    const accessToken = await jwt.sign(
      { id: payload, tokenType:"access" },
      JWT_PRIVATE_KEY,
      { expiresIn: JWT_ACCESS_EXPIRATION_TIME }
    );

    const refreshToken = await jwt.sign(
      { id: payload, tokenType:"refresh"  },
      JWT_PRIVATE_KEY,
      { expiresIn: JWT_REFRESH_EXPIRATION_TIME } 
    );

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error.message);
    throw new Error("Token generation failed");
  }
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_PRIVATE_KEY);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("TokenExpiredError");
    }
    if (error.name === "JsonWebTokenError") {
      throw new Error("InvalidTokenError");
    }
    throw new Error("TokenVerificationError");
  }
};

function getToken(req) {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    // console.log({tokenwithbearer:req.headers.authorization,token: req.headers.authorization.split(" ")[1]});
    return req.headers.authorization.split(" ")[1];
  }
  return null;
}

function generateRandomPassword() {
  const length = 8;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

const fetchTotalBudget = async (id) => {
  const data = await db.query.budget.findFirst({
    where: eq(budget.userId, id),
  });
  return data;
};

const fetchCategory = async (id) => {
  const data = await db.query.category.findFirst({
    where: eq(category.id, id),
  });
  return data;
};
const fetchLabel = async (id) => {
  const data = await db.query.label.findFirst({
    where: eq(label.id, id),
  });
  return data;
};

export {
  createOTP,
  createJWTToken,
  getToken,
  verifyToken,
  generateRandomPassword,
  fetchTotalBudget,
  fetchCategory,
  fetchLabel,
};
