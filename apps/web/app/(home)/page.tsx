import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-fd-background px-4 text-center">
      <div className="max-w-2xl">
        <div className="mb-8">
          <span className="inline-block rounded-full bg-fd-primary/10 px-4 py-1.5 font-medium text-fd-primary text-sm">
            alpha
          </span>
        </div>

        <h1 className="mb-6 font-bold text-5xl text-fd-foreground tracking-tight sm:text-6xl">
          bklit-ui
        </h1>

        <p className="mb-10 text-fd-muted-foreground text-lg sm:text-xl">
          Bklit UI charts and components for your next project.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            className="inline-flex h-12 items-center justify-center rounded-lg bg-fd-primary px-8 font-medium text-base text-fd-primary-foreground transition-colors hover:bg-fd-primary/90"
            href="/docs"
          >
            Get Started
          </Link>
        </div>
      </div>
    </main>
  );
}
