import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import db from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const todos = await db.todo.findMany({
      where: { groupId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(todos);
  } catch (error) {
    console.error("[GROUP_TODOS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  console.log("[DEBUG] Starting POST /api/groups/[groupId]/todos");
  try {
    const { groupId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.error("[DEBUG] No session or user found");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userEmail = session.user.email;
    const userId = (session.user as any).id;

    console.log("[DEBUG] User context:", { userEmail, userId, groupId });

    // Fallback if userId wasn't in session yet (e.g. session needs refresh)
    let finalUserId = userId;
    if (!finalUserId && userEmail) {
      console.log("[DEBUG] UserId not in session, looking up by email...");
      const user = await db.user.findUnique({ where: { email: userEmail } });
      if (!user) return new NextResponse("User not found", { status: 404 });
      finalUserId = user.id;
    }

    if (!finalUserId) {
      return new NextResponse("User ID missing", { status: 400 });
    }

    const body = await req.json();
    const { title, dueDate } = body;

    console.log("[DEBUG] Request data:", { title, dueDate });

    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    // Attempt creation
    try {
      const todo = await db.todo.create({
        data: {
          title,
          dueDate: dueDate ? new Date(dueDate) : null,
          groupId,
          userId: finalUserId,
        },
      });

      console.log("[DEBUG] Todo created successfully:", todo.id);
      return NextResponse.json(todo);
    } catch (prismaError: any) {
      console.error("[DEBUG] Prisma creation error:", prismaError);
      return new NextResponse(JSON.stringify({ 
        error: "Prisma Error", 
        message: prismaError.message,
        code: prismaError.code
      }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

  } catch (error: any) {
    console.error("[DEBUG] Catch-all error:", error);
    return new NextResponse(JSON.stringify({ 
      error: "Internal Error", 
      message: error.message,
      stack: error.stack
    }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}


