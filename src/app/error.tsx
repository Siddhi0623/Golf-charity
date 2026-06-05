"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen bg-background text-foreground">
        <main className="container flex min-h-screen flex-col items-center justify-center text-center">
          <h1 className="font-display text-3xl font-semibold">Something went wrong</h1>
          <p className="mt-3 text-muted-foreground">{error.message}</p>
          <button
            type="button"
            onClick={reset}
            className="mt-8 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
