import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-fd-background px-4 text-center">
      <div className="max-w-2xl">
        <div className="mb-8">
          <span className="inline-block rounded-full bg-fd-primary/10 px-4 py-1.5 text-sm font-medium text-fd-primary">
            alpha
          </span>
        </div>

        <h1 className="mb-6 text-5xl font-bold tracking-tight text-fd-foreground sm:text-6xl">
          bklit-ui
        </h1>

        <p className="mb-10 text-lg text-fd-muted-foreground sm:text-xl">
          Bklit UI charts and components for your next project.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/docs"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-fd-primary px-8 text-base font-medium text-fd-primary-foreground transition-colors hover:bg-fd-primary/90"
          >
            Get Started
          </Link>
        </div>
      </div>
    </main>
  );
}
