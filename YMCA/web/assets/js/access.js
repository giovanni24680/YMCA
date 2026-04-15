import { ensureUserProfile } from "./storage.js";

const OULM_INLINE = '<img src="assets/OULM.svg" alt="OULM" class="brand-inline" decoding="async">';

export function getAccess() {
    const profile = ensureUserProfile();
    const canHost = Boolean(profile.isVerified || profile.leadershipPathway);
    return {
        isVerified: Boolean(profile.isVerified),
        leadershipPathway: Boolean(profile.leadershipPathway),
        canHost,
        canPartnerPathways: canHost
    };
}

export function meetInPersonCopy() {
    return {
        title: "Your next physical step: Woodland Café",
        body: `Digital RSVP is only a signal. Bring it to the Woodland Café — the third space that is the physical firmware of ${OULM_INLINE} — for a mentor handshake. That is where Host and Partner Pathways unlock.`
    };
}

export function pendingHostReviewCopy() {
    return {
        title: "Social calibration required",
        body: "We see you. To unlock Host and full permissions, drop into the Woodland Café for a handshake. We value people, not just profiles. Hosting stays high-stakes until a mentor knows you in the room."
    };
}

export function pathInProgressBannerCopy() {
    return {
        title: "Path in progress",
        body: "We see you. To unlock Host status and full permissions, come to the Woodland Café at Leavesden with this screen — we value people, not just profiles."
    };
}
