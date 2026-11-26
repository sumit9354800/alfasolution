import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getInvoiceByToken } from "@/server/finance/invoices";
import { getSetting } from "@/server/settings";
import { InvoiceView } from "@/components/shared/InvoiceView";

export const metadata: Metadata = { title: "Invoice | Alfa Solution", robots: { index: false, follow: false } };

type Props = { params: Promise<{ token: string }> };

/** Client-facing invoice, reachable only through its unguessable link. */
export default async function PublicInvoicePage({ params }: Props) {
  const { token } = await params;
  const data = await getInvoiceByToken(token);
  if (!data) notFound();
  const billing = await getSetting("billing");
  return (
    <section className="bg-paper">
      <div className="container-site max-w-4xl py-12 sm:py-16">
        <div className="mb-6 flex justify-end">
          <a href={`/api/invoices/${token}/pdf`} className="btn btn-dark">Download PDF</a>
        </div>
        <InvoiceView invoice={data.invoice} items={data.items} billing={billing} />
      </div>
    </section>
  );
}
