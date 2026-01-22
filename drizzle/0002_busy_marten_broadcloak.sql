ALTER TABLE "prompt_invites" DROP CONSTRAINT "prompt_invites_sender_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "prompt_invites" DROP CONSTRAINT "prompt_invites_recipient_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "responses" DROP CONSTRAINT "responses_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "prompt_invites" ALTER COLUMN "prompt_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "prompt_invites" ALTER COLUMN "family_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "prompt_invites" ALTER COLUMN "sender_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "prompt_invites" ALTER COLUMN "recipient_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "responses" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "prompt_invites" ADD COLUMN "prompt_text" text NOT NULL;--> statement-breakpoint
ALTER TABLE "prompt_invites" ADD COLUMN "sender_name" varchar(255);