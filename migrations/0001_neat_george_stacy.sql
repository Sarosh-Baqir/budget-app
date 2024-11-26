ALTER TABLE `user` ADD `first_name` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `last_name` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `phone` varchar(15);--> statement-breakpoint
ALTER TABLE `user` ADD `cnic` varchar(15);--> statement-breakpoint
ALTER TABLE `user` ADD `is_verified` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `user` ADD `otp` varchar(6) NOT NULL;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `name`;