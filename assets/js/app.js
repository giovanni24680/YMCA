import { events, featuredEventSlugs, getEventBySlug } from "./data/events.js";
import { venues, getVenueByEventSlug, getVenueById } from "./data/venues.js";
import { onboardingClusters, partners, progressSignals } from "./data/partners.js";
import { ensureProgressSeed, mergeState, readState, storageKeys, writeState } from "./storage.js";
import { initExportButtons } from "./ui/export.js";
import { initFilters } from "./ui/filters.js";
import { initStepper } from "./ui/stepper.js";
import { initAmbientScene } from "./three/ambient-scene.js";
import { initLeafletMap } from "./map/leaflet-map.js";

const body = document.body;
const page = body.dataset.page;

initExportButtons();
ensureProgressSeed();

if (document.querySelector("[data-stepper]")) initStepper();
if (document.querySelector("[data-ambient-scene]")) initAmbientScene();
if (page === "partners") {
    import("./three/partners-scene.js").then((m) => m.initPartnersScene());
}

hydrateAppShell();
routePage();
initFilters();
initScrollReveal();

function hydrateAppShell() {
    const current = `${page}.html`;
    document.querySelectorAll(".tab-bar__item").forEach((a) => {
        const tab = a.dataset.tab;
        const isEvents = tab === "events" && ["events", "event-detail", "rsvp", "onboarding"].includes(page);
        const isHost = tab === "host" && ["host", "booking"].includes(page);
        const isProgress = tab === "progress" && ["progress", "partners", "about"].includes(page);
        const isExact = a.getAttribute("href") === current;
        if (isExact || isEvents || isHost || isProgress) {
            a.setAttribute("aria-current", "page");
        }
    });
}

function initScrollReveal() {
    const els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        els.forEach((el) => { el.dataset.reveal = "visible"; });
        return;
    }
    const root = document.querySelector(".screen");
    const obs = new IntersectionObserver(
        (entries) => entries.forEach((e) => {
            if (e.isIntersecting) { e.target.dataset.reveal = "visible"; obs.unobserve(e.target); }
        }),
        { threshold: 0.08, rootMargin: "0px 0px -40px 0px", root }
    );
    els.forEach((el) => obs.observe(el));
}

function routePage() {
    const map = {
        homebase: renderHomebase,
        events: renderEventsPage,
        "event-detail": renderEventDetail,
        rsvp: renderRsvpPage,
        onboarding: renderOnboardingPage,
        map: renderMapPage,
        host: renderHostPage,
        booking: renderBookingPage,
        progress: renderProgressPage,
        partners: renderPartnersPage,
        about: renderAboutPage
    };
    map[page]?.();
}

function renderHomebase() {
    const featured = featuredEventSlugs.map((s) => getEventBySlug(s)).filter(Boolean);
    inject("#featured-events", featured.map(eventCarouselCard).join(""));
    inject("#homebase-venues", venues.slice(0, 4).map(venueCarouselCard).join(""));
    inject("#homebase-partners", partners.slice(0, 4).map(partnerCarouselCard).join(""));

    const p = ensureProgressSeed();
    inject("#community-pulse", [
        pulse(events.length, "Events"),
        pulse(venues.length, "Venues"),
        pulse(p.presencePoints + p.hostPoints, "Points"),
        pulse(partners.length, "Pathways")
    ].join(""));
}

function renderEventsPage() {
    inject("#events-list", events.map(eventListCard).join(""));
}

function renderEventDetail() {
    const ev = resolveEventFromQuery() || events[0];
    const venue = getVenueById(ev.venueId);
    const pct = Math.round((ev.attendees / ev.capacity) * 100);

    const title = document.getElementById("app-bar-title");
    if (title) title.textContent = ev.title;

    inject("#event-detail-root", `
        <section class="event-hero-card">
            <div class="stack">
                <span class="eyebrow">${ev.county} / ${ev.town}</span>
                <h1>${ev.title}</h1>
                <p style="color:var(--color-dark-text-muted);font-size:var(--step--1)">${ev.description}</p>
                <div class="tag-list">
                    ${ev.vibe.map((v) => `<span class="tag">${v}</span>`).join("")}
                    <span class="tag">${ev.age}</span>
                </div>
                <div class="attendance-bar"><div class="attendance-bar__fill" style="width:${pct}%"></div></div>
                <span class="eyebrow" style="color:var(--color-dark-text-muted)">${ev.attendees} of ${ev.capacity} spots</span>
            </div>
        </section>
        <section class="screen__section">
            <div class="stack">
                <span class="eyebrow">Hosted by ${ev.host}</span>
                <p style="font-size:var(--step--1);color:var(--color-ink-muted)">${ev.credibility}</p>
            </div>
        </section>
        <section class="screen__section social-proof-strip">
            ${ev.socialProof.map((s) => `<article class="metric-card"><span class="eyebrow">Signal</span><strong>${s}</strong></article>`).join("")}
        </section>
        <section class="screen__section">
            <div class="stack">
                <h3>Why this format works</h3>
                <p style="color:var(--color-ink-muted);font-size:var(--step--1)">${ev.detailSummary}</p>
                <div class="stack--tight">
                    <span class="eyebrow">Schedule</span>
                    <ul class="portfolio-list" role="list">
                        ${ev.schedule.map((s) => `<li>${s}</li>`).join("")}
                    </ul>
                </div>
            </div>
        </section>
        <section class="screen__section">
            <div class="stack">
                <span class="eyebrow">Venue</span>
                <h3>${venue.name}</h3>
                <p style="color:var(--color-ink-muted);font-size:var(--step--1)">${venue.story}</p>
                <dl class="detail-list">
                    <div><dt>Date</dt><dd>${ev.dateLabel}</dd></div>
                    <div><dt>Time</dt><dd>${ev.timeLabel}</dd></div>
                    <div><dt>Capacity</dt><dd>${ev.capacity} spots</dd></div>
                    <div><dt>Age fit</dt><dd>${ev.age}</dd></div>
                </dl>
            </div>
        </section>
        <section class="screen__section">
            <div class="faq-list">
                ${ev.faq.map((f) => `<details><summary>${f.q}</summary><p>${f.a}</p></details>`).join("")}
            </div>
        </section>
    `);

    const bar = document.getElementById("event-action-bar");
    const rsvpBtn = document.getElementById("rsvp-cta");
    const showBtn = document.getElementById("show-up-cta");
    if (bar) {
        bar.style.display = "flex";
        if (rsvpBtn) rsvpBtn.href = `rsvp.html?event=${ev.slug}`;
        if (showBtn) showBtn.href = `rsvp.html?event=${ev.slug}`;
    }
}

function renderRsvpPage() {
    const ev = resolveEventFromQuery() || events[0];
    const existing = readState(storageKeys.rsvp, {});

    inject("#rsvp-summary", `
        <div class="stack--tight">
            <span class="eyebrow">${ev.county} / ${ev.town}</span>
            <h2>${ev.title}</h2>
            <div class="tag-list">
                <span class="tag">${ev.dateLabel}</span>
                <span class="tag">${ev.timeLabel}</span>
            </div>
        </div>
    `);

    wireToggle("[data-intent]", "intent", existing.intent || "rsvp", (v) => mergeState(storageKeys.rsvp, { intent: v }));
    wireToggle("[data-guest-count]", "guestCount", String(existing.guests ?? 1), (v) => mergeState(storageKeys.rsvp, { guests: Number(v) }));

    document.querySelectorAll("[data-account-method]").forEach((b) => {
        b.addEventListener("click", () => {
            document.querySelectorAll("[data-account-method]").forEach((n) => { n.dataset.active = "false"; });
            b.dataset.active = "true";
        });
    });

    document.querySelector("[data-rsvp-submit]")?.addEventListener("click", () => {
        const payload = {
            eventSlug: ev.slug,
            eventTitle: ev.title,
            guests: Number(document.querySelector("[data-guest-count][data-active='true']")?.dataset.guestCount || 1),
            intent: document.querySelector("[data-intent][data-active='true']")?.dataset.intent || "rsvp",
            arrivalNote: document.querySelector("#arrival-note")?.value || "",
            accountMethod: document.querySelector("[data-account-method][data-active='true']")?.dataset.accountMethod || null,
            createdAt: new Date().toISOString()
        };
        writeState(storageKeys.rsvp, payload);
        const cur = ensureProgressSeed();
        writeState(storageKeys.progress, {
            ...cur,
            presencePoints: cur.presencePoints + 3,
            eventsAttended: cur.eventsAttended + 1,
            latestProof: [`RSVP'd ${ev.title}`, ...cur.latestProof].slice(0, 4)
        });
        const fb = document.querySelector("#rsvp-feedback");
        if (fb) {
            fb.className = "screen__pad rsvp-confirmation";
            fb.innerHTML = `<strong>Intent saved.</strong> Your RSVP is stored on this device. <a href="onboarding.html" style="color:inherit;text-decoration:underline">Continue to onboarding \u2192</a>`;
        }
    });
}

function renderOnboardingPage() {
    inject("#onboarding-clusters", onboardingClusters.map((c) => `
        <div class="stack--tight" data-reveal>
            <span class="eyebrow">${c.label}</span>
            <div class="selection-grid">
                ${c.options.map((o) => `<button class="choice-chip" type="button" data-pick="${o}">${o}</button>`).join("")}
            </div>
        </div>
    `).join(""));

    document.querySelectorAll("[data-pick]").forEach((b) => {
        b.addEventListener("click", () => { b.dataset.active = b.dataset.active === "true" ? "false" : "true"; });
    });

    document.querySelector("[data-onboarding-save]")?.addEventListener("click", () => {
        const fd = new FormData(document.querySelector("#onboarding-form"));
        const picks = [...document.querySelectorAll("[data-pick][data-active='true']")].map((b) => b.dataset.pick);
        writeState(storageKeys.profileSeed, {
            name: fd.get("displayName"), ageBand: fd.get("ageBand"), picks,
            preferredEntry: fd.get("entryStyle"), savedAt: new Date().toISOString()
        });
        mergeState(storageKeys.progress, { communityRole: picks.includes("Ready to host") ? "Connector" : "Regular" });

        const sug = getSuggestions(picks);
        inject("#onboarding-suggestions", sug.length
            ? `<div class="screen__pad stack">${sug.map((s) => `<div class="card--accent card"><h4>${s.title}</h4><p style="font-size:var(--step--1);color:var(--color-ink-muted)">${s.body}</p></div>`).join("")}</div>`
            : `<div class="screen__pad empty-state">Pick interests to see suggested circles.</div>`
        );
    });
}

function renderMapPage() {
    const sheet = document.getElementById("venue-sheet");
    const sheetContent = document.getElementById("venue-sheet-content");

    const showVenue = (venue) => {
        if (!sheetContent || !sheet) return;
        sheetContent.innerHTML = `
            <div class="stack">
                <span class="eyebrow">${venue.county} / ${venue.town}</span>
                <h2>${venue.name}</h2>
                <p style="color:var(--color-ink-muted);font-size:var(--step--1)">${venue.story}</p>
                <div class="tag-list">${venue.amenities.map((a) => `<span class="tag">${a}</span>`).join("")}</div>
                <dl class="detail-list">
                    <div><dt>Type</dt><dd>${venue.kind === "hq" ? "Homebase HQ" : venue.kind === "flagship" ? "Flagship" : "Community"}</dd></div>
                    <div><dt>Address</dt><dd>${venue.address}</dd></div>
                </dl>
                <a class="button" href="event-detail.html?event=${venue.nextEventSlug}">See linked event</a>
            </div>
        `;
        sheet.dataset.open = "true";
    };

    sheet?.querySelector(".venue-sheet__handle")?.addEventListener("click", () => {
        sheet.dataset.open = "false";
    });

    initLeafletMap(showVenue);
}

function renderHostPage() {
    const draft = readState(storageKeys.bookingDraft, null);
    if (!draft) return;
    inject("#host-latest-draft", `
        <div class="screen__section">
            <div class="card--accent card">
                <span class="eyebrow">Latest draft</span>
                <h4>${draft.eventName || "Untitled"}</h4>
                <div class="cluster"><span class="status-pill">${draft.status}</span><span class="tag">${draft.venuePreference || "New space"}</span></div>
                <a class="button-link" href="booking.html">Continue draft</a>
            </div>
        </div>
    `);
}

function renderBookingPage() {
    const draft = readState(storageKeys.bookingDraft, null);
    if (draft) {
        const n = document.querySelector("#booking-status-note");
        if (n) n.innerHTML = `<span class="status-pill">${draft.status}</span> ${draft.eventName || "Untitled"}`;
    }

    document.querySelector("[data-step-submit]")?.addEventListener("click", () => {
        const fd = new FormData(document.querySelector("#booking-form"));
        const payload = {
            eventName: fd.get("eventName"), venuePreference: fd.get("venuePreference"),
            eventType: fd.get("eventType"), recurrence: fd.get("recurrence"),
            capacityTier: fd.get("capacityTier"), accessibility: fd.get("accessibility"),
            equipment: fd.get("equipment"), safetyIntent: fd.get("safetyIntent"),
            resourcing: fd.get("resourcing"), status: "Pending review",
            updatedAt: new Date().toISOString()
        };
        writeState(storageKeys.bookingDraft, payload);
        const cur = ensureProgressSeed();
        writeState(storageKeys.progress, {
            ...cur, hostPoints: cur.hostPoints + 5,
            latestProof: [`Draft: ${payload.eventName}`, ...cur.latestProof].slice(0, 4)
        });
        const fb = document.querySelector("#booking-feedback");
        if (fb) { fb.className = "rsvp-confirmation"; fb.innerHTML = `<strong>Draft saved.</strong> Faux pending submission stored locally.`; }
    });
}

function renderProgressPage() {
    const p = ensureProgressSeed();
    const rsvp = readState(storageKeys.rsvp, null);
    const profile = readState(storageKeys.profileSeed, null);

    if (profile?.name) {
        const card = document.getElementById("profile-card");
        if (card) {
            const avatar = card.querySelector(".profile-card__avatar");
            const name = card.querySelector("h3");
            if (avatar) avatar.textContent = (profile.name[0] || "O").toUpperCase();
            if (name) name.textContent = p.communityRole;
        }
    }

    inject("#progress-metrics", `
        <article class="metric-card">${radialSVG(Math.min(p.presencePoints, 100), 100)}<span class="eyebrow">Presence</span></article>
        <article class="metric-card">${radialSVG(Math.min(p.hostPoints, 50), 50)}<span class="eyebrow">Host</span></article>
        <article class="metric-card">${radialSVG(p.verifiedHours, 40)}<span class="eyebrow">Hours</span></article>
    `);

    inject("#progress-signals", progressSignals.map((s) => `
        <article class="signal-card"><span class="eyebrow"><span class="signal-card__icon"></span>${s.label}</span><p style="font-size:var(--step--1);color:var(--color-ink-muted)">${s.summary}</p></article>
    `).join(""));

    inject("#progress-history", (p.latestProof || []).map((i) => `<li>${i}</li>`).join("") || "<li>No activity yet.</li>");

    if (rsvp) inject("#progress-rsvp", `<div class="card"><span class="eyebrow">Latest RSVP</span><h4>${rsvp.eventTitle}</h4><div class="tag-list"><span class="tag">${rsvp.intent}</span><span class="tag">${rsvp.guests} guest${rsvp.guests > 1 ? "s" : ""}</span></div></div>`);

    const ladder = document.querySelector("#role-ladder");
    if (ladder) {
        ladder.innerHTML = ["Newcomer", "Regular", "Connector", "Host", "Mentor"]
            .map((r) => `<span${r === p.communityRole ? ' data-active="true"' : ""}>${r}</span>`).join("");
    }

    document.querySelector("#external-links-form")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        writeState(storageKeys.externalSignals, { github: fd.get("github"), linkedin: fd.get("linkedin"), project: fd.get("project") });
        const n = document.querySelector("#external-links-feedback");
        if (n) n.textContent = "External proof saved locally.";
    });
}

function renderPartnersPage() { inject("#partner-list", partners.map(partnerCardTemplate).join("")); }

function renderAboutPage() {
    const v = getVenueByEventSlug("show-up-supper-club");
    if (v) inject("#about-story-anchor", `<div class="card--accent card"><span class="eyebrow">Homebase anchor</span><h4>${v.name}</h4><p style="color:var(--color-ink-muted);font-size:var(--step--1)">${v.story}</p><a class="button-link" href="map.html">Find on map</a></div>`);
}

function resolveEventFromQuery() {
    const s = new URLSearchParams(window.location.search).get("event");
    return s ? getEventBySlug(s) : null;
}

function eventCarouselCard(ev) {
    const pct = Math.round((ev.attendees / ev.capacity) * 100);
    return `
        <a class="card card--interactive" href="event-detail.html?event=${ev.slug}">
            <div class="card__visual"></div>
            <span class="eyebrow">${ev.county}</span>
            <h4 style="line-height:1.15">${ev.title}</h4>
            <div class="tag-list"><span class="tag">${ev.dateLabel}</span><span class="tag">${ev.age}</span></div>
            <div class="attendance-bar"><div class="attendance-bar__fill" style="width:${pct}%"></div></div>
        </a>
    `;
}

function eventListCard(ev) {
    const pct = Math.round((ev.attendees / ev.capacity) * 100);
    return `
        <a class="card card--interactive event-card" href="event-detail.html?event=${ev.slug}" data-county="${ev.county}" data-age="${ev.age}" data-kind="${ev.vibe.join(" ")}" data-vibe="${ev.vibe.join(" ")}">
            <div class="event-card__visual"></div>
            <div class="event-card__body">
                <span class="eyebrow">${ev.county}</span>
                <h4 class="event-card__title">${ev.title}</h4>
                <div class="event-card__meta">
                    <span class="tag">${ev.dateLabel}</span>
                    <span class="tag">${ev.age}</span>
                </div>
                <div class="attendance-bar"><div class="attendance-bar__fill" style="width:${pct}%"></div></div>
            </div>
        </a>
    `;
}

function venueCarouselCard(venue) {
    const kind = venue.kind === "hq" ? "HQ" : venue.kind === "flagship" ? "Flagship" : "Community";
    return `
        <div class="card card--interactive" style="cursor:pointer" onclick="window.location='map.html'">
            <span class="eyebrow">${venue.county}</span>
            <h4>${venue.name}</h4>
            <span class="tag">${kind}</span>
        </div>
    `;
}

function partnerCarouselCard(p) {
    return `
        <div class="card">
            <span class="eyebrow">${p.category}</span>
            <h4>${p.name}</h4>
            <span class="tag">${p.county}</span>
        </div>
    `;
}

function partnerCardTemplate(p) {
    return `
        <article class="card">
            <span class="eyebrow">${p.category}</span>
            <h4>${p.name}</h4>
            <p style="color:var(--color-ink-muted);font-size:var(--step--1)">${p.summary}</p>
            <div class="tag-list"><span class="tag">${p.county}</span><span class="tag">${p.pathway}</span></div>
        </article>
    `;
}

function pulse(val, label) {
    return `<div class="community-pulse__metric"><strong>${val}</strong><span>${label}</span></div>`;
}

function radialSVG(val, max) {
    const r = 32;
    const c = 2 * Math.PI * r;
    const off = c * (1 - Math.min(val / max, 1));
    return `<div class="radial-progress"><svg viewBox="0 0 72 72"><circle class="radial-progress__track" cx="36" cy="36" r="${r}"/><circle class="radial-progress__fill" cx="36" cy="36" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${off}"/></svg><span class="radial-progress__label">${val}</span></div>`;
}

function inject(sel, html) {
    const el = document.querySelector(sel);
    if (el) el.innerHTML = html;
}

function wireToggle(sel, attr, initial, cb) {
    document.querySelectorAll(sel).forEach((b) => {
        b.dataset.active = String(b.dataset[attr] === initial);
        b.addEventListener("click", () => {
            document.querySelectorAll(sel).forEach((n) => { n.dataset.active = "false"; });
            b.dataset.active = "true";
            cb(b.dataset[attr]);
        });
    });
}

function getSuggestions(picks) {
    const s = [];
    if (picks.includes("Comp sci") || picks.includes("Build nights")) s.push({ title: "Prototype circle", body: "Bedford makers group, twice monthly, logs project proof." });
    if (picks.includes("Anime") || picks.includes("Film")) s.push({ title: "Culture cluster", body: "Film and anime lane: screenings, themed nights, small circles." });
    if (picks.includes("Need a reason to show up") || picks.includes("Low pressure")) s.push({ title: "Warm-entry path", body: "Food-first or walk-and-talk events where the format does the heavy lifting." });
    if (picks.includes("Cooking") || picks.includes("Cafe hangs")) s.push({ title: "Homebase regular", body: "Supper Club and cafe socials where food is the shared anchor." });
    return s;
}
