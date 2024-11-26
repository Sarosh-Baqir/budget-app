CREATE TABLE `category` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`total_budget` decimal DEFAULT 0,
	`description` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `category_id` PRIMARY KEY(`id`),
	CONSTRAINT `category_id_unique` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `label` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category_id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`planned_amount` decimal DEFAULT 0,
	`received_amount` decimal DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `label_id` PRIMARY KEY(`id`),
	CONSTRAINT `label_id_unique` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `transaction` (
	`id` int AUTO_INCREMENT NOT NULL,
	`label_id` int NOT NULL,
	`user_id` int NOT NULL,
	`type` enum('income','expense') NOT NULL,
	`amount` decimal NOT NULL,
	`transaction_date` timestamp NOT NULL,
	`notes` varchar(255),
	`is_scheduled` boolean NOT NULL DEFAULT false,
	`status` enum('pending','completed','cancelled') NOT NULL DEFAULT 'pending',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transaction_id` PRIMARY KEY(`id`),
	CONSTRAINT `transaction_id_unique` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`email` varchar(100) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`start_date` timestamp,
	`end_date` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_id_unique` UNIQUE(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `category` ADD CONSTRAINT `category_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `label` ADD CONSTRAINT `label_category_id_category_id_fk` FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_label_id_label_id_fk` FOREIGN KEY (`label_id`) REFERENCES `label`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;