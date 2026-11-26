import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="rounded-xl border border-line bg-white p-8">
      <h1 className="font-display text-2xl font-semibold">Not found</h1>
      <p className="mt-2 text-sm text-slate">This record doesn’t exist or was deleted.</p>
      <Link href="/admin" className="btn btn-dark btn-sm mt-5">Back to the dashboard</Link>
    </div>
  );
}
