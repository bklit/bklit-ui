import Link from "next/link";
import { DiscordIcon } from "../icons/discord";
import { XIcon } from "../icons/x";

export function SocialLinks() {
  return (
    <div className="not-prose grid grid-cols-2 gap-4">
      <Link
        className="flex w-full flex-col items-center rounded-xl bg-accent/60 p-6 transition-colors hover:bg-accent sm:p-10"
        href="https://x.com/bklitai"
        rel="noreferrer"
        target="_blank"
      >
        <XIcon className="size-10" />
        <p className="mt-2 font-medium">X / Twitter</p>
      </Link>
      <Link
        className="flex w-full flex-col items-center rounded-xl bg-accent/60 p-6 transition-colors hover:bg-accent sm:p-10"
        href="https://discord.com/invite/9yyK8FwPcU"
        rel="noreferrer"
        target="_blank"
      >
        <DiscordIcon className="size-10" />
        <p className="mt-2 font-medium">Discord</p>
      </Link>
    </div>
  );
}
