import { VAPID_PUBLIC_KEY } from "../push-config.js";
import { readState, writeState, storageKeys } from "../storage.js";

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base64);
    return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

function setText(el, text) {
    if (!el) return;
    el.textContent = text;
}

export function initPushUi() {
    const root = document.querySelector("[data-pwa-push]");
    if (!root) return;

    const enableBtn = root.querySelector("[data-push-enable]");
    const disableBtn = root.querySelector("[data-push-disable]");
    const feedback = root.querySelector("[data-push-feedback]");
    const jsonArea = root.querySelector("[data-push-subscription-json]");

    const saved = readState(storageKeys.pushSubscription, null);
    if (saved && jsonArea) jsonArea.value = JSON.stringify(saved, null, 2);

    enableBtn?.addEventListener("click", async () => {
        if (!("Notification" in window) || !("serviceWorker" in navigator)) {
            setText(feedback, "Notifications or Service Workers are not supported here.");
            return;
        }

        const reg = await navigator.serviceWorker.ready;
        const perm = await Notification.requestPermission();
        if (perm !== "granted") {
            setText(feedback, "Permission not granted — notifications stay off.");
            return;
        }

        if (!VAPID_PUBLIC_KEY) {
            setText(feedback, "VAPID public key is not configured yet.");
            return;
        }

        try {
            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });
            const json = sub.toJSON();
            writeState(storageKeys.pushSubscription, json);
            if (jsonArea) jsonArea.value = JSON.stringify(json, null, 2);
            setText(feedback, "Subscribed. Copy the JSON for your Swift/backend bridge.");
        } catch (e) {
            console.warn(e);
            setText(feedback, "Could not subscribe (HTTPS required outside localhost).");
        }
    });

    disableBtn?.addEventListener("click", async () => {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) await sub.unsubscribe();
        try {
            window.localStorage.removeItem(storageKeys.pushSubscription);
        } catch {
            /* ignore */
        }
        if (jsonArea) jsonArea.value = "";
        setText(feedback, "Unsubscribed on this device.");
    });
}
