import { db } from "../../db/database.js";
import { budget } from "../../db/schema/budget.js";
import { category } from "../../db/schema/category.js";
import { label } from "../../db/schema/label.js";
import { transaction } from "../../db/schema/transaction.js";
import { and, eq, inArray, gte, lte } from "drizzle-orm";

import {
  fetchCategory,
  fetchLabel,
  fetchTotalBudget,
} from "../utils/helper.js";
import { successResponse, errorResponse } from "../utils/response.handle.js";

// API to add a new budget
const addBudget = async (req, res) => {
  console.log("in add budget controller");
  try {
    const userId = req.loggedInUserId;
    console.log("userId: ", userId);

    try {
      const data = await db
        .insert(budget)
        .values({
          userId,
          totalBudget: 0,
        })
        .$returningId();

      return successResponse(res, "Budget has been added successfully!", {
        data,
      });
    } catch (error) {
      return errorResponse(
        res,
        `Error in creating budget = ${error.message}`,
        400
      );
    }
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// API to add a new transaction
const addTransaction = async (req, res) => {
  console.log("in add transaction controller");
  try {
    const { labelId, categoryId, type, amount, date, notes, isScheduled } =
      req.body;
    const userId = req.loggedInUserId;
    console.log("userId: ", userId);
    const budgetData = await fetchTotalBudget(userId);
    console.log("budget data: ", budgetData);
    const categoryData = await fetchCategory(categoryId);
    console.log("category data: ", categoryData);
    const labelData = await fetchLabel(labelId);
    console.log("label data: ", labelData);

    // Ensure the transaction amount does not exceed remaining budget of category
    if (type === "expense" && amount > budgetData.remainingBudget) {
      return errorResponse(
        res,
        "Transaction amount exceeds the remaining budget of budget table",
        400
      );
    }
    if (amount > categoryData.remainingBudget) {
      return errorResponse(
        res,
        "Transaction amount exceeds the planned budget of category",
        400
      );
    }
    // Parse date into a proper Date object
    const transactionDate = new Date(date);
    if (isNaN(transactionDate.getTime())) {
      return errorResponse(res, "Invalid date format", 400);
    }

    if (isScheduled) {
      console.log(
        "Scheduled transaction, skipping updates for category, budget, and label."
      );
    } else {
      // Update label
      const newLabelAmount = (
        (parseFloat(labelData.amount) || 0) + parseFloat(amount)
      ).toFixed(2);
      await db
        .update(label)
        .set({ amount: newLabelAmount })
        .where(eq(label.id, labelId));
      console.log("label data updated");

      // Update category and budget only if the transaction is not scheduled
      await updateCategoryTable(categoryData, amount, categoryId, type, res);
      await updateBudgetTable(budgetData, amount, userId, type, res);
    }

    try {
      const data = await db
        .insert(transaction)
        .values({
          labelId,
          categoryId,
          userId,
          type,
          amount: parseFloat(amount.toFixed(2)),
          date: transactionDate,
          notes,
          status: isScheduled ? "pending" : "completed",
          is_scheduled: isScheduled,
        })
        .$returningId();

      return successResponse(res, "Transaction has been done successfully!", {
        data,
      });
    } catch (error) {
      return errorResponse(res, `Error in tansaction = ${error.message}`, 400);
    }
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const updateCategoryTable = async (
  categoryData,
  amount,
  categoryId,
  type,
  res
) => {
  console.log("in category update table");
  const prevTotalBudget = parseFloat(categoryData.totalBudget) || 0;
  const prevRemainingBudget = parseFloat(categoryData.remainingBudget) || 0;
  const prevSpentBudget = parseFloat(categoryData.spentBudget) || 0;

  console.log("prev total budget: ", prevTotalBudget);
  console.log("prev remaining budget: ", prevRemainingBudget);
  console.log("prev spent budget: ", prevSpentBudget);
  const newSpentBudget = (prevSpentBudget + parseFloat(amount)).toFixed(2);
  const newRemainingBudget = (prevRemainingBudget - parseFloat(amount)).toFixed(
    2
  );
  console.log("new spent budget: ", newSpentBudget);
  console.log("new remaining budget: ", newRemainingBudget);

  try {
    await db
      .update(category)
      .set({
        spentBudget: newSpentBudget,
        remainingBudget: newRemainingBudget,
      })
      .where(eq(category.id, categoryId));
    console.log("category id: ", categoryId);
  } catch (error) {
    console.error("Error updating category table:", error.message);
  }
};

const updateBudgetTable = async (budgetData, amount, userId, type, res) => {
  console.log("in budget update table");
  const prevTotalBudget = parseFloat(budgetData.totalBudget) || 0;
  const prevRemainingBudget = parseFloat(budgetData.remainingBudget) || 0;
  const prevSpentBudget = parseFloat(budgetData.spentBudget) || 0;

  console.log("prev total budget: ", prevTotalBudget);
  console.log("prev remaining budget: ", prevRemainingBudget);
  console.log("prev spent budget: ", prevSpentBudget);

  try {
    if (type === "income") {
      await db
        .update(budget)
        .set({
          totalBudget: (prevTotalBudget + parseFloat(amount)).toFixed(2),
          remainingBudget: (prevRemainingBudget + parseFloat(amount)).toFixed(
            2
          ),
        })
        .where(eq(budget.userId, userId));
    } else if (type === "expense") {
      await db
        .update(budget)
        .set({
          spentBudget: (prevSpentBudget + parseFloat(amount)).toFixed(2),
          remainingBudget: (prevRemainingBudget - parseFloat(amount)).toFixed(
            2
          ),
        })
        .where(eq(budget.userId, userId));
    }
  } catch (error) {
    console.error("Error updating budget table:", error.message);
  }
};

const generateReport = async (req, res) => {
  try {
    const { categoryId, labelIds, startDate, endDate } = req.body;

    // Parse dates
    const start = new Date(`${startDate}T00:00:00Z`);
    const end = new Date(`${endDate}T23:59:59Z`);

    if (isNaN(start) || isNaN(end)) {
      return errorResponse(res, "Invalid date format", 400);
    }
    console.log(categoryId, labelIds, start, end);

    // Fetch all transactions
    const transactions = await db.query.transaction.findMany({
      where: and(
        eq(transaction.categoryId, categoryId),
        inArray(transaction.labelId, labelIds),
        gte(transaction.date, start),
        lte(transaction.date, end),
        eq(transaction.is_scheduled, false)
      ),
      columns: {
        id: true,
        type: true,
        amount: true,
      },
    });

    console.log("transactions: ", transactions);
    // // Separate income and expense transactions
    // const incomeTransactions = transactions.filter((t) => t.type === "income");
    // const expenseTransactions = transactions.filter(
    //   (t) => t.type === "expense"
    // );
    // console.log("income transactions: ", incomeTransactions);
    // console.log("expense transactions: ", expenseTransactions);
    const categoryBudget = await fetchCategory(categoryId);
    const plannedBudget = categoryBudget.totalBudget;

    // if(incomeTransactions.length == 0){}

    // Calculate totals
    const totalSpent = transactions.reduce(
      (sum, t) => sum + parseFloat(t.amount),
      0
    );
    // const totalExpense = expenseTransactions.reduce(
    //   (sum, t) => sum + parseFloat(t.amount),
    //   0
    // );

    console.log("planned budget of this category: ", plannedBudget);
    console.log(
      "total transactions in this category and those labels: ",
      totalSpent
    );

    // Return the generated report
    return successResponse(res, "Report generated successfully", {
      plannedBudget: plannedBudget,
      spending: totalSpent,
    });
  } catch (error) {
    console.error("Error generating report:", error.message);
    return errorResponse(res, `Error generating report: ${error.message}`, 500);
  }
};

const getBudget = async (req, res) => {
  const userId = req.loggedInUserId;
  try {
    const data = await db.query.budget.findFirst({
      where: eq(budget.userId, userId),
    });
    return successResponse(res, "budget fetched successfully", {
      data,
    });
  } catch (error) {
    console.error("Error in getting budget:", error.message);
    return errorResponse(res, `Error geting budget: ${error.message}`, 500);
  }
};

export { addBudget, addTransaction, generateReport, getBudget };
