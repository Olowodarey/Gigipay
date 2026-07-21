/* GigiPay Web Push service worker — shows due-payment notifications. */

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: "GigiPay", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "GigiPay";
  const options = {
    body: data.body || "",
    icon: "/newlogo-cropped.png",
    badge: "/icon.png",
    data: { url: data.url || "/schedules" },
    tag: "gigipay-due",
    renotify: true,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url =
    (event.notification.data && event.notification.data.url) || "/schedules";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        for (const client of list) {
          if (client.url.includes(url) && "focus" in client)
            return client.focus();
        }
        if (self.clients.openWindow) return self.clients.openWindow(url);
      }),
  );
});
