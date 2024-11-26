import { z } from "zod";

const addLabelValidationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Label name is required")
    .max(100, "Label name must be at most 100 characters long"),
  categoryId: z.number().min(1, "Category Id is required"),
});

export { addLabelValidationSchema };
