/**
 * Web Push — VAPID **public** key (safe in the client bundle).
 *
 * Your SwiftUI / server co-owner must use the matching **private** key to send
 * pushes (never ship the private key in the app or in git). Generate a fresh
 * pair with: `npx web-push generate-vapid-keys` and replace both keys together.
 *
 * Subscription JSON is also stored in localStorage under `storageKeys.pushSubscription`
 * for handoff to native or backend systems.
 */
export const VAPID_PUBLIC_KEY = "BMFODDOParbKS25H-9kd66O6bfLXQwuYOVjPhNBSbvq-1OkFm6725s_1Lak2_io5zLKGwUMv2fc4IOWmPb_AoBo";
