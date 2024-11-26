ALTER TABLE `category` MODIFY COLUMN `category_type` enum('income','expense') NOT NULL;--> statement-breakpoint
ALTER TABLE `transaction` MODIFY COLUMN `type` enum('income','expense') NOT NULL;--> statement-breakpoint
ALTER TABLE `label` ADD `amount` decimal DEFAULT 0;--> statement-breakpoint
ALTER TABLE `budget` DROP COLUMN `allocated_budget`;--> statement-breakpoint
ALTER TABLE `category` DROP COLUMN `allocated_budget`;--> statement-breakpoint
ALTER TABLE `label` DROP COLUMN `total_budget`;--> statement-breakpoint
ALTER TABLE `label` DROP COLUMN `spent_budget`;--> statement-breakpoint
ALTER TABLE `label` DROP COLUMN `remaining_budget`;