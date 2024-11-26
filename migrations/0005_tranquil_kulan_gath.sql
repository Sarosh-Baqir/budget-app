CREATE TABLE `budget` (
	`id` int AUTO_INCREMENT NOT NULL,
	`total_budget` decimal(10,2) NOT NULL,
	`spent_budget` decimal(10,2) DEFAULT 0,
	`last_reset_date` timestamp DEFAULT (now()),
	`user_id` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budget_id` PRIMARY KEY(`id`),
	CONSTRAINT `budget_id_unique` UNIQUE(`id`)
);
--> statement-breakpoint
ALTER TABLE `budget` ADD CONSTRAINT `budget_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;