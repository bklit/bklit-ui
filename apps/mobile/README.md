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

## Public preview (Expo Go)

The docs QR code (`apps/web/lib/expo-preview.ts`) opens the latest update on the
`preview` channel of the Expo project `@uixmat/bklit-charts`. To publish the
current app there (needs `npx eas-cli login` as an owner):

```sh
pnpm --filter @bklitui/mobile update:preview --message "What changed"
```

The link stays the same between publishes. After an Expo SDK upgrade, update
`runtime-version` in that URL (e.g. `exposdk:59.0.0`).
