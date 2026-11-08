# @bklitui/mobile

Expo preview app for `@bklitui/native` (Skia + Reanimated charts).

Needs **Node 22.13+** (Expo SDK 58). On the dev box: `mise exec node@24 -- pnpm dev:mobile`.

```sh
pnpm dev:mobile        # Metro on :8081
```

Open in Expo Go (iOS Simulator or a phone). From a Mac against a remote box, forward Metro first:

```sh
ssh -N -L 8081:localhost:8081 <box>
xcrun simctl openurl booted exp://localhost:8081
```

Not part of `pnpm dev` (no `dev` script) so web contributors don't start Metro.

## Public demo builds

Expo Go only loads EAS Update projects owned by the signed-in account (since
May 2026), so the public demo ships as standalone builds. Run these from
`apps/mobile` (needs `npx eas-cli login` as an owner of `@uixmat/bklit-charts`):

```sh
# Android APK with a public install page (internal distribution)
npx eas-cli@latest build -p android --profile preview

# iOS: build and upload to TestFlight
npx testflight
```

After a new Android build, update `DEMO_ANDROID_URL` in
`apps/web/lib/expo-preview.ts`. Put the TestFlight public link in
`DEMO_IOS_URL`.

The `preview` profile builds `arm64-v8a` only, with Gradle limited to two
workers, so it fits on the Free plan's build machine. The full four-ABI
build ran out of memory.

JavaScript-only changes don't need a rebuild. Both builds read the `preview`
update channel:

```sh
pnpm --filter @bklitui/mobile update:preview --message "What changed"
```

Rebuild after adding a native dependency or upgrading the Expo SDK.
