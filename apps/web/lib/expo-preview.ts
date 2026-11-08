/**
 * Install links for the React Native demo app (`apps/mobile`).
 *
 * Expo Go only loads EAS Update projects owned by the signed-in account
 * (since May 2026), so the demo ships as standalone builds instead:
 *
 * - Android: an internal-distribution APK from `eas build -p android
 *   --profile preview` (run in `apps/mobile`). The build page is public and
 *   has an Install button. Point this at the newest build after a rebuild.
 * - iOS: a TestFlight public link once the App Store build is approved.
 *
 * Both builds listen on the `preview` update channel, so JavaScript-only
 * changes ship with `pnpm --filter @bklitui/mobile update:preview` and don't
 * need a new link.
 */
export const DEMO_ANDROID_URL: string | null =
  "https://expo.dev/accounts/uixmat/projects/bklit-charts/builds/08a55ace-c04d-4501-80c1-8cb4d934fc7c";

export const DEMO_IOS_URL: string | null = null;
