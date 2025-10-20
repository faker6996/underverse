import nodemailer from 'nodemailer';

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT || '587');
  if (!host || !user || !pass) {
    console.warn('SMTP not configured; skip email to', to);
    return;
  }
  const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
  await transporter.sendMail({ from: user, to, subject, html });
}

