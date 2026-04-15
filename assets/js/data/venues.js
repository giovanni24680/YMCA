export const venues = [
    {
        id: "homebase-st-albans",
        name: "Woodland Café (OULM HQ)",
        county: "Hertfordshire",
        town: "St Albans",
        kind: "hq",
        lat: 51.7528,
        lng: -0.3394,
        address: "Woodland Café quarter, St Albans",
        amenities: ["Third-space tables", "Mentor desk", "Quiet booth", "Handshake corner"],
        story: "The Woodland Café is not wallpaper — it is the physical firmware where digital curiosity becomes a face, a name, and a mentor who remembers you.",
        nextEventSlug: "show-up-supper-club"
    },
    {
        id: "leavesden-country-park",
        name: "Leavesden Country Park",
        county: "Hertfordshire",
        town: "Leavesden",
        kind: "hq",
        lat: 51.692,
        lng: -0.418,
        address: "Country park gateway, Leavesden",
        amenities: ["Outdoor circles", "Walking loops", "Field-day clearings"],
        story: "Open-air HQ for the OULM current: lungs, light, and low-stakes proximity before anyone asks you to host anything.",
        nextEventSlug: "show-up-supper-club"
    },
    {
        id: "bedford-makers-room",
        name: "Bedford Makers Room",
        county: "Bedfordshire",
        town: "Bedford",
        kind: "partner",
        lat: 52.1364,
        lng: -0.4663,
        address: "Riverside quarter, Bedford",
        amenities: ["Workshop tables", "Projection wall", "Tool lockers"],
        story: "A community-leased room suited to build nights, prototype socials, and practical skills sessions.",
        nextEventSlug: "makers-late-lab"
    },
    {
        id: "high-wycombe-forum",
        name: "High Wycombe Forum",
        county: "Buckinghamshire",
        town: "High Wycombe",
        kind: "flagship",
        lat: 51.6291,
        lng: -0.7482,
        address: "Town centre forum, High Wycombe",
        amenities: ["Stage", "Community kitchen", "Flexible seating"],
        story: "A bigger flagship venue for social nights, showcases, and cohort gatherings.",
        nextEventSlug: "community-cinema-club"
    },
    {
        id: "luton-story-kitchen",
        name: "Luton Story Kitchen",
        county: "Bedfordshire",
        town: "Luton",
        kind: "community",
        lat: 51.8787,
        lng: -0.4200,
        address: "Marsh Road quarter, Luton",
        amenities: ["Cook-up station", "Conversation booths", "Photo wall"],
        story: "A soft-entry social venue built around food, conversation, and low-pressure creative hangs.",
        nextEventSlug: "first-friday-food-run"
    },
    {
        id: "aylesbury-studio-yard",
        name: "Aylesbury Studio Yard",
        county: "Buckinghamshire",
        town: "Aylesbury",
        kind: "community",
        lat: 51.8168,
        lng: -0.8146,
        address: "Station-side yard, Aylesbury",
        amenities: ["Outdoor tables", "Small stage", "Bike stands"],
        story: "A casual open-air venue for film clubs, pop-ups, and weekend circles.",
        nextEventSlug: "anime-after-hours"
    }
];

export function getVenueById(id) {
    return venues.find((venue) => venue.id === id);
}

export function getVenueByEventSlug(eventSlug) {
    return venues.find((venue) => venue.nextEventSlug === eventSlug);
}
