import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-center text-center">
      <p className="text-sm uppercase tracking-widest text-muted-foreground">404</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="mt-3 text-muted-foreground">The link is broken or the page has moved.</p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Back home
      </Link>
    </main>
  );
}
