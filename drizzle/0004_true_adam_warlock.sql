CREATE TABLE `department_portals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`department_id` integer NOT NULL,
	`portal_id` text NOT NULL,
	`staff_email` text,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `department_portals_department_id_unique` ON `department_portals` (`department_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `department_portals_portal_id_unique` ON `department_portals` (`portal_id`);