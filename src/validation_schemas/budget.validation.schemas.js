import { z } from "zod";

// Validation schema for the budget table
const addBudgetValidationSchema = z.object({
  totalBudget: z
    .number()
    .min(0, "Total budget must be at least 0")
    .max(1000000000, "Total budget cannot exceed 1 billion")
    .default(0),
});

const transactionSchema = z.object({
  labelId: z.number().int().positive().nonnegative("Invalid labelId"),
  categoryId: z.number().int().positive("Invalid categoryId"),
  type: z.enum(["income", "expense"], { required_error: "Type is required" }),
  amount: z
    .number()
    .positive("Amount must be positive")
    .nonnegative("Amount cannot be negative"),
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
  notes: z
    .string()
    .max(255, "Notes must be less than 255 characters")
    .optional(),

  isScheduled: z.boolean(),
});

const generateReportSchema = z.object({
  categoryId: z
    .number()
    .int("Category ID must be an integer")
    .positive("Category ID must be a positive number"),
  labelIds: z
    .array(
      z
        .number()
        .int("Each label ID must be an integer")
        .positive("Each label ID must be positive")
    )
    .nonempty("Label IDs array cannot be empty"),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in the format YYYY-MM-DD")
    .refine((date) => !isNaN(new Date(date).getTime()), {
      message: "Invalid start date",
    }),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in the format YYYY-MM-DD")
    .refine((date) => !isNaN(new Date(date).getTime()), {
      message: "Invalid end date",
    }),
});

export { addBudgetValidationSchema, transactionSchema, generateReportSchema };
