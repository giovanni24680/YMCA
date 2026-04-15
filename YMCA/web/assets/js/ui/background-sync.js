import { downloadStateFile } from "../storage.js";

async function postToSw(data) {
    const reg = await navigator.serviceWorker.ready;
    if (!reg.active) return false;
    reg.active.postMessage(data);
    return true;
}

export function initBackgroundSyncUi() {
    const root = document.querySelector("[data-pwa-sync]");
    const feedback = root?.querySelector("[data-sync-feedback]");

    const setFb = (t) => {
        if (feedback) feedback.textContent = t;
    };

    navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "RUN_EXPORT") {
            downloadStateFile(event.data.filename || "oulm-export.json");
            if (event.source && event.data?.id != null) {
                event.source.postMessage({ type: "EXPORT_DONE", id: event.data.id });
            }
        }
        if (event.data?.type === "PERIODIC_SYNC") {
            setFb("Background asset refresh tick received.");
        }
    });

    if (!root) return;

    const queueBtn = root.querySelector("[data-sync-queue-export]");
    const periodicBtn = root.querySelector("[data-periodic-sync]");
    const drainBtn = root.querySelector("[data-sync-drain]");

    queueBtn?.addEventListener("click", async () => {
        const ok = await postToSw({ type: "ENQUEUE_EXPORT", filename: "oulm-export.json" });
        if (!ok) {
            setFb("Service worker not active yet — try again in a moment.");
            return;
        }
        try {
            const reg = await navigator.serviceWorker.ready;
            if ("sync" in reg) {
                await reg.sync.register("oulm-export");
                setFb("Export queued for Background Sync (runs when the browser allows).");
            } else {
                setFb("Background Sync not supported — exporting now.");
                downloadStateFile("oulm-export.json");
            }
        } catch (e) {
            console.warn(e);
            setFb("Could not register sync — exporting now.");
            downloadStateFile("oulm-export.json");
        }
    });

    drainBtn?.addEventListener("click", async () => {
        const ok = await postToSw({ type: "DRAIN_EXPORT_QUEUE" });
        setFb(ok ? "Asked service worker to flush the export queue." : "Service worker not ready.");
    });

    periodicBtn?.addEventListener("click", async () => {
        try {
            const reg = await navigator.serviceWorker.ready;
            if ("periodicSync" in reg) {
                await reg.periodicSync.register("oulm-periodic", { minInterval: 12 * 60 * 60 * 1000 });
                setFb("Periodic Background Sync registered (Chromium; may require engagement / permission).");
            } else {
                setFb("Periodic Background Sync is not available in this browser.");
            }
        } catch (e) {
            console.warn(e);
            setFb("Periodic registration failed (often blocked until the app is used more).");
        }
    });
}
