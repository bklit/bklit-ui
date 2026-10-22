import { permanentRedirect } from "next/navigation";

/** @deprecated Use /studio — see apps/web/app/playground/README.md */
export default function DeprecatedPlaygroundPage() {
  // 308 so search engines transfer any /playground signals to /studio.
  permanentRedirect("/studio");
}
