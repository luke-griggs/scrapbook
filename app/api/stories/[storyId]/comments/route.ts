import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comments, responses, familyMembers, promptInvites, user } from "@/lib/db/schema";
import { eq, inArray, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth-server";

// GET - Fetch comments for a story
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { storyId } = await params;

    // Verify the user has access to this story (is in the same family)
    const response = await db.query.responses.findFirst({
      where: eq(responses.id, storyId),
      with: {
        promptInvite: true,
      },
    });

    if (!response || !response.promptInvite) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // Check if user is in the family
    const membership = await db.query.familyMembers.findFirst({
      where: eq(familyMembers.userId, session.user.id),
    });

    if (!membership || membership.familyId !== response.promptInvite.familyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch comments with user info
    const storyComments = await db.query.comments.findMany({
      where: eq(comments.responseId, storyId),
      orderBy: [desc(comments.createdAt)],
    });

    // Get unique user IDs from comments
    const userIds = [...new Set(storyComments.map((c) => c.userId))];

    // Fetch user info
    const users =
      userIds.length > 0
        ? await db.query.user.findMany({
            where: inArray(user.id, userIds),
          })
        : [];

    const userMap = new Map(users.map((u) => [u.id, u]));

    // Build response with user info
    const commentsWithUsers = storyComments.map((comment) => {
      const commentUser = userMap.get(comment.userId);
      return {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        user: {
          id: commentUser?.id || comment.userId,
          name: commentUser?.name || "Unknown",
          image: commentUser?.image || null,
        },
      };
    });

    return NextResponse.json({ comments: commentsWithUsers });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST - Create a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { storyId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    // Verify the user has access to this story (is in the same family)
    const response = await db.query.responses.findFirst({
      where: eq(responses.id, storyId),
      with: {
        promptInvite: true,
      },
    });

    if (!response || !response.promptInvite) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // Check if user is in the family
    const membership = await db.query.familyMembers.findFirst({
      where: eq(familyMembers.userId, session.user.id),
    });

    if (!membership || membership.familyId !== response.promptInvite.familyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Create the comment
    const [newComment] = await db
      .insert(comments)
      .values({
        responseId: storyId,
        userId: session.user.id,
        content: content.trim(),
      })
      .returning();

    // Return the comment with user info
    return NextResponse.json({
      comment: {
        id: newComment.id,
        content: newComment.content,
        createdAt: newComment.createdAt,
        user: {
          id: session.user.id,
          name: session.user.name,
          image: session.user.image || null,
        },
      },
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
