import { _logger } from "../index";

export const publicVapidKey = "BK9WyTntubhYmSo5dlE6mlJW06XiPtZrZa5EdGLUyLp1RA8AHj8Q3sqlPmQOC7WpKtxhVxW9BBH0z4FXqUU7hsQ";

export const publishPushNotification = async () => {
  if (navigator.serviceWorker) {
    const registration: ServiceWorkerRegistration = await navigator.serviceWorker.register("/pushnotifications.js", { scope: "/" });
    navigator.serviceWorker.ready.then(async (registration: ServiceWorkerRegistration) => {
      _logger.LogDebug("Push notification : waiting for subscription ...");
      const subscription: PushSubscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicVapidKey) });
      _logger.LogDebug("subscribed");
  
      const data: any ={
        payload: new Date().toLocaleString(), 
        subscription
      }
      await fetch("/subscribe", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } });
  
      if (!navigator.serviceWorker.onmessage) {
        navigator.serviceWorker.onmessage = (event: MessageEvent) => {
          _logger.LogWarning(`Notification: ${event.data.pushNotification}`);
        }

        navigator.serviceWorker.ready.then(registration => {
           _logger.LogDebug("Push notification: navigator.serviceWorker.ready");
          registration.active?.postMessage("init");
        });
      }
    });
  } else {
    _logger.LogError("Service workers are not supported in this browser");
  }
}

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

