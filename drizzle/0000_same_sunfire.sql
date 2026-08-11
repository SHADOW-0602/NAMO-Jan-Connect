CREATE TABLE `complaint_attachments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`complaint_id` integer NOT NULL,
	`object_key` text NOT NULL,
	`file_url` text NOT NULL,
	`file_type` text DEFAULT 'image' NOT NULL,
	`uploaded_by` integer NOT NULL,
	`uploaded_at` text NOT NULL,
	FOREIGN KEY (`complaint_id`) REFERENCES `complaints`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `complaints` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tracking_id` text NOT NULL,
	`citizen_id` integer NOT NULL,
	`category` text NOT NULL,
	`department_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`location_text` text NOT NULL,
	`latitude` real,
	`longitude` real,
	`status` text DEFAULT 'submitted' NOT NULL,
	`priority` text DEFAULT 'medium' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`resolved_at` text,
	`sla_due_at` text NOT NULL,
	FOREIGN KEY (`citizen_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `complaints_tracking_id_unique` ON `complaints` (`tracking_id`);--> statement-breakpoint
CREATE TABLE `departments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`region` text DEFAULT 'National Capital Region' NOT NULL,
	`sla_days` integer DEFAULT 7 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `departments_category_unique` ON `departments` (`category`);--> statement-breakpoint
CREATE TABLE `email_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`complaint_id` integer NOT NULL,
	`recipient` text NOT NULL,
	`subject` text NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`sent_at` text NOT NULL,
	FOREIGN KEY (`complaint_id`) REFERENCES `complaints`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `feedback` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`complaint_id` integer NOT NULL,
	`rating` integer NOT NULL,
	`comment` text,
	`submitted_at` text NOT NULL,
	FOREIGN KEY (`complaint_id`) REFERENCES `complaints`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `feedback_complaint_id_unique` ON `feedback` (`complaint_id`);--> statement-breakpoint
CREATE TABLE `status_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`complaint_id` integer NOT NULL,
	`old_status` text,
	`new_status` text NOT NULL,
	`remarks` text NOT NULL,
	`changed_by` integer NOT NULL,
	`changed_at` text NOT NULL,
	FOREIGN KEY (`complaint_id`) REFERENCES `complaints`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`changed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`external_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`role` text DEFAULT 'citizen' NOT NULL,
	`department_id` integer,
	`created_at` text NOT NULL,
	FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_external_id_unique` ON `users` (`external_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);