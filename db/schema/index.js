import { user } from "./user.js";
import { category } from "./category.js";
import { label } from "./label.js";
import { transaction } from "./transaction.js";
import blackListToken from "./blacklisttoken.js";
import { budget } from "./budget.js";

const schema = { user, category, label, transaction, blackListToken, budget };

export default schema;
