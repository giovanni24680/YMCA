const meter = document.querySelector("[data-index-meter]");
const meterHost = document.querySelector(".index-gate__meter");
const status = document.querySelector("[data-index-status]");
const autoRedirect = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (meter) {
    requestAnimationFrame(() => {
        meter.style.width = "100%";
        meterHost?.setAttribute("aria-valuenow", "100");
    });
}

if (autoRedirect) {
    window.setTimeout(() => {
        if (status) {
            status.textContent = "Opening Homebase...";
        }
        window.location.href = "homebase.html";
    }, 1400);
} else if (status) {
    status.textContent = "Auto-redirect disabled because reduced motion is enabled.";
}
