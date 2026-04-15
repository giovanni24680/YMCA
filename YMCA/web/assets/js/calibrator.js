import { setCalibratorComplete } from "./storage.js";

const OULM = '<img src="assets/OULM.svg" alt="OULM" class="brand-inline brand-inline--lg" style="filter:brightness(2)" decoding="async">';

const SLIDES = [
    { kicker: "The movement", body: "140 years of connection, now in your pocket." },
    { kicker: "The third space", body: `The Woodland Café is not just for coffee — it is your HQ. Leavesden Country Park is your lungs. Together they are the physical firmware of ${OULM}.` },
    { kicker: "The who", body: "For the seekers, the leaders, and the families who want accountability that starts with people, not paperwork." },
    { kicker: "The what", body: "Mentoring, hosting, and community action — one current from digital discovery to physical belonging." },
    { kicker: "The how", body: "Book online. Meet in person. Unlock the city with a handshake, not a ghosted form." },
    { kicker: "The why", body: "Because real connection happens off-screen — and safety here is social currency, not surveillance." },
    { kicker: "The handshake", body: `Ready to join the ${OULM} flow?`, isFinal: true }
];

export function initCalibrator() {
    const track = document.querySelector("[data-calibrator-track]");
    const dots = document.querySelector("[data-calibrator-dots]");
    const prev = document.querySelector("[data-calibrator-prev]");
    const next = document.querySelector("[data-calibrator-next]");
    const enter = document.querySelector("[data-calibrator-enter]");
    const label = document.querySelector("[data-calibrator-slide-label]");
    if (!track || !dots) return;

    track.innerHTML = SLIDES.map((slide, i) => `
        <article class="calibrator__slide" data-calibrator-slide="${i}" aria-hidden="${i === 0 ? "false" : "true"}">
            <span class="eyebrow calibrator__kicker">${slide.kicker}</span>
            <p class="calibrator__body">${slide.body}</p>
        </article>
    `).join("");

    dots.innerHTML = SLIDES.map((_, i) => `
        <button type="button" class="calibrator__dot" data-calibrator-dot="${i}" aria-label="Slide ${i + 1} of ${SLIDES.length}" aria-current="${i === 0 ? "true" : "false"}"></button>
    `).join("");

    let index = 0;
    const slides = () => [...track.querySelectorAll("[data-calibrator-slide]")];
    const dotEls = () => [...dots.querySelectorAll(".calibrator__dot")];

    function sync() {
        slides().forEach((el, i) => {
            el.dataset.calibratorSlideActive = String(i === index);
            el.setAttribute("aria-hidden", String(i !== index));
        });
        dotEls().forEach((d, i) => {
            d.setAttribute("aria-current", i === index ? "true" : "false");
        });
        if (label) label.textContent = `Step ${index + 1} of ${SLIDES.length}`;
        const isFinal = index === SLIDES.length - 1;
        if (enter) enter.hidden = !isFinal;
        if (next) next.hidden = isFinal;
        if (prev) prev.disabled = index === 0;
    }

    function go(delta) {
        index = Math.max(0, Math.min(SLIDES.length - 1, index + delta));
        sync();
    }

    prev?.addEventListener("click", () => go(-1));
    next?.addEventListener("click", () => go(1));
    dots.addEventListener("click", (e) => {
        const dot = e.target.closest("[data-calibrator-dot]");
        if (!dot) return;
        index = Number(dot.dataset.calibratorDot);
        sync();
    });

    enter?.addEventListener("click", () => {
        setCalibratorComplete();
        window.location.href = "homebase.html";
    });

    sync();
}
