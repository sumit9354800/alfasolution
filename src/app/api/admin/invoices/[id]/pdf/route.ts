import { AuthError, requirePermission } from "@/server/auth/guard";
import { getInvoice } from "@/server/finance/invoices";
import { renderInvoicePdf } from "@/server/finance/invoice-pdf";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("finance.manage");
    const { id } = await params;
    const data = await getInvoice(Number(id));
    if (!data) return new Response("Not found", { status: 404 });
    const pdf = await renderInvoicePdf(data.invoice, data.items);
    const inline = new URL(request.url).searchParams.get("inline") === "1";
    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${data.invoice.invoice_number.replace(/[^\w-]+/g, "-")}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof AuthError) return new Response(error.message, { status: 403 });
    console.error("[invoice pdf] failed", error);
    return new Response("Could not generate the PDF", { status: 500 });
  }
}
