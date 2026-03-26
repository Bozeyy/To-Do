import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, color } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const group = await db.group.create({
      data: {
        name,
        color,
        userId: user.id,
      },
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error("[GROUPS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const groups = await db.group.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            todos: {
              where: { isCompleted: false },
            },
          },
        },
      },
    });

    const totalTasks = await db.todo.count({
      where: {
        userId: user.id,
        isCompleted: false,
      },
    });

    return NextResponse.json({ groups, totalTasks });
  } catch (error) {
    console.error("[GROUPS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
