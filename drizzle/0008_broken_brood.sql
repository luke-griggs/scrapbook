ALTER TABLE "responses" ALTER COLUMN "video_url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "responses" ADD COLUMN "text_content" text;