CREATE TABLE `blacklisttokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(255) NOT NULL,
	`expire_time` bigint,
	CONSTRAINT `blacklisttokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `blacklisttokens_id_unique` UNIQUE(`id`)
);
