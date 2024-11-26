import { eq } from "drizzle-orm";
import { user } from "../../db/schema/user.js";
import blackListToken from "../../db/schema/blacklisttoken.js";
import { db } from "../../db/database.js";
import { getToken, verifyToken } from "../utils/helper.js";
import {
  errorResponse,
  unauthorizeResponse,
} from "../utils/response.handle.js";

const authentication = async (req, res, next) => {
  //console.log("in auth middleware");
  try {
    const token = getToken(req);
    //console.log("token: ", token);

    if (!token) {
      return unauthorizeResponse(res, "Authentication token is required");
    }

    const invalidToken = await db.query.blackListToken.findFirst({
      where: eq(blackListToken.token, token),
    });
    //console.log("invalid token: ", invalidToken);
    if (invalidToken) {
      return unauthorizeResponse(res, "Unauthorize! Invalid Token");
    }

    let decodedToken;

    try {
      decodedToken = verifyToken(token);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return unauthorizeResponse(res, "Token has expired");
      } else {
        return unauthorizeResponse(res, "Invalid token");
      }
    }

    const data = await db.query.user.findFirst({
      where: eq(user.id, decodedToken.id),
      columns: { id: true },
    });

    if (!data) {
      return unauthorizeResponse(res, "Unauthorize! User not Found");
    }
    // Sending LoggedIn user in the next middleware
    req.loggedInUserId = data.id;
    next();
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Middleware to check if user is already registered
const checkUserAlreadyRegistered = async (req, res, next) => {
  try {
    const { email } = req.body;
    const data = await db.query.user.findFirst({
      where: eq(user.email, email),
    });

    if (data) {
      return errorResponse(
        res,
        "user with this Email is already Registered",
        409
      );
    }
    next();
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

export { authentication, checkUserAlreadyRegistered };
