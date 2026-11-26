import Link from "next/link";

export default function NotFound() {
  return (
    <section className="bg-white">
      <div className="container-site py-24 sm:py-32">
        <p className="text-sm text-slate">Error 404</p>
        <h1 className="display-lg mt-3 max-w-2xl">This page doesn’t exist — or it moved.</h1>
        <p className="lede mt-5">Check the address, or use one of these instead.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-dark">Go to the homepage</Link>
          <Link href="/work" className="btn btn-outline">See our work</Link>
          <Link href="/contact" className="btn btn-outline">Contact us</Link>
        </div>
      </div>
    </section>
  );
}
