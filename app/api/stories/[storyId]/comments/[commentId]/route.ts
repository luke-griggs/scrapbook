import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comments, responses, familyMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth-server";

// DELETE - Delete a comment (only by the owner)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string; commentId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { storyId, commentId } = await params;

    // Find the comment
    const comment = await db.query.comments.findFirst({
      where: eq(comments.id, commentId),
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Verify comment belongs to this story
    if (comment.responseId !== storyId) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Verify the user is the owner of this comment
    if (comment.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete your own comments" },
        { status: 403 }
      );
    }

    // Delete the comment
    await db.delete(comments).where(eq(comments.id, commentId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
