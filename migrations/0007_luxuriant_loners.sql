ALTER TABLE `transaction` MODIFY COLUMN `type` enum('debit','credit') NOT NULL;--> statement-breakpoint
ALTER TABLE `transaction` MODIFY COLUMN `status` enum('pending','completed','cancelled','none') NOT NULL DEFAULT 'none';--> statement-breakpoint
ALTER TABLE `transaction` ADD `category_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_category_id_category_id_fk` FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `label` DROP COLUMN `allocated_budget`;