const PREFIX = "oulm_";

export const storageKeys = {
    rsvp: `${PREFIX}rsvp`,
    profileSeed: `${PREFIX}profile_seed`,
    bookingDraft: `${PREFIX}booking_draft`,
    progress: `${PREFIX}progress`,
    externalSignals: `${PREFIX}external_signals`,
    userProfile: `${PREFIX}user_profile`,
    softRsvpLog: `${PREFIX}soft_rsvp_log`,
    pushSubscription: `${PREFIX}push_subscription`,
    calibratorComplete: `${PREFIX}calibrator_complete`
};

const defaultUserProfile = () => ({
    isVerified: false,
    leadershipPathway: false
});

export function readState(key, fallback) {
    try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
        console.warn(`Unable to read ${key}`, error);
        return fallback;
    }
}

export function writeState(key, value) {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn(`Unable to write ${key}`, error);
    }
}

export function mergeState(key, partial, fallback = {}) {
    const current = readState(key, fallback);
    const merged = { ...current, ...partial };
    writeState(key, merged);
    return merged;
}

export function appendArrayState(key, item) {
    const current = readState(key, []);
    const next = [...current, item];
    writeState(key, next);
    return next;
}

export function exportAllState() {
    const exportedAt = new Date().toISOString();
    const payload = {
        exportedAt,
        app: "OULM static MVP",
        schemaVersion: 2,
        data: Object.values(storageKeys).reduce((accumulator, key) => {
            accumulator[key] = readState(key, null);
            return accumulator;
        }, {})
    };

    return payload;
}

export function downloadStateFile(filename = "oulm-local-export.json") {
    const payload = exportAllState();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

export function ensureProgressSeed() {
    const current = readState(storageKeys.progress, null);
    if (current) {
        return current;
    }

    const seeded = {
        presencePoints: 14,
        hostPoints: 8,
        verifiedHours: 6,
        eventsAttended: 2,
        communityRole: "Regular",
        latestProof: ["Joined two socials", "Helped set up a screening", "Saved one project link placeholder"]
    };

    writeState(storageKeys.progress, seeded);
    return seeded;
}

/**
 * Profile gate: `isVerified` is flipped by staff in production; here it stays in localStorage for simulation.
 * `leadershipPathway` can be set from onboarding picks.
 */
export function ensureUserProfile() {
    const profileSeed = readState(storageKeys.profileSeed, {});
    const picks = Array.isArray(profileSeed.picks) ? profileSeed.picks : [];
    const leadershipFromPicks = picks.includes("Leadership pathway");

    const stored = readState(storageKeys.userProfile, null);
    const prev = stored && typeof stored === "object" ? stored : {};

    const merged = {
        ...defaultUserProfile(),
        ...prev,
        isVerified: Boolean(prev.isVerified),
        leadershipPathway: Boolean(prev.leadershipPathway) || leadershipFromPicks
    };

    const changed = !stored
        || merged.isVerified !== Boolean(prev.isVerified)
        || merged.leadershipPathway !== Boolean(prev.leadershipPathway);

    if (changed) {
        writeState(storageKeys.userProfile, merged);
    }

    return merged;
}

export function mergeUserProfile(partial) {
    const profileSeed = readState(storageKeys.profileSeed, {});
    const picks = Array.isArray(profileSeed.picks) ? profileSeed.picks : [];
    const leadershipFromPicks = picks.includes("Leadership pathway");

    const current = readState(storageKeys.userProfile, null);
    const base = { ...defaultUserProfile(), ...(current && typeof current === "object" ? current : {}) };
    const next = {
        ...base,
        ...partial,
        leadershipPathway: Boolean(partial.leadershipPathway ?? base.leadershipPathway) || leadershipFromPicks
    };
    writeState(storageKeys.userProfile, next);
    return next;
}

export function readSoftRsvpLog() {
    return readState(storageKeys.softRsvpLog, []);
}

export function appendSoftRsvp(entry) {
    return appendArrayState(storageKeys.softRsvpLog, entry);
}

export function isCalibratorComplete() {
    return readState(storageKeys.calibratorComplete, false) === true;
}

export function setCalibratorComplete() {
    writeState(storageKeys.calibratorComplete, true);
}
