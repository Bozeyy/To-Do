import { NextResponse } from "next/server";
import db from "@/lib/db";
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:contact@todoapp.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

export async function GET(req: Request) {
  try {
    const now = new Date();
    // Tasks due within the next 24 hours
    const plus24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const todosToNotify = await db.todo.findMany({
      where: {
        notifiedReminder24h: false,
        isCompleted: false,
        dueDate: {
          not: null,
          lte: plus24Hours,
          gt: now, // still not expired relative to now
        }
      },
      include: {
        user: {
          include: {
            pushSubscriptions: true
          }
        }
      }
    });

    let sentCount = 0;

    for (const todo of todosToNotify) {
      if (!todo.user.pushSubscriptions.length) continue;

      const payload = JSON.stringify({
        title: "⏰ Rappel d'échéance",
        body: `Votre tâche "${todo.title}" est à terminer d'ici 24 heures !`,
        url: "/dashboard/groups/all"
      });

      for (const sub of todo.user.pushSubscriptions) {
        try {
          await webpush.sendNotification({
            endpoint: sub.endpoint,
            keys: {
              auth: sub.auth,
              p256dh: sub.p256dh
            }
          }, payload);
          sentCount++;
        } catch (err: any) {
          // If subscription is invalid/expired (404/410), remove it
          if (err.statusCode === 404 || err.statusCode === 410) {
            await db.pushSubscription.delete({ where: { id: sub.id } });
          } else {
            console.error("[WEBPUSH_ERROR]", err);
          }
        }
      }

      // Mark as notified so we don't notify again
      await db.todo.update({
        where: { id: todo.id },
        data: { notifiedReminder24h: true }
      });
    }

    return NextResponse.json({ 
      success: true, 
      notified: sentCount, 
      tasksProcessed: todosToNotify.length 
    });
  } catch (error) {
    console.error("[CRON_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
