ALTER TABLE `members` ADD `recovery` text;--> statement-breakpoint
CREATE INDEX `expense_family_date` ON `expenses` (`family`,`date`);