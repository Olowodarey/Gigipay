"use client";

import { useCallback, useEffect, useState } from "react";
import { subscribePush, unsubscribePush, getVapidPublicKey } from "@/lib/api";

/** Convert a base64url VAPID key to the Uint8Array the Push API expects. */
function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const buffer = new ArrayBuffer(raw.length);
  const arr = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

/**
 * Web Push subscription lifecycle for scheduled-run notifications.
 * `enable(token)` registers the service worker, asks permission, subscribes,
 * and stores the subscription against the signed-in user.
 */
export function usePushNotifications() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ok =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    setSupported(ok);
    if (ok) {
      setPermission(Notification.permission);
      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((sub) => setSubscribed(!!sub))
        .catch(() => {});
    }
  }, []);

  const enable = useCallback(async (token: string) => {
    setBusy(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.register("/push-sw.js");

      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") throw new Error("Notification permission denied");

      let key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!key) key = (await getVapidPublicKey()).publicKey;
      if (!key) throw new Error("Push is not configured (missing VAPID key)");

      const sub =
        (await reg.pushManager.getSubscription()) ||
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(key),
        }));

      await subscribePush(token, sub.toJSON());
      setSubscribed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not enable notifications");
    } finally {
      setBusy(false);
    }
  }, []);

  const disable = useCallback(async (token: string) => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await unsubscribePush(token, sub.endpoint).catch(() => {});
        await sub.unsubscribe().catch(() => {});
      }
      setSubscribed(false);
    } finally {
      setBusy(false);
    }
  }, []);

  return { supported, permission, subscribed, busy, error, enable, disable };
}
