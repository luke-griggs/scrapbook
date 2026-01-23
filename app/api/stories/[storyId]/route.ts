import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { responses, familyMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth-server";

// DELETE - Delete a story (only by the owner)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { storyId } = await params;

    // Find the story
    const response = await db.query.responses.findFirst({
      where: eq(responses.id, storyId),
      with: {
        promptInvite: true,
      },
    });

    if (!response) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // Verify the user is the owner of this story
    if (response.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete your own stories" },
        { status: 403 }
      );
    }

    // Delete the story (comments will cascade delete due to schema)
    await db.delete(responses).where(eq(responses.id, storyId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting story:", error);
    return NextResponse.json(
      { error: "Failed to delete story" },
      { status: 500 }
    );
  }
}
