import { venues } from "../data/venues.js";

export function initLeafletMap(onVenueSelect) {
    const mapElement = document.getElementById("leaflet-map");
    if (!mapElement) return null;

    if (typeof window.L === "undefined") {
        showFallback(mapElement, onVenueSelect);
        return null;
    }

    const map = window.L.map(mapElement, {
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true
    }).setView([51.85, -0.58], 8.4);

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    const markers = [];

    venues.forEach((venue) => {
        const marker = window.L.circleMarker([venue.lat, venue.lng], {
            radius: venue.kind === "hq" ? 10 : 8,
            fillColor: venue.kind === "hq" ? "#b86b2d" : venue.kind === "flagship" ? "#7a8c73" : "#6e88aa",
            color: "#fffaf4",
            weight: 2,
            fillOpacity: 0.95
        }).addTo(map);

        marker._venueKind = venue.kind;
        markers.push(marker);

        marker.on("click", () => onVenueSelect?.(venue));
        marker.bindPopup(`<strong>${venue.name}</strong><br>${venue.town}, ${venue.county}`);
    });

    setTimeout(() => map.invalidateSize(), 200);
    setTimeout(() => map.invalidateSize(), 600);

    wireFilters(map, markers);

    return map;
}

function wireFilters(map, markers) {
    const pills = document.querySelectorAll(".map-filters .filter-pill");
    const kindMap = { "all": null, "hq": "hq", "flagship": "flagship", "community": ["community", "partner"] };

    pills.forEach((pill) => {
        pill.addEventListener("click", () => {
            pills.forEach((p) => {
                p.dataset.active = "false";
                p.setAttribute("aria-pressed", "false");
            });
            pill.dataset.active = "true";
            pill.setAttribute("aria-pressed", "true");

            const label = pill.textContent.trim().toLowerCase();
            const allowed = kindMap[label];

            markers.forEach((m) => {
                if (!allowed) {
                    map.addLayer(m);
                } else if (Array.isArray(allowed)) {
                    allowed.includes(m._venueKind) ? map.addLayer(m) : map.removeLayer(m);
                } else {
                    m._venueKind === allowed ? map.addLayer(m) : map.removeLayer(m);
                }
            });
        });
    });
}

function showFallback(container, onVenueSelect) {
    const parent = container.closest(".map-body") || container.parentElement;
    parent.innerHTML = `
        <div class="map-fallback">
            <div class="map-fallback__inner">
                <svg class="map-fallback__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <p style="font-size:var(--step--1)">Map tiles are loading or unavailable offline.</p>
                <p style="font-size:var(--step--2);color:var(--color-ink-faint)">Tap a venue below to view its details.</p>
                <div class="stack--tight" style="text-align:left;margin-top:var(--space-sm)">
                    ${venues.map((v) => `<button class="card card--interactive" style="cursor:pointer;text-align:left" data-venue-id="${v.id}"><span class="eyebrow">${v.county}</span><strong>${v.name}</strong></button>`).join("")}
                </div>
            </div>
        </div>
    `;

    parent.querySelectorAll("[data-venue-id]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const venue = venues.find((v) => v.id === btn.dataset.venueId);
            if (venue) onVenueSelect?.(venue);
        });
    });
}
