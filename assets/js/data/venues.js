export const venues = [
    {
        id: "homebase-st-albans",
        name: "Oulm Homebase",
        county: "Hertfordshire",
        town: "St Albans",
        kind: "hq",
        lat: 51.7528,
        lng: -0.3394,
        address: "Civic quarter, St Albans",
        amenities: ["Cafe lounge", "After-school tables", "Quiet booth", "Open mic corner"],
        story: "The third-place anchor for Oulm. A warm cafe-first space where showing up feels less formal than arriving at an office.",
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
