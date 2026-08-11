CREATE INDEX `idx_complaints_citizen` ON `complaints` (`citizen_id`);--> statement-breakpoint
CREATE INDEX `idx_complaints_department_status` ON `complaints` (`department_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_history_complaint` ON `status_history` (`complaint_id`,`changed_at`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_feedback` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`complaint_id` integer NOT NULL,
	`rating` integer NOT NULL,
	`comment` text,
	`submitted_at` text NOT NULL,
	FOREIGN KEY (`complaint_id`) REFERENCES `complaints`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "rating_between_1_and_5" CHECK("__new_feedback"."rating" between 1 and 5)
);
--> statement-breakpoint
INSERT INTO `__new_feedback`("id", "complaint_id", "rating", "comment", "submitted_at") SELECT "id", "complaint_id", "rating", "comment", "submitted_at" FROM `feedback`;--> statement-breakpoint
DROP TABLE `feedback`;--> statement-breakpoint
ALTER TABLE `__new_feedback` RENAME TO `feedback`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `feedback_complaint_id_unique` ON `feedback` (`complaint_id`);