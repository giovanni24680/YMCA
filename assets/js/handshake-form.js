import { mergeUserProfile } from "./storage.js";
import { VALID_HANDSHAKE_CODES } from "./data/handshake-codes.js";

function normalizeCode(raw) {
    return String(raw || "").trim().toUpperCase().replace(/\s+/g, "-");
}

export function initHandshakeForm(root = document) {
    const form = root.querySelector("[data-handshake-form]");
    if (!form) return;

    const feedback = form.querySelector("[data-handshake-feedback]");
    const input = form.querySelector("[data-handshake-input]");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const code = normalizeCode(input?.value);
        if (!code) {
            if (feedback) feedback.textContent = "Enter the code your mentor gave you.";
            return;
        }
        if (VALID_HANDSHAKE_CODES.includes(code)) {
            mergeUserProfile({ isVerified: true });
            window.sessionStorage.setItem("oulm_just_verified", "1");
            document.body?.setAttribute("data-bloom", "active");
            if (feedback) {
                feedback.textContent = "You are in the flow. Host tools and Partner Pathways are live — welcome to the member lane.";
            }
            form.querySelectorAll("input,button").forEach((el) => { el.disabled = true; });
            window.setTimeout(() => {
                window.location.href = "homebase.html";
            }, 1400);
        } else if (feedback) {
            feedback.textContent = "That code did not match. Ask a mentor at the Woodland Café — there is no shame in a second try.";
        }
    });
}
