"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { formatMoney, round2 } from "@/lib/format";

type Line = { description: string; quantity: string; unit_price: string };

/** Invoice line items with a live totals preview. Submits JSON in a hidden `items` input. */
export function LineItemsEditor({ defaultTaxRate, initial = [] }: { defaultTaxRate: number; initial?: Line[] }) {
  const [lines, setLines] = useState<Line[]>(initial.length ? initial : [{ description: "", quantity: "1", unit_price: "" }]);
  const [taxRate, setTaxRate] = useState(String(defaultTaxRate));
  const [discount, setDiscount] = useState("0");

  const update = (index: number, patch: Partial<Line>) => setLines((all) => all.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  const subtotal = round2(lines.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unit_price) || 0), 0));
  const disc = Math.min(Math.max(Number(discount) || 0, 0), subtotal);
  const tax = round2(((subtotal - disc) * (Number(taxRate) || 0)) / 100);
  const total = round2(subtotal - disc + tax);

  return (
    <div>
      <span className="field-label">Line items</span>
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-line bg-[#fbfbfc] text-left text-xs text-slate">
              <th className="px-3 py-2 font-medium">Description</th>
              <th className="w-24 px-3 py-2 font-medium">Qty</th>
              <th className="w-36 px-3 py-2 font-medium">Rate (₹)</th>
              <th className="w-32 px-3 py-2 text-right font-medium">Amount</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="border-b border-line last:border-0">
                <td className="p-2"><input aria-label={`Item ${i + 1} description`} value={line.description} onChange={(e) => update(i, { description: e.target.value })} maxLength={400} className="input !min-h-9 py-1.5" placeholder="e.g. Website design & development" /></td>
                <td className="p-2"><input aria-label={`Item ${i + 1} quantity`} type="number" min={0} step="0.01" value={line.quantity} onChange={(e) => update(i, { quantity: e.target.value })} className="input !min-h-9 py-1.5" /></td>
                <td className="p-2"><input aria-label={`Item ${i + 1} rate`} type="number" min={0} step="0.01" value={line.unit_price} onChange={(e) => update(i, { unit_price: e.target.value })} className="input !min-h-9 py-1.5" /></td>
                <td className="p-2 text-right tabular-nums">{formatMoney((Number(line.quantity) || 0) * (Number(line.unit_price) || 0))}</td>
                <td className="p-2">
                  <button type="button" onClick={() => setLines((all) => (all.length > 1 ? all.filter((_, j) => j !== i) : all))} aria-label={`Remove item ${i + 1}`} className="rounded p-1.5 text-slate hover:bg-paper hover:text-danger">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={() => setLines((all) => [...all, { description: "", quantity: "1", unit_price: "" }])} className="btn btn-outline btn-sm mt-3">
        <Plus size={14} /> Add line
      </button>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="tax_rate" className="field-label">Tax rate (%)</label>
            <input id="tax_rate" name="tax_rate" type="number" min={0} max={50} step="0.01" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="input" />
          </div>
          <div>
            <label htmlFor="discount" className="field-label">Discount (₹)</label>
            <input id="discount" name="discount" type="number" min={0} step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)} className="input" />
          </div>
        </div>
        <dl className="space-y-1.5 rounded-lg bg-paper p-4 text-sm">
          <div className="flex justify-between"><dt className="text-slate">Subtotal</dt><dd className="tabular-nums">{formatMoney(subtotal)}</dd></div>
          {disc ? <div className="flex justify-between"><dt className="text-slate">Discount</dt><dd className="tabular-nums">−{formatMoney(disc)}</dd></div> : null}
          <div className="flex justify-between"><dt className="text-slate">Tax</dt><dd className="tabular-nums">{formatMoney(tax)}</dd></div>
          <div className="flex justify-between border-t border-line pt-1.5 font-semibold"><dt>Total</dt><dd className="tabular-nums">{formatMoney(total)}</dd></div>
        </dl>
      </div>
      <input type="hidden" name="items" value={JSON.stringify(lines)} />
    </div>
  );
}
