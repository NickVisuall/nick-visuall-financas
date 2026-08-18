CREATE TABLE IF NOT EXISTS `sync_documents` (
	`sync_code` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`updated_at` text NOT NULL
);
