import Link from "next/link";
import { requirePageAccess } from "@/server/auth/guard";
import { SETTINGS_GROUPS } from "@/lib/content-schema";
import { env, isProduction } from "@/server/env";
import { query } from "@/server/db";
import { Badge, Card, PageHeader } from "@/components/admin/ui";

export default async function SettingsPage() {
  await requirePageAccess("settings.manage");
  const groups = SETTINGS_GROUPS.filter((g) => g.permission === "settings.manage");
  const [db] = await query<{ version: string; db: string }>("SELECT VERSION() AS version, DATABASE() AS db");
  const rz = env.razorpay;
  const checks: [string, boolean, string][] = [
    ["Database", true, `${db?.db} · ${db?.version}`],
    ["Email (Resend)", Boolean(env.mail.apiKey && env.mail.from), env.mail.apiKey ? `Sending from ${env.mail.from}; notifications to ${env.mail.to ?? "—"}` : "Set RESEND_API_KEY, CONTACT_FROM_EMAIL and CONTACT_TO_EMAIL"],
    ["Razorpay payments", rz.configured, rz.configured ? `${rz.keyId?.startsWith("rzp_live") ? "Live" : "Test"} mode · key ${rz.keyId}` : "Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET"],
    ["Razorpay webhook", Boolean(rz.webhookSecret), rz.webhookSecret ? `Endpoint: ${env.siteUrl}/api/payments/webhook` : "Set RAZORPAY_WEBHOOK_SECRET and add the webhook in Razorpay"],
    ["File storage", true, env.storageDir],
    ["Environment", true, `${isProduction ? "Production" : "Development"} · ${env.siteUrl}`],
  ];
  return (
    <>
      <PageHeader title="Settings" description="Company details, billing and integrations." />
      <div className="grid gap-4 sm:grid-cols-2">
        {groups.map((g) => (
          <Link key={g.key} href={`/admin/content/${g.key}`} className="block rounded-xl border border-line bg-white p-5 hover:border-line-strong">
            <h2 className="font-sans text-base font-semibold tracking-normal">{g.title}</h2>
            <p className="mt-1 text-sm text-slate">{g.description}</p>
          </Link>
        ))}
      </div>
      <Card title="Integrations" className="mt-6">
        <p className="mb-4 text-sm text-slate">Secrets live in environment variables on the server, never in the database or this screen.</p>
        <ul className="divide-y divide-line">
          {checks.map(([name, ok, detail]) => (
            <li key={name} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-semibold">{name}</span>
              <span className="flex items-center gap-3 text-sm text-slate"><span className="break-all">{detail}</span>{ok ? <Badge tone="success">Ready</Badge> : <Badge tone="warning">Not set</Badge>}</span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
