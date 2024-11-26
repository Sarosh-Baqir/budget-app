import { db } from "../database.js";
import { transaction } from "../schema/transaction.js";

import { eq, lt, and, isNull } from "drizzle-orm";

// Function to process and complete scheduled transactions
const processScheduledTransactions = async () => {
  console.log("in scheduled transaction trigger");
  try {
    const currentTime = new Date();

    // Find scheduled transactions whose scheduled date is now or in the past
    const scheduledTransactions = await db
      .select()
      .from(transaction)
      .where(
        and(
          eq(transaction.is_scheduled, true),
          lt(transaction.date, currentTime),
          eq(transaction.status, "pending")
        )
      )
      .returning();

    console.log("scheduled transactions: ", scheduledTransactions);

    if (scheduledTransactions.length === 0) {
      console.log("No scheduled transactions found to process!");
      return;
    }

    // Process each scheduled transaction
    for (const txn of scheduledTransactions) {
      try {
        await db
          .update(transaction)
          .set({ status: "completed", is_scheduled: false })
          .where(eq(transaction.id, txn.id));

        // Update related label, category, and budget tables
        await db
          .update(label)
          .set({ amount: parseFloat(txn.amount.toFixed(2)) })
          .where(eq(label.id, txn.labelId));
        console.log("label data updated");

        const budgetData = await fetchTotalBudget(txn.userId);
        console.log("budget data: ", budgetData);
        const categoryData = await fetchCategory(txn.categoryId);
        console.log("category data: ", categoryData);

        await updateCategoryTable(
          categoryData,
          txn.amount,
          txn.categoryId,
          txn.type
        );
        await updateBudgetTable(budgetData, txn.amount, txn.userId, txn.type);

        console.log(
          `Scheduled transaction ID: ${txn.id} processed and completed.`
        );
      } catch (error) {
        console.error(
          `Error processing transaction ID: ${txn.id}`,
          error.message
        );
      }
    }
  } catch (error) {
    console.log("Error processing scheduled transactions:", error.message);
  }
};

processScheduledTransactions();

export { processScheduledTransactions };
