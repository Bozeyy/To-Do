"use client";

import { useEffect, useState } from "react";
import { BellRing, X } from "lucide-react";

export default function NotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [showBanner, setShowBanner] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      return;
    }
    setPermission(Notification.permission);
    if (Notification.permission === "default") {
      const t = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(t);
    } else if (Notification.permission === "granted") {
      // Re-subscribe transparently if needed, but not strictly required unless sub expired
      ensureSubscription();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ensureSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicVapidKey) return;

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        });
      }

      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });
    } catch (e) {
      console.error(e);
    }
  }

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeUser = async () => {
    setLoading(true);
    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== "granted") {
        setShowBanner(false);
        setLoading(false);
        return;
      }

      await ensureSubscription();
      setShowBanner(false);
    } catch (err) {
      console.error("Failed to subscribe", err);
    } finally {
      setLoading(false);
    }
  };

  if (permission === "granted" || permission === "denied" || !showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-sm bg-brand text-white p-4 rounded-2xl premium-shadow animate-in slide-in-from-bottom-5 duration-500 z-50 flex items-start gap-4">
      <div className="mt-1 bg-white/20 p-2 rounded-full shrink-0">
        <BellRing className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-sm mb-1">Rappels de tâches</h4>
        <p className="text-xs text-white/90 mb-3 leading-relaxed">
          Activez les notifications pour être prévenu 24h avant l'échéance de vos tâches.
        </p>
        <div className="flex gap-2">
          <button
            onClick={subscribeUser}
            disabled={loading}
            className="flex-1 bg-white text-brand px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-white/90 transition-colors"
          >
            {loading ? "Activation..." : "Activer"}
          </button>
          <button
            onClick={() => setShowBanner(false)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-black/10 hover:bg-black/20 transition-colors"
          >
            Plus tard
          </button>
        </div>
      </div>
      <button 
        onClick={() => setShowBanner(false)}
        className="absolute top-2 right-2 p-1 text-white/50 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
