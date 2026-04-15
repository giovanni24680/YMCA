/* eslint-disable no-restricted-globals */
const VERSION = "2026-04-15-oulm-4";
const CACHE_STATIC = `oulm-static-${VERSION}`;

const DB_NAME = "oulm-sw-sync";
const DB_VERSION = 1;
const OUTBOX = "exportOutbox";

const PRECACHE_PATHS = [
    "./site.webmanifest",
    "./offline.html",
    "./index.html",
    "./homebase.html",
    "./events.html",
    "./event-detail.html",
    "./rsvp.html",
    "./onboarding.html",
    "./map.html",
    "./host.html",
    "./booking.html",
    "./progress.html",
    "./partners.html",
    "./about.html",
    "./wireframes.html",
    "./style.css",
    "./main.js",
    "./register-sw.js",
    "./assets/css/tokens.css",
    "./assets/css/base.css",
    "./assets/css/layout.css",
    "./assets/css/components.css",
    "./assets/css/branding.css",
    "./assets/css/pages/guide.css",
    "./assets/css/pages/homebase.css",
    "./assets/css/pages/events.css",
    "./assets/css/pages/map.css",
    "./assets/css/pages/host.css",
    "./assets/css/pages/progress.css",
    "./assets/css/pages/partners.css",
    "./assets/js/push-config.js",
    "./assets/js/app.js",
    "./assets/js/index-entry.js",
    "./assets/js/calibrator.js",
    "./assets/js/handshake-form.js",
    "./assets/js/data/handshake-codes.js",
    "./assets/js/storage.js",
    "./assets/js/data/events.js",
    "./assets/js/data/venues.js",
    "./assets/js/data/partners.js",
    "./assets/js/ui/export.js",
    "./assets/js/ui/filters.js",
    "./assets/js/ui/stepper.js",
    "./assets/js/ui/modal.js",
    "./assets/js/ui/push.js",
    "./assets/js/ui/background-sync.js",
    "./assets/js/map/leaflet-map.js",
    "./assets/OULM.svg",
    "./assets/YMCA.svg",
    "./assets/OULM Lockup.svg",
    "./assets/js/three/ambient-scene.js",
    "./assets/js/three/partners-scene.js",
    "./assets/icons/favicon-32.png",
    "./assets/icons/icon-192.png",
    "./assets/icons/icon-512.png",
    "./assets/icons/icon-512-maskable.png",
    "./assets/OULM.svg",
    "./assets/YMCA.svg",
    "./assets/OULM Lockup.svg"
];

function toAbsoluteUrl(path) {
    return new URL(path, self.registration.scope).href;
}

function openDb() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(OUTBOX)) {
                db.createObjectStore(OUTBOX, { keyPath: "id", autoIncrement: true });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function enqueueExportJob(filename) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(OUTBOX, "readwrite");
        const addReq = tx.objectStore(OUTBOX).add({
            type: "export",
            filename: filename || "oulm-export.json",
            createdAt: Date.now()
        });
        addReq.onsuccess = () => resolve(addReq.result);
        addReq.onerror = () => reject(addReq.error);
    });
}

async function getAllJobs() {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(OUTBOX, "readonly");
        const r = tx.objectStore(OUTBOX).getAll();
        r.onsuccess = () => resolve(r.result || []);
        r.onerror = () => reject(r.error);
    });
}

async function removeJob(id) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(OUTBOX, "readwrite");
        tx.objectStore(OUTBOX).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function flushOneExportJob() {
    const jobs = await getAllJobs();
    if (!jobs.length) return;
    const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    if (!clients.length) return;
    const job = jobs[0];
    clients[0].postMessage({ type: "RUN_EXPORT", filename: job.filename, id: job.id });
}

async function precacheAll() {
    const cache = await caches.open(CACHE_STATIC);
    await Promise.all(
        PRECACHE_PATHS.map(async (path) => {
            const url = toAbsoluteUrl(path);
            try {
                const res = await fetch(url, { cache: "reload" });
                if (res.ok) await cache.put(url, res);
            } catch {
                // ignore missing optional assets in dev
            }
        })
    );
}

async function deleteOldCaches() {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE_STATIC).map((k) => caches.delete(k)));
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_STATIC);
    const cached = await cache.match(request);

    const networkFetch = fetch(request)
        .then((response) => {
            if (response && response.ok && request.method === "GET") {
                cache.put(request, response.clone()).catch(() => {});
            }
            return response;
        })
        .catch(() => undefined);

    return cached || (await networkFetch);
}

async function networkFirstNavigate(request) {
    try {
        return await fetch(request);
    } catch {
        const url = new URL(request.url);
        const pathKey = new URL(url.pathname, url.origin).href;

        const cachedPath = await caches.match(pathKey);
        if (cachedPath) return cachedPath;

        const cachedFull = await caches.match(request);
        if (cachedFull) return cachedFull;

        const offline = await caches.match(toAbsoluteUrl("./offline.html"));
        return offline || new Response("Offline", { status: 503, statusText: "Offline" });
    }
}

self.addEventListener("install", (event) => {
    event.waitUntil(
        precacheAll()
            .then(() => self.skipWaiting())
            .catch(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        deleteOldCaches()
            .then(() => self.clients.claim())
            .catch(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    const request = event.request;
    if (request.method !== "GET") return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    if (request.mode === "navigate") {
        event.respondWith(networkFirstNavigate(request));
        return;
    }

    event.respondWith(staleWhileRevalidate(request));
});

self.addEventListener("push", (event) => {
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch {
        data = {};
    }

    const title = data.title || "OULM";
    const body = data.body || "You have a new update.";
    const openUrl = data.url || "./homebase.html";
    const icon = toAbsoluteUrl("./assets/icons/icon-192.png");

    event.waitUntil(
        self.registration.showNotification(title, {
            body,
            icon,
            badge: icon,
            data: { url: openUrl },
            tag: data.tag || "oulm-default",
            renotify: Boolean(data.renotify)
        })
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const url = event.notification.data?.url || "./homebase.html";
    const target = new URL(url, self.registration.scope).href;
    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            const targetPath = new URL(target).pathname;
            for (const client of clientList) {
                try {
                    if (new URL(client.url).pathname === targetPath && "focus" in client) return client.focus();
                } catch {
                    // ignore invalid client URLs
                }
            }
            if (self.clients.openWindow) return self.clients.openWindow(target);
            return undefined;
        })
    );
});

self.addEventListener("sync", (event) => {
    if (event.tag === "oulm-export") {
        event.waitUntil(flushOneExportJob());
    }
});

self.addEventListener("periodicsync", (event) => {
    if (event.tag === "oulm-periodic") {
        event.waitUntil(
            (async () => {
                try {
                    await precacheAll();
                } catch {
                    // ignore
                }
                const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
                clients.forEach((c) => c.postMessage({ type: "PERIODIC_SYNC" }));
            })()
        );
    }
});

self.addEventListener("message", (event) => {
    if (event.data?.type === "ENQUEUE_EXPORT") {
        event.waitUntil(
            (async () => {
                await enqueueExportJob(event.data.filename);
                await flushOneExportJob();
            })()
        );
    }

    if (event.data?.type === "DRAIN_EXPORT_QUEUE") {
        event.waitUntil(flushOneExportJob());
    }

    if (event.data?.type === "EXPORT_DONE" && event.data.id != null) {
        event.waitUntil(
            (async () => {
                await removeJob(event.data.id);
                await flushOneExportJob();
            })()
        );
    }
});
