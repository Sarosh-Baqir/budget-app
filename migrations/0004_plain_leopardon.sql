ALTER TABLE `category` ADD `spent_budget` decimal DEFAULT 0;--> statement-breakpoint
ALTER TABLE `category` ADD `category_type` enum('debit','credit') NOT NULL;