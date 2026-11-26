import Link from "next/link";

export default function RootNotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper p-6">
      <div className="max-w-md text-center">
        <h1 className="display-md">Page not found</h1>
        <p className="mt-3 text-slate">The page you’re looking for doesn’t exist.</p>
        <Link href="/" className="btn btn-dark mt-6">Go to the homepage</Link>
      </div>
    </main>
  );
}
