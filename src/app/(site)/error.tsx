"use client";

import Link from "next/link";

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="bg-white">
      <div className="container-site py-24 sm:py-32">
        <h1 className="display-lg max-w-2xl">Something went wrong loading this page.</h1>
        <p className="lede mt-5">It’s on our side, not yours. Try again, or come back in a minute.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="btn btn-dark">Try again</button>
          <Link href="/" className="btn btn-outline">Go to the homepage</Link>
        </div>
      </div>
    </section>
  );
}
