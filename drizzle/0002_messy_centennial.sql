CREATE TABLE `disciplineEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`label` varchar(255) NOT NULL,
	`date` varchar(10) NOT NULL,
	`completed` boolean NOT NULL DEFAULT false,
	CONSTRAINT `disciplineEntries_id` PRIMARY KEY(`id`)
);
