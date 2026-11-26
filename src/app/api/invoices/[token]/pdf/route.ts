import { getInvoiceByToken } from "@/server/finance/invoices";
import { renderInvoicePdf } from "@/server/finance/invoice-pdf";
import { rateLimit } from "@/server/security/rate-limit";
import { ipFromHeaders } from "@/server/security/request";

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!(await rateLimit(`invoice-pdf:${ipFromHeaders(request.headers)}`, 60, 600))) return new Response("Too many requests", { status: 429 });
  const data = await getInvoiceByToken(token);
  if (!data) return new Response("Not found", { status: 404 });
  const pdf = await renderInvoicePdf(data.invoice, data.items);
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${data.invoice.invoice_number.replace(/[^\w-]+/g, "-")}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
