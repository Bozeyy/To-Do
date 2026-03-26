import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import db from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ todoId: string }> }
) {
  try {
    const { todoId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { isCompleted, title, description, color, dueDate } = body;

    const updateData: any = {};
    if (isCompleted !== undefined) updateData.isCompleted = isCompleted;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const todo = await db.todo.update({
      where: { id: todoId },
      data: updateData,
    });

    return NextResponse.json(todo);
  } catch (error) {
    console.error("[TODO_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ todoId: string }> }
) {
  try {
    const { todoId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    await db.todo.delete({
      where: { id: todoId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[TODO_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
