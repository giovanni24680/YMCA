/* global navigator, window, document */
(function registerOulmServiceWorker() {
    if (!("serviceWorker" in navigator)) return;

    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(() => {});
    });
}());
