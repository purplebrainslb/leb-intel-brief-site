CREATE TABLE `brief_sections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`briefId` int NOT NULL,
	`sectionKey` varchar(64) NOT NULL,
	`title` varchar(256) NOT NULL,
	`subtitle` varchar(256),
	`sortOrder` int NOT NULL DEFAULT 0,
	CONSTRAINT `brief_sections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `briefs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(64) NOT NULL,
	`location` varchar(128) NOT NULL DEFAULT 'Beirut, Lebanon',
	`lastUpdated` varchar(64) NOT NULL,
	`isLatest` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `briefs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `key_judgments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`briefId` int NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`severity` enum('critical','high','medium','low') NOT NULL,
	`region` varchar(128) NOT NULL,
	CONSTRAINT `key_judgments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `outlook_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`briefId` int NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`category` varchar(128) NOT NULL,
	`assessment` varchar(256) NOT NULL,
	`description` text NOT NULL,
	CONSTRAINT `outlook_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `section_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sectionId` int NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`heading` text NOT NULL,
	`content` text NOT NULL,
	`source` varchar(256) NOT NULL,
	`severity` enum('critical','high','medium','low'),
	CONSTRAINT `section_items_id` PRIMARY KEY(`id`)
);
