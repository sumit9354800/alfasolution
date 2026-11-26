import Image from "next/image";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentAdmin } from "@/server/auth/session";
import { ensureBootstrapAdmin } from "@/server/auth/bootstrap";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  await ensureBootstrapAdmin();
  const [user, { next }] = await Promise.all([getCurrentAdmin(), searchParams]);
  if (user) redirect("/admin");
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-ink p-12 text-white lg:flex">
        <div className="relative h-12 w-40">
          <Image src="/images/logo-white.png" alt="Alfa Solution" fill sizes="160px" className="object-contain object-left" priority />
        </div>
        <div>
          <p className="font-display text-4xl font-semibold leading-tight tracking-tight">Studio console</p>
          <p className="mt-3 max-w-sm text-white/60">Content, clients, projects, payments and hiring — in one place.</p>
        </div>
        <p className="text-sm text-white/40">Access is restricted to Alfa Solution staff. Activity is logged.</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="relative mb-8 h-12 w-40 lg:hidden">
            <Image src="/images/logo-black.png" alt="Alfa Solution" fill sizes="160px" className="object-contain object-left" />
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-2 text-sm text-slate">Use your Alfa Solution admin account.</p>
          <LoginForm next={next ?? ""} />
        </div>
      </div>
    </main>
  );
}
