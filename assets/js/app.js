import { events, featuredEventSlugs, getEventBySlug } from "./data/events.js";
import { venues, getVenueByEventSlug, getVenueById } from "./data/venues.js";
import { onboardingClusters, partners, progressSignals } from "./data/partners.js";
import {
    appendSoftRsvp,
    ensureProgressSeed,
    ensureUserProfile,
    mergeState,
    mergeUserProfile,
    readState,
    storageKeys,
    writeState
} from "./storage.js";
import { getAccess, meetInPersonCopy, pathInProgressBannerCopy, pendingHostReviewCopy } from "./access.js";
import { initHandshakeForm } from "./handshake-form.js";
import { initExportButtons } from "./ui/export.js";
import { initBackgroundSyncUi } from "./ui/background-sync.js";
import { initFilters } from "./ui/filters.js";
import { initPushUi } from "./ui/push.js";
import { initStepper } from "./ui/stepper.js";
import { initAmbientScene } from "./three/ambient-scene.js";
import { initLeafletMap } from "./map/leaflet-map.js";

const body = document.body;
const page = body.dataset.page;

const OULM_MARK = '<span class="brand-mark brand-mark--oulm brand-inline" role="img" aria-label="OULM"></span>';
const YMCA_MARK = '<span class="brand-mark brand-mark--ymca brand-inline brand-inline--ymca" role="img" aria-label="YMCA"></span>';

initExportButtons();
ensureProgressSeed();

if (new URLSearchParams(window.location.search).get("oulm_verify") === "1") {
    mergeUserProfile({ isVerified: true });
}
ensureUserProfile();

if (document.querySelector("[data-stepper]")) initStepper();
if (document.querySelector("[data-ambient-scene]")) initAmbientScene();
if (page === "partners") {
    import("./three/partners-scene.js").then((m) => m.initPartnersScene());
}

hydrateAppShell();
routePage();
initFilters();
initScrollReveal();
initTabTransitions();
initPushUi();
initBackgroundSyncUi();
initHandshakeForm();

function hydrateAppShell() {
    const current = `${page}.html`;
    const access = getAccess();
    document.querySelectorAll(".tab-bar__item").forEach((a) => {
        const tab = a.dataset.tab;
        const isEvents = tab === "events" && ["events", "event-detail", "rsvp", "onboarding"].includes(page);
        const isHost = tab === "host" && ["host", "booking"].includes(page);
        const isProgress = tab === "progress" && ["progress", "partners", "about"].includes(page);
        const isExact = a.getAttribute("href") === current;
        if (isExact || isEvents || isHost || isProgress) {
            a.setAttribute("aria-current", "page");
        }
        if (tab === "host" && !access.canHost) {
            a.dataset.gateLocked = "true";
            a.title = "Host unlocks after a Woodland Café handshake or a Leadership pathway.";
        } else if (tab === "host") {
            a.removeAttribute("data-gate-locked");
            a.removeAttribute("title");
        }
    });
}

function initScrollReveal() {
    const els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
        els.forEach((el) => { el.dataset.reveal = "visible"; el.classList.add("is-revealed"); });
        return;
    }
    const root = document.querySelector(".screen");
    const obs = new IntersectionObserver(
        (entries) => entries.forEach((e) => {
            if (e.isIntersecting) {
                e.target.dataset.reveal = "visible";
                e.target.classList.add("is-revealed");
                obs.unobserve(e.target);
            }
        }),
        { threshold: 0.08, rootMargin: "0px 0px -40px 0px", root }
    );
    els.forEach((el) => obs.observe(el));

}

function initTabTransitions() {
    document.querySelectorAll(".tab-bar__item").forEach((link) => {
        link.addEventListener("click", (e) => {
            if (link.getAttribute("aria-current") === "page") return;
            const screen = document.querySelector(".screen");
            if (!screen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
            e.preventDefault();
            const href = link.getAttribute("href");
            screen.classList.add("screen--exiting");
            setTimeout(() => { window.location.href = href; }, 130);
        });
    });
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
    const access = getAccess();
    const user = ensureUserProfile();
    const pathCopy = pathInProgressBannerCopy();
    const featured = featuredEventSlugs.map((s) => getEventBySlug(s)).filter(Boolean);
    inject("#featured-events", featured.map(eventCarouselCard).join(""));
    inject("#homebase-venues", venues.slice(0, 4).map(venueCarouselCard).join(""));
    inject("#homebase-partners", partners.slice(0, 4).map(partnerCarouselCard).join(""));

    const pathBanner = access.canHost
        ? `<div class="card path-banner path-banner--live" data-reveal><span class="eyebrow">Member lane</span><h2 class="path-banner__title">You are in the flow</h2><p class="path-banner__body">Host tools and Partner Pathways are live. The Woodland Café and Leavesden stay your north stars for real-world accountability.</p><div class="cluster" style="margin-top:var(--space-sm)"><a class="button--bronze button" href="host.html">Open Host</a><a class="button--ghost" href="map.html">Venues &amp; map</a></div></div>`
        : `<div class="card path-banner path-banner--awaiting" data-reveal><span class="eyebrow">Path in progress</span><h2 class="path-banner__title">${pathCopy.title}</h2><p class="path-banner__body">${pathCopy.body}</p><p class="path-banner__river-hint">Follow the current → Woodland Café</p><div class="cluster" style="margin-top:var(--space-md)"><a class="button" href="guide.html">How ${OULM_MARK} works</a><a class="button--ghost" href="progress.html#handshake">Handshake unlock</a></div></div>`;
    inject("#homebase-path-slot", pathBanner);
    const justVerified = window.sessionStorage.getItem("oulm_just_verified") === "1";
    if (justVerified && access.canHost) {
        document.querySelector(".path-banner--live")?.classList.add("path-banner--pulse");
        window.sessionStorage.removeItem("oulm_just_verified");
    }

    const hostCardClass = access.canHost
        ? "pillar-nav__card card card--interactive"
        : "pillar-nav__card card card--interactive pillar-nav__card--sleeping";
    const hostCardHint = access.canHost ? "Booking wizard" : "Path: Woodland handshake";
    const hostCardSleepHint = access.canHost
        ? ""
        : '<span class="pillar-nav__sleep-hint">Visit HQ to wake this lane</span>';

    inject("#homebase-hq-slot", `
        <div class="hq-module" data-reveal>
            <div class="hq-module__head">
                <span class="eyebrow">Third space dashboard</span>
                <h2 class="hq-module__title">Living HQ</h2>
                <p class="hq-module__lede">Woodland Café and Leavesden are not just buildings — they are the physical firmware of the ${OULM_MARK} system.</p>
            </div>
            <div class="hq-module__grid">
                <article class="card hq-card">
                    <span class="eyebrow">Woodland Café</span>
                    <h3 class="hq-card__name">Who&apos;s in</h3>
                    <div class="hq-avatars" aria-label="Mentors on shift">
                        <span class="hq-avatar" title="Mentor">M</span>
                        <span class="hq-avatar" title="Mentor">A</span>
                        <span class="hq-avatar" title="Peer host">K</span>
                    </div>
                    <p class="hq-vibe"><strong>Room vibe:</strong> <span class="tag">Calm focus</span> <span class="tag tag--busy">Walk-ins welcome</span></p>
                    <p class="hq-focus"><strong>Today&apos;s desk:</strong> exam-season check-ins · first handshake slots · football sign-up help</p>
                </article>
                <article class="card hq-card">
                    <span class="eyebrow">Leavesden Country Park</span>
                    <h3 class="hq-card__name">Field pulse</h3>
                    <div class="hq-avatars" aria-label="Leads on site">
                        <span class="hq-avatar" title="Walk lead">R</span>
                        <span class="hq-avatar" title="Youth worker">S</span>
                    </div>
                    <p class="hq-vibe"><strong>Outdoor energy:</strong> <span class="tag">Bright</span> <span class="tag">Breezy</span></p>
                    <p class="hq-focus"><strong>Today&apos;s loop:</strong> sunset walk-and-talk · park litter-up crew · quiet bench circles</p>
                </article>
            </div>
        </div>
    `);

    inject("#homebase-pillars", `
        <div class="pillar-nav__head">
            <span class="eyebrow">Homebase</span>
            <h2 class="pillar-nav__title">Four ways to move</h2>
        </div>
        <div class="pillar-nav__grid">
            <a class="pillar-nav__card card card--interactive" href="events.html"><span class="eyebrow">Discovery</span><strong>Events</strong><p class="pillar-nav__hint">Browse and soft RSVP</p></a>
            <a class="pillar-nav__card card card--interactive" href="map.html"><span class="eyebrow">Regional</span><strong>County map</strong><p class="pillar-nav__hint">Wayfinding along the Ouse corridor</p></a>
            <a class="${hostCardClass}" href="host.html"><span class="pillar-nav__card-inner"><span class="eyebrow">Leadership</span><strong>Host</strong><p class="pillar-nav__hint">${hostCardHint}</p></span>${hostCardSleepHint}</a>
            <a class="pillar-nav__card card card--interactive" href="progress.html"><span class="eyebrow">Passport</span><strong>Progress</strong><p class="pillar-nav__hint">Signals and proof</p></a>
        </div>
    `);

    const p = ensureProgressSeed();
    inject("#community-pulse", [
        pulse(events.length, "Events"),
        pulse(venues.length, "Venues"),
        pulse("3", "Counties"),
        pulse(p.presencePoints + p.hostPoints, "Points")
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

    const rsvpState = getRsvpStatusFor(ev.slug);
    const rsvpBadge = rsvpState
        ? `<span class="rsvp-badge rsvp-badge--${rsvpState} rsvp-badge--lg">${rsvpState === "going" ? "You\u2019re going" : "Interested"}</span>`
        : "";

    inject("#event-detail-root", `
        <section class="event-hero-card event-hero-card--premium">
            <div class="event-hero-cover" style="--cover-hue:${ev.coverHue || 28}">
                <span class="event-hero-cover__vibe">${ev.vibe[0]}</span>
            </div>
            <div class="event-hero-card__content stack">
                <span class="eyebrow">${ev.county} / ${ev.town}</span>
                <h1>${ev.title}</h1>
                <p style="color:var(--color-dark-text-muted);font-size:var(--step--1)">${ev.description}</p>
                <div class="tag-list">
                    ${ev.vibe.map((v) => `<span class="tag">${v}</span>`).join("")}
                    <span class="tag">${ev.age}</span>
                </div>
                ${rsvpBadge}
                <div class="attendance-bar"><div class="attendance-bar__fill" style="width:${pct}%"></div></div>
                <span class="eyebrow" style="color:var(--color-dark-text-muted)">${ev.attendees} of ${ev.capacity} spots</span>
            </div>
        </section>

        <section class="detail-overlay-group">
            <button class="detail-overlay-trigger" type="button" data-detail-toggle="detail-host">
                <span class="eyebrow">Host</span>
                <strong>${ev.host}</strong>
                <svg class="detail-overlay-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="detail-overlay-panel" id="detail-host" hidden>
                <p style="font-size:var(--step--1);color:var(--color-ink-muted)">${ev.credibility}</p>
            </div>

            <button class="detail-overlay-trigger" type="button" data-detail-toggle="detail-schedule">
                <span class="eyebrow">Schedule</span>
                <strong>${ev.schedule.length} blocks</strong>
                <svg class="detail-overlay-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="detail-overlay-panel" id="detail-schedule" hidden>
                <ul class="portfolio-list" role="list">
                    ${ev.schedule.map((s) => `<li>${s}</li>`).join("")}
                </ul>
            </div>

            <button class="detail-overlay-trigger" type="button" data-detail-toggle="detail-venue">
                <span class="eyebrow">Venue</span>
                <strong>${venue.name}</strong>
                <svg class="detail-overlay-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="detail-overlay-panel" id="detail-venue" hidden>
                <p style="color:var(--color-ink-muted);font-size:var(--step--1)">${venue.story}</p>
                <dl class="detail-list" style="margin-top:var(--space-sm)">
                    <div><dt>Date</dt><dd>${ev.dateLabel}</dd></div>
                    <div><dt>Time</dt><dd>${ev.timeLabel}</dd></div>
                    <div><dt>Capacity</dt><dd>${ev.capacity} spots</dd></div>
                    <div><dt>Age fit</dt><dd>${ev.age}</dd></div>
                </dl>
            </div>

            <button class="detail-overlay-trigger" type="button" data-detail-toggle="detail-format">
                <span class="eyebrow">Format</span>
                <strong>Why this works</strong>
                <svg class="detail-overlay-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="detail-overlay-panel" id="detail-format" hidden>
                <p style="color:var(--color-ink-muted);font-size:var(--step--1)">${ev.detailSummary}</p>
            </div>
        </section>

        <section class="screen__section social-proof-strip">
            ${ev.socialProof.map((s) => `<article class="metric-card"><span class="eyebrow">Social signal</span><strong>${s}</strong></article>`).join("")}
        </section>
        <section class="screen__section">
            <div class="faq-list">
                ${ev.faq.map((f) => `<details><summary>${f.q}</summary><p>${f.a}</p></details>`).join("")}
            </div>
        </section>
    `);

    document.querySelectorAll("[data-detail-toggle]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const panelId = btn.dataset.detailToggle;
            const panel = document.getElementById(panelId);
            if (!panel) return;
            const isOpen = !panel.hidden;
            panel.hidden = isOpen;
            btn.setAttribute("aria-expanded", String(!isOpen));
        });
    });

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
        const access = getAccess();
        const payload = {
            kind: "soft_rsvp",
            eventSlug: ev.slug,
            eventTitle: ev.title,
            guests: Number(document.querySelector("[data-guest-count][data-active='true']")?.dataset.guestCount || 1),
            intent: document.querySelector("[data-intent][data-active='true']")?.dataset.intent || "rsvp",
            arrivalNote: document.querySelector("#arrival-note")?.value || "",
            accountMethod: document.querySelector("[data-account-method][data-active='true']")?.dataset.accountMethod || null,
            createdAt: new Date().toISOString()
        };
        writeState(storageKeys.rsvp, payload);
        appendSoftRsvp({ ...payload, id: `sr_${Date.now()}` });

        const cur = ensureProgressSeed();
        writeState(storageKeys.progress, {
            ...cur,
            presencePoints: cur.presencePoints + 2,
            latestProof: [`Soft RSVP: ${ev.title}`, ...cur.latestProof].slice(0, 4)
        });

        const meet = meetInPersonCopy();
        const fb = document.querySelector("#rsvp-feedback");
        const mm = document.getElementById("rsvp-matchmaking");

        if (fb) {
            fb.className = "screen__pad rsvp-confirmation stack";
            const gateBlock = !access.isVerified && !access.leadershipPathway
                ? `<div class="card gate-card gate-card--meet" role="status"><strong>${meet.title}</strong><p style="margin-top:var(--space-sm);font-size:var(--step--1);color:var(--color-ink-muted)">${meet.body}</p><p style="margin-top:var(--space-sm);font-size:var(--step--1)">There is <strong>no digital finalize</strong> yet — bring this signal to the Café and a mentor will hear you in.</p></div>`
                : `<p style="font-size:var(--step--1);color:var(--color-ink-muted)">You are verified — you can still keep RSVPs soft, or move into Host when you are ready.</p>`;
            fb.innerHTML = `
                <strong>Soft RSVP saved on this device.</strong>
                ${gateBlock}
                <p style="font-size:var(--step--1)"><a href="onboarding.html" style="color:inherit;text-decoration:underline">Shape your entry in onboarding \u2192</a> · <a href="events.html" style="color:inherit;text-decoration:underline">Back to events</a></p>
            `;
        }

        if (mm) {
            mm.hidden = false;
            mm.innerHTML = buildMatchmakingHtml(ev);
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
        mergeUserProfile({ leadershipPathway: picks.includes("Leadership pathway") });

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
        sheet.dataset.open = "false";
        sheetContent.innerHTML = "";
        requestAnimationFrame(() => {
            sheetContent.innerHTML = `
            <div class="stack venue-sheet__body">
                <span class="eyebrow">Next step</span>
                <p class="venue-wayfinding-hint">You are oriented in <strong>${venue.county}</strong>. Read the story, then jump to the linked circle if it feels like the right current.</p>
                <span class="eyebrow">${venue.county} / ${venue.town}</span>
                <h2>${venue.name}</h2>
                <p style="color:var(--color-ink-muted);font-size:var(--step--1)">${venue.story}</p>
                <div class="tag-list">${venue.amenities.map((a) => `<span class="tag">${a}</span>`).join("")}</div>
                <dl class="detail-list">
                    <div><dt>Type</dt><dd>${venue.kind === "hq" ? "Homebase HQ" : venue.kind === "flagship" ? "Flagship" : "Community"}</dd></div>
                    <div><dt>Address</dt><dd>${venue.address}</dd></div>
                </dl>
                <a class="button" href="event-detail.html?event=${venue.nextEventSlug}">Follow to linked event</a>
            </div>
        `;
            sheet.dataset.open = "true";
        });
    };

    sheet?.querySelector(".venue-sheet__handle")?.addEventListener("click", () => {
        sheet.dataset.open = "false";
    });

    initLeafletMap(showVenue);
}

function renderHostPage() {
    const access = getAccess();
    const banner = document.getElementById("host-access-banner");
    const cta = document.getElementById("host-booking-cta");
    const pending = pendingHostReviewCopy();

    if (!access.canHost) {
        if (banner) {
            banner.hidden = false;
            banner.innerHTML = `
                <div class="card gate-card gate-card--host" role="region" aria-label="Host gate">
                    <span class="eyebrow">Path in progress</span>
                    <h3 class="gate-card__title">${pending.title}</h3>
                    <p class="gate-card__body">${pending.body}</p>
                </div>
            `;
        }
        if (cta) {
            cta.textContent = "Booking wizard locked";
            cta.classList.add("button--disabled");
            cta.setAttribute("aria-disabled", "true");
            cta.href = "#host-access-banner";
            cta.addEventListener("click", (e) => {
                e.preventDefault();
                document.getElementById("host-access-banner")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, { once: true });
        }
    } else {
        if (banner) {
            banner.hidden = true;
            banner.innerHTML = "";
        }
        if (cta) {
            cta.textContent = "Open booking wizard";
            cta.classList.remove("button--disabled");
            cta.removeAttribute("aria-disabled");
            cta.href = "booking.html";
        }
    }

    const draft = readState(storageKeys.bookingDraft, null);
    if (!draft) {
        inject("#host-latest-draft", "");
    } else {
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
}

function renderBookingPage() {
    const access = getAccess();
    const main = document.getElementById("main");
    if (!access.canHost && main) {
        const pending = pendingHostReviewCopy();
        const meet = meetInPersonCopy();
        main.innerHTML = `
            <section class="screen__pad">
                <div class="card gate-card gate-card--host">
                    <span class="eyebrow">Path in progress</span>
                    <h2 class="gate-card__title">${pending.title}</h2>
                    <p class="gate-card__body">${pending.body}</p>
                    <p class="gate-card__body" style="margin-top:var(--space-md)"><strong>${meet.title}</strong> — ${meet.body}</p>
                    <div class="cluster" style="margin-top:var(--space-lg)">
                        <a class="button--bronze button" href="host.html">Back to Host</a>
                        <a class="button--ghost" href="events.html">Browse events</a>
                    </div>
                </div>
            </section>
        `;
        return;
    }

    const profile = readState(storageKeys.profileSeed, null);
    const mentorSupport = document.getElementById("booking-mentor-support");
    if (mentorSupport) {
        mentorSupport.innerHTML = profile?.ageBand === "14-17"
            ? `<div class="card card--accent" role="note"><span class="eyebrow">YMCA Mentor Support</span><p style="margin-top:var(--space-xs);font-size:var(--step--1);color:var(--color-ink-muted)">Because this booking is being shaped from the 14-17 onboarding band, review carries a YMCA mentor-support note by default. If any attendee is under 16, a named YMCA mentor must sit inside the room plan before publication.</p></div>`
            : `<p class="eyebrow" style="color:var(--color-ink-muted)">Age fit, staffing, and room stewardship are checked before anything is published.</p>`;
    }

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
    const access = getAccess();
    const user = ensureUserProfile();
    const rsvp = readState(storageKeys.rsvp, null);
    const profile = readState(storageKeys.profileSeed, null);

    inject("#progress-gate-status", `
        <div class="card verification-strip${user.isVerified ? " verification-strip--verified" : ""}">
            <span class="eyebrow">Verification status</span>
            <p><strong>${user.isVerified ? "Verified — member lane" : "Awaiting — path in progress"}</strong>${user.leadershipPathway ? " · Leadership pathway" : ""}</p>
            <p style="font-size:var(--step--1);color:var(--color-ink-muted);margin-top:var(--space-xs)">Woodland Café mentors flip this after a handshake. Demo: mentor codes <code style="font-family:var(--font-mono);font-size:0.85em">OULM-WOODLAND</code> below, or URL <code style="font-family:var(--font-mono);font-size:0.85em">?oulm_verify=1</code> once.</p>
        </div>
    `);

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
        <article class="metric-card">${radialSVG(Math.min(p.hostPoints, 50), 50)}<span class="eyebrow">Host points</span></article>
        <article class="metric-card">${radialSVG(p.verifiedHours, 40)}<span class="eyebrow">Verified hours</span></article>
    `);

    inject("#progress-signals", progressSignals.map((s) => {
        const active = isSignalActive(s.id, p);
        return `<article class="signal-card${active ? " signal-card--active" : ""}" data-signal="${s.id}"><span class="eyebrow"><span class="signal-card__icon"></span>${s.label}</span><p style="font-size:var(--step--1);color:var(--color-ink-muted)">${s.summary}</p></article>`;
    }).join(""));

    inject("#progress-history", (p.latestProof || []).map((i) => `<li>${i}</li>`).join("") || "<li>No activity yet.</li>");

    if (rsvp) {
        inject("#progress-rsvp", `<div class="card"><span class="eyebrow">Latest soft RSVP</span><h4>${rsvp.eventTitle}</h4><div class="tag-list"><span class="tag">${rsvp.intent}</span><span class="tag">${rsvp.guests} guest${Number(rsvp.guests) > 1 ? "s" : ""}</span></div></div>`);
    } else {
        inject("#progress-rsvp", "");
    }

    inject("#partner-pathways-cta", access.canPartnerPathways
        ? `<a class="button-link" href="partners.html">Partner pathways</a>`
        : `<div class="card gate-card gate-card--inline"><p style="font-size:var(--step--1)"><strong>Partner Pathways</strong> unlock after a Woodland Café handshake or a Leadership pathway pick in onboarding.</p><a class="button" href="onboarding.html">Review onboarding</a></div>`);

    const handshakeSection = document.getElementById("handshake");
    if (handshakeSection) handshakeSection.hidden = Boolean(user.isVerified);

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

function renderPartnersPage() {
    const access = getAccess();
    if (!access.canPartnerPathways) {
        inject("#partner-list", `
            <div class="card gate-card">
                <span class="eyebrow">Path in progress</span>
                <h3>Partner Pathways</h3>
                <p style="color:var(--color-ink-muted);font-size:var(--step--1)">Career and education proof links stay behind the same mentorship gate as Host — so ${YMCA_MARK} listens to your arc, not just clicks.</p>
                <div class="cluster" style="margin-top:var(--space-md)">
                    <a class="button" href="progress.html">See verification status</a>
                    <a class="button--ghost" href="onboarding.html">Onboarding</a>
                </div>
            </div>
        `);
        return;
    }
    inject("#partner-list", partners.map(partnerCardTemplate).join(""));
}

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
    const rsvpState = getRsvpStatusFor(ev.slug);
    return `
        <a class="card card--interactive card--premium" href="event-detail.html?event=${ev.slug}">
            <div class="card__cover" style="--cover-hue:${ev.coverHue || 28}">
                <span class="card__cover-vibe">${ev.vibe[0]}</span>
                ${rsvpState ? `<span class="rsvp-badge rsvp-badge--${rsvpState}">${rsvpState === "going" ? "You\u2019re going" : "Interested"}</span>` : ""}
            </div>
            <div class="card__body-stack">
                <span class="eyebrow">${ev.county}</span>
                <h4 class="card__title">${ev.title}</h4>
                <div class="tag-list"><span class="tag">${ev.dateLabel}</span><span class="tag">${ev.age}</span></div>
                <div class="attendance-bar"><div class="attendance-bar__fill" style="width:${pct}%"></div></div>
            </div>
        </a>
    `;
}

function eventListCard(ev) {
    const pct = Math.round((ev.attendees / ev.capacity) * 100);
    const rsvpState = getRsvpStatusFor(ev.slug);
    return `
        <a class="card card--interactive event-card" href="event-detail.html?event=${ev.slug}" data-county="${ev.county}" data-age="${ev.age}" data-kind="${ev.vibe.join(" ")}" data-vibe="${ev.vibe.join(" ")}">
            <div class="event-card__cover" style="--cover-hue:${ev.coverHue || 28}">
                <span class="card__cover-vibe">${ev.vibe[0]}</span>
            </div>
            <div class="event-card__body">
                <span class="eyebrow">${ev.county} / ${ev.town}</span>
                <h4 class="event-card__title">${ev.title}</h4>
                <div class="event-card__meta">
                    <span class="tag">${ev.dateLabel}</span>
                    <span class="tag">${ev.timeLabel}</span>
                    <span class="tag">${ev.age}</span>
                </div>
                ${rsvpState ? `<span class="rsvp-badge rsvp-badge--${rsvpState}">${rsvpState === "going" ? "You\u2019re going" : "Interested"}</span>` : ""}
                <div class="attendance-bar"><div class="attendance-bar__fill" style="width:${pct}%"></div></div>
                <span class="event-card__spots">${ev.attendees} of ${ev.capacity}</span>
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

function getMatchmakingPicks(currentEvent, limit = 3) {
    const profile = readState(storageKeys.profileSeed, {});
    const picks = Array.isArray(profile.picks) ? profile.picks : [];
    const pref = profile.preferredEntry || "";
    const scoreFor = (e) => {
        let score = 0;
        if (e.county === currentEvent.county) score += 4;
        picks.forEach((pick) => {
            const p = String(pick).toLowerCase();
            e.vibe.forEach((v) => {
                const vl = v.toLowerCase();
                if (p.includes(vl.slice(0, 4)) || vl.includes(p.slice(0, 4))) score += 2;
            });
        });
        if (pref === "Food-first" && e.vibe.some((v) => v.includes("Food"))) score += 3;
        if (picks.includes("Comp sci") && e.vibe.some((v) => v.includes("Build"))) score += 2;
        score += e.attendees / 100;
        return score;
    };
    return events
        .filter((e) => e.slug !== currentEvent.slug)
        .map((e) => ({ e, score: scoreFor(e) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((x) => x.e);
}

function buildMatchmakingHtml(ev) {
    const recs = getMatchmakingPicks(ev, 3);
    return `
        <div class="matchmaking-panel__inner">
            <span class="eyebrow">Social confidence</span>
            <h3 class="matchmaking-panel__title">Users like you also joined\u2026</h3>
            <p class="matchmaking-panel__lede">Simulated matchmaking from your county, vibes, and onboarding picks — a gentle nudge, not surveillance.</p>
            <div class="matchmaking-grid">
                ${recs.map((e) => `
                    <a class="card card--interactive card--premium matchmaking-card" href="event-detail.html?event=${e.slug}">
                        <div class="card__cover" style="--cover-hue:${e.coverHue || 28}">
                            <span class="card__cover-vibe">${e.vibe[0]}</span>
                        </div>
                        <div class="card__body-stack">
                            <span class="eyebrow">${e.county}</span>
                            <h4 class="card__title">${e.title}</h4>
                            <div class="tag-list"><span class="tag">${e.dateLabel}</span><span class="tag">${e.attendees} in the room</span></div>
                        </div>
                    </a>
                `).join("")}
            </div>
        </div>
    `;
}

function isSignalActive(signalId, p) {
    const ext = readState(storageKeys.externalSignals, null);
    if (signalId === "presence") return p.presencePoints >= 12;
    if (signalId === "host") return p.hostPoints >= 6;
    if (signalId === "verified-hours") return p.verifiedHours >= 4;
    if (signalId === "project-proof") return Boolean(ext?.github || ext?.linkedin || ext?.project);
    return false;
}

function getRsvpStatusFor(slug) {
    const rsvp = readState(storageKeys.rsvp, null);
    if (!rsvp || rsvp.eventSlug !== slug) return null;
    return rsvp.intent === "rsvp" ? "going" : "interested";
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
