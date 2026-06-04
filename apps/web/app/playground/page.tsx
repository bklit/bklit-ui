import { redirect } from "next/navigation";

/** @deprecated Use /studio — see apps/web/app/playground/README.md */
export default function DeprecatedPlaygroundPage() {
  redirect("/studio");
}
