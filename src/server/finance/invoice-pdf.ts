import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import { formatDate, formatMoneyPlain, round2 } from "@/lib/format";
import { getSetting } from "../settings";
import { INVOICE_STATUSES, type Invoice, type InvoiceItem } from "./invoices";

const INK = rgb(0.098, 0.114, 0.153);
const MUTED = rgb(0.38, 0.41, 0.46);
const LINE = rgb(0.89, 0.9, 0.92);
const ACCENT = rgb(0.604, 0.357, 0.157);

/** Standard PDF fonts only cover WinAnsi; replace anything else so rendering never fails. */
function safe(text: string | null | undefined) {
  return (text ?? "")
    .replace(/[₹]/g, "INR ")
    .replace(/[–—]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^\x20-\x7E\n -ÿ]/g, "");
}

function wrap(text: string, font: PDFFont, size: number, width: number) {
  const lines: string[] = [];
  for (const paragraph of safe(text).split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/)) {
      const attempt = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(attempt, size) > width && line) {
        lines.push(line);
        line = word;
      } else line = attempt;
    }
    lines.push(line);
  }
  return lines;
}

export async function renderInvoicePdf(
  invoice: Invoice,
  items: InvoiceItem[],
): Promise<Uint8Array> {
  const billing = await getSetting("billing");
  const doc = await PDFDocument.create();
  doc.setTitle(`Invoice ${invoice.invoice_number}`);
  doc.setAuthor(billing.legalName);
  doc.setCreator("Alfa Solution");

  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  let page: PDFPage = doc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const margin = 48;
  let y = height - margin;

  const text = (
    value: string,
    x: number,
    yy: number,
    opts: {
      size?: number;
      font?: PDFFont;
      color?: ReturnType<typeof rgb>;
    } = {},
  ) =>
    page.drawText(safe(value), {
      x,
      y: yy,
      size: opts.size ?? 9.5,
      font: opts.font ?? regular,
      color: opts.color ?? INK,
    });
  const right = (
    value: string,
    xRight: number,
    yy: number,
    opts: {
      size?: number;
      font?: PDFFont;
      color?: ReturnType<typeof rgb>;
    } = {},
  ) => {
    const font = opts.font ?? regular;
    const size = opts.size ?? 9.5;
    text(value, xRight - font.widthOfTextAtSize(safe(value), size), yy, opts);
  };

  // Header: logo (if present) + company
  try {
    const logo = await doc.embedPng(
      await readFile(
        path.join(process.cwd(), "public", "images", "logo-black.png"),
      ),
    );
    const scale = 34 / logo.height;
    page.drawImage(logo, {
      x: margin,
      y: y - 34,
      width: logo.width * scale,
      height: 34,
    });
  } catch {
    text(billing.legalName, margin, y - 22, { size: 18, font: bold });
  }
  right("INVOICE", width - margin, y - 12, {
    size: 20,
    font: bold,
    color: ACCENT,
  });
  right(invoice.invoice_number, width - margin, y - 30, {
    size: 10,
    font: bold,
  });
  y -= 62;

  // From / meta
  const fromLines = [
    billing.legalName,
    ...wrap(billing.address, regular, 9, 220),
    billing.email,
    billing.phone,
    billing.gstin ? `GSTIN: ${billing.gstin}` : "",
  ].filter(Boolean);
  let fy = y;
  text("From", margin, fy, { size: 8, color: MUTED });
  fy -= 14;
  for (const [i, line] of fromLines.entries()) {
    text(line, margin, fy, { size: 9, font: i === 0 ? bold : regular });
    fy -= 12.5;
  }

  const meta: [string, string][] = [
    ["Issue date", formatDate(invoice.issue_date, "long")],
    ...(invoice.due_date
      ? [["Due date", formatDate(invoice.due_date, "long")] as [string, string]]
      : []),
    ["Status", INVOICE_STATUSES[invoice.status]],
  ];
  if (billing.sacCode) meta.push(["SAC", billing.sacCode]);
  let my = y;
  for (const [label, value] of meta) {
    text(label, width - margin - 200, my, { size: 9, color: MUTED });
    right(value, width - margin, my, { size: 9, font: bold });
    my -= 14;
  }
  y = Math.min(fy, my) - 18;

  // Bill to
  text("Bill to", margin, y, { size: 8, color: MUTED });
  y -= 14;
  const toLines = [
    invoice.billing_name,
    invoice.billing_company ?? "",
    ...wrap(invoice.billing_address ?? "", regular, 9, 300),
    invoice.billing_email,
    invoice.billing_phone ?? "",
    invoice.billing_gstin ? `GSTIN: ${invoice.billing_gstin}` : "",
  ].filter(Boolean);
  for (const [i, line] of toLines.entries()) {
    text(line, margin, y, { size: 9, font: i === 0 ? bold : regular });
    y -= 12.5;
  }
  y -= 18;

  // Items table
  const cols = {
    desc: margin,
    qtyRight: width - margin - 240,
    rateRight: width - margin - 125,
    amountRight: width - margin - 8,
  };
  page.drawRectangle({
    x: margin,
    y: y - 6,
    width: width - margin * 2,
    height: 22,
    color: rgb(0.96, 0.965, 0.975),
  });
  text("Description", cols.desc + 8, y + 1, {
    size: 8.5,
    font: bold,
    color: MUTED,
  });
  right("Qty", cols.qtyRight, y + 1, { size: 8.5, font: bold, color: MUTED });
  right("Rate", cols.rateRight, y + 1, { size: 8.5, font: bold, color: MUTED });
  right("Amount", cols.amountRight, y + 1, {
    size: 8.5,
    font: bold,
    color: MUTED,
  });
  y -= 26;

  for (const item of items) {
    const lines = wrap(
      item.description,
      regular,
      9.5,
      cols.qtyRight - cols.desc - 60,
    );
    if (y - lines.length * 13 < 180) {
      page = doc.addPage([595.28, 841.89]);
      y = height - margin;
    }
    lines.forEach((line, i) => text(line, cols.desc + 8, y - i * 13));
    right(String(Number(item.quantity)), cols.qtyRight, y);
    right(
      formatMoneyPlain(item.unit_price, invoice.currency),
      cols.rateRight,
      y,
    );
    right(formatMoneyPlain(item.amount, invoice.currency), cols.amountRight, y);
    y -= lines.length * 13 + 8;
    page.drawLine({
      start: { x: margin, y: y + 2 },
      end: { x: width - margin, y: y + 2 },
      thickness: 0.6,
      color: LINE,
    });
    y -= 10;
  }

  // Totals
  const totals: [string, string, boolean][] = [
    ["Subtotal", formatMoneyPlain(invoice.subtotal, invoice.currency), false],
  ];
  if (Number(invoice.discount) > 0)
    totals.push([
      "Discount",
      `- ${formatMoneyPlain(invoice.discount, invoice.currency)}`,
      false,
    ]);
if (Number(invoice.tax_rate) > 0) {
  const halfRate = Number(invoice.tax_rate) / 2;
  const cgst = round2(Number(invoice.tax_amount) / 2);
  const sgst = round2(Number(invoice.tax_amount) - cgst); // paise ka rounding farak yahan adjust ho jata hai
  totals.push([`CGST (${halfRate}%)`, formatMoneyPlain(cgst, invoice.currency), false]);
  totals.push([`SGST (${halfRate}%)`, formatMoneyPlain(sgst, invoice.currency), false]);
}
  totals.push([
    "Total",
    formatMoneyPlain(invoice.total, invoice.currency),
    true,
  ]);
  totals.push([
    "Paid",
    formatMoneyPlain(invoice.amount_paid, invoice.currency),
    false,
  ]);
  totals.push([
    "Balance",
    formatMoneyPlain(
      Math.max(0, Number(invoice.total) - Number(invoice.amount_paid)),
      invoice.currency,
    ),
    true,
  ]);

  y -= 4;
  for (const [label, value, strong] of totals) {
    text(label, width - margin - 210, y, {
      size: strong ? 10.5 : 9.5,
      font: strong ? bold : regular,
      color: strong ? INK : MUTED,
    });
    right(value, width - margin - 8, y, {
      size: strong ? 10.5 : 9.5,
      font: strong ? bold : regular,
    });
    y -= strong ? 18 : 15;
  }

  // Notes & bank details
  y -= 16;
  for (const [title, body] of [
    ["Bank details", invoice.status === "paid" ? "" : billing.bankDetails],
    ["Notes", invoice.notes ?? ""],
  ] as const) {
    if (!body) continue;
    text(title, margin, y, { size: 8, color: MUTED });
    y -= 13;
    for (const line of wrap(body, regular, 9, width - margin * 2)) {
      text(line, margin, y, { size: 9 });
      y -= 12;
    }
    y -= 10;
  }

  page.drawLine({
    start: { x: margin, y: 60 },
    end: { x: width - margin, y: 60 },
    thickness: 0.6,
    color: LINE,
  });
  text(
    "This is a computer-generated invoice and does not require a signature.",
    margin,
    44,
    { size: 8, color: MUTED },
  );
  right("alfasolution.net", width - margin, 44, { size: 8, color: MUTED });

  return doc.save();
}
