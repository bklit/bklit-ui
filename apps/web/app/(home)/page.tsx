import Link from "next/link";
import { HomeComponents } from "@/components/home-components";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center space-y-24 px-4 py-24 text-center">
      <div className="max-w-xl space-y-6">
        <div className="mx-auto flex w-fit items-center justify-center rounded-full border p-px">
          <Badge variant="secondary">Version</Badge>
          <Badge variant="ghost">Pre-release</Badge>
        </div>
        <h1 className="font-bold text-2xl sm:text-4xl">Bklit UI</h1>

        <p className="text-lg sm:text-xl">
          A collection of Open Source charts and utility components that you can
          customize and extend.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" variant="default">
            <Link href="/docs">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/docs/components">Components</Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
          <HomeComponents />
        </div>
      </div>
    </main>
  );
}
