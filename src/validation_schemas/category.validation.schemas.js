import { z } from "zod";

const addCategoryValidationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(100, "Category name must be at most 100 characters long"),
  totalBudget: z.number().min(0, "Total budget must be at least 0").default(0),
  categoryType: z.enum(
    ["income", "expense"],
    "Category type must be either 'income' or 'expense'"
  ),
  description: z
    .string()
    .trim()
    .max(255, "Description must be at most 255 characters long")
    .optional(),
});
const updatePlannedBudgetSchema = z.object({
  newAmountToAdd: z
    .number()
    .min(0, "new amount to add must be at least 0")
    .default(0),
  categoryId: z.number().int().positive("Invalid categoryId"),
});

export { addCategoryValidationSchema, updatePlannedBudgetSchema };
