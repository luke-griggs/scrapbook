ALTER TABLE "family_members" DROP CONSTRAINT "family_members_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "family_members" ALTER COLUMN "user_id" SET DATA TYPE text;