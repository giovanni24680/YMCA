import { venues } from "../data/venues.js";

export function initLeafletMap(onVenueSelect) {
    const mapElement = document.getElementById("leaflet-map");
    if (!mapElement || typeof window.L === "undefined") {
        return null;
    }

    const map = window.L.map(mapElement, {
        zoomControl: true,
        scrollWheelZoom: false
    }).setView([51.85, -0.58], 8.4);

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    venues.forEach((venue) => {
        const marker = window.L.circleMarker([venue.lat, venue.lng], {
            radius: venue.kind === "hq" ? 10 : 8,
            fillColor: venue.kind === "hq" ? "#b86b2d" : venue.kind === "flagship" ? "#7a8c73" : "#6e88aa",
            color: "#fffaf4",
            weight: 2,
            fillOpacity: 0.95
        }).addTo(map);

        marker.on("click", () => onVenueSelect?.(venue));
        marker.bindPopup(`<strong>${venue.name}</strong><br>${venue.town}, ${venue.county}`);
    });

    return map;
}
