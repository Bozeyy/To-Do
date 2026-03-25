import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import db from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    // Fetch all todos with a dueDate for the current user
    const todos = await db.todo.findMany({
      where: {
        userId: user.id,
        dueDate: {
          not: null,
        },
      },
      include: {
        group: true,
      },
      orderBy: { 
        dueDate: "asc" 
      },
    });

    return NextResponse.json(todos);
  } catch (error) {
    console.error("[CALENDAR_TODOS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
