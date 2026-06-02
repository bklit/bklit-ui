const COOKIE_NAME = "bklit_studio_v2_onboarding_dismissed";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`)
  );
  return match?.[1];
}

export function isStudioOnboardingDismissed(): boolean {
  return readCookie(COOKIE_NAME) === "1";
}

export function dismissStudioOnboarding(): void {
  if (typeof document === "undefined") {
    return;
  }

  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";

  // biome-ignore lint/suspicious/noDocumentCookie: simple dismiss flag; Cookie Store API is unnecessary here
  document.cookie = `${COOKIE_NAME}=1; path=/; max-age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}
