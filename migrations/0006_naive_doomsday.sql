ALTER TABLE `label` RENAME COLUMN `planned_amount` TO `total_budget`;--> statement-breakpoint
ALTER TABLE `label` RENAME COLUMN `received_amount` TO `spent_budget`;--> statement-breakpoint
ALTER TABLE `budget` ADD `allocated_budget` decimal(10,2) DEFAULT 0;--> statement-breakpoint
ALTER TABLE `budget` ADD `remaining_budget` decimal(10,2) DEFAULT 0;--> statement-breakpoint
ALTER TABLE `category` ADD `allocated_budget` decimal DEFAULT 0;--> statement-breakpoint
ALTER TABLE `category` ADD `remaining_budget` decimal DEFAULT 0;--> statement-breakpoint
ALTER TABLE `label` ADD `allocated_budget` decimal DEFAULT 0;--> statement-breakpoint
ALTER TABLE `label` ADD `remaining_budget` decimal DEFAULT 0;