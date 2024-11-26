import { isNull, lt, or } from "drizzle-orm";
import blacklistToken from "../schema/blacklisttoken.js";
import { db } from "../database.js";

const deleteExpiredTokens = async () => {
  try {
    const currentTime = Math.floor(Date.now() / 1000);
    const data = await db
      .delete(blacklistToken)
      .where(
        or(
          lt(blacklistToken.expire_time, currentTime),
          isNull(blacklistToken.expire_time)
        )
      ) //whose expire time is less then current time or is null
      .returning();
    if (data.length === 0) console.log("No expire tokens Found!");
    else console.log("Expired BlackListed Tokens are deleted!", data);
  } catch (error) {
    console.log({ error: error.message });
  }
};
deleteExpiredTokens();

export { deleteExpiredTokens };
