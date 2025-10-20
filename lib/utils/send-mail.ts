import nodemailer from "nodemailer";
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger('SendMail');

type MailInput = { to: string; subject: string; html: string };

async function sendViaResend({ to, subject, html }: MailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY missing");

  const from = process.env.RESEND_FROM || process.env.SMTP_USER || "onboarding@resend.dev";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Resend error: ${res.status} ${text}`);
  }

  return res.json().catch(() => ({}));
}

async function sendViaSmtp({ to, subject, html }: MailInput) {
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = port === 465; // true for 465, false for 587 (STARTTLS)

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    } : undefined,
    // Avoid hanging forever when SMTP is unreachable
    connectionTimeout: 10000, // 10s
    socketTimeout: 10000, // 10s
    greetingTimeout: 10000, // 10s
  } as any);

  const from = `"App" <${process.env.SMTP_USER || "no-reply@example.com"}>`;

  return await transporter.sendMail({ from, to, subject, html });
}

export async function sendMail(input: MailInput) {
  // Prefer HTTP API if configured, to bypass blocked SMTP ports
  if (process.env.RESEND_API_KEY) {
    try {
      return await sendViaResend(input);
    } catch (e) {
      // Fallback to SMTP if HTTP provider fails
      logger.error("sendMail via Resend failed, falling back to SMTP", e);
    }
  }
  return await sendViaSmtp(input);
}
