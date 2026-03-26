import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const userEmail = session.user.email;
    if (!userEmail) return new NextResponse("Unauthorized", { status: 401 });

    const user = await db.user.findUnique({ where: { email: userEmail } });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const subscription = await req.json();

    if (!subscription || !subscription.endpoint) {
      return new NextResponse("Invalid subscription format", { status: 400 });
    }

    // Check if it already exists
    const existing = await db.pushSubscription.findUnique({
      where: { endpoint: subscription.endpoint }
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    const newSub = await db.pushSubscription.create({
      data: {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userId: user.id,
      }
    });

    return NextResponse.json(newSub);
  } catch (error) {
    console.error("[SUBSCRIBE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
