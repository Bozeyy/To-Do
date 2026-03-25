import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import db from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { todoId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { isCompleted } = body;

    const todo = await db.todo.update({
      where: { id: params.todoId },
      data: { isCompleted },
    });

    return NextResponse.json(todo);
  } catch (error) {
    console.error("[TODO_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { todoId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    await db.todo.delete({
      where: { id: params.todoId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[TODO_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
