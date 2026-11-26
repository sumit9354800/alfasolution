"use client";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="rounded-xl border border-line bg-white p-8">
      <h1 className="font-display text-2xl font-semibold">This screen couldn’t load</h1>
      <p className="mt-2 text-sm text-slate">
        Something went wrong on the server. Try again; if it keeps happening, check the server logs{error.digest ? ` for reference ${error.digest}` : ""}.
      </p>
      <button type="button" onClick={reset} className="btn btn-dark btn-sm mt-5">Try again</button>
    </div>
  );
}
