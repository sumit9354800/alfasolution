import "server-only";
import { Resend } from "resend";
import { env } from "./env";

export type MailAttachment = { filename: string; content: Buffer };

type Mail = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: MailAttachment[];
};

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/**
 * Sends an email through Resend. Email is never allowed to break the main
 * operation (saving an enquiry, recording a payment): failures are logged and
 * `false` is returned.
 */
export async function sendMail(mail: Mail): Promise<boolean> {
  const { apiKey, from } = env.mail;
  if (!apiKey || !from) {
    console.warn(`[mail] Resend is not configured — skipped "${mail.subject}"`);
    return false;
  }
  try {
    const { error } = await new Resend(apiKey).emails.send({
      from,
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      replyTo: mail.replyTo,
      attachments: mail.attachments?.map((a) => ({ filename: a.filename, content: a.content })),
    });
    if (error) {
      console.error("[mail] Resend error", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[mail] send failed", error);
    return false;
  }
}

export function notifyTeam(subject: string, rows: [string, string][], replyTo?: string, attachments?: MailAttachment[]) {
  const to = env.mail.to;
  if (!to) return Promise.resolve(false);
  return sendMail({
    to,
    subject,
    replyTo,
    attachments,
    text: rows.map(([k, v]) => `${k}: ${v}`).join("\n"),
    html: layout(subject, rows.map(([k, v]) => `<p style="margin:0 0 10px"><strong>${escapeHtml(k)}:</strong> ${escapeHtml(v).replace(/\n/g, "<br/>")}</p>`).join("")),
  });
}

export function layout(title: string, body: string) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:620px;margin:auto;color:#191D27">
  <div style="background:#191D27;padding:22px 26px;color:#fff"><div style="font-size:13px;color:#D9A577">Alfa Solution</div><h2 style="margin:6px 0 0;font-size:20px">${escapeHtml(title)}</h2></div>
  <div style="padding:26px;border:1px solid #E4E7EC;border-top:0;line-height:1.6;font-size:14px">${body}</div>
</div>`;
}
