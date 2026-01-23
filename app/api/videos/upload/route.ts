import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getSession } from "@/lib/auth-server";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Authenticate user before allowing upload
        const session = await getSession();
        if (!session?.user) {
          throw new Error("Unauthorized");
        }

        return {
          allowedContentTypes: ["video/webm", "video/mp4", "video/quicktime"],
          maximumSizeInBytes: 500 * 1024 * 1024, // 500MB max
        };
      },
      onUploadCompleted: async () => {
        // No-op: response is saved client-side after upload
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Error handling video upload:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
