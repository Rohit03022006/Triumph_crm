import { Resend } from "resend";
import { env } from "../config/env.js";

const resend = new Resend(env.RESEND_API_KEY);

/**
 * @param {{to: string, subject: string, html: string}} params
 */
export async function sendEmail({ to, subject, html }) {
  try {
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("Failed to send email:", err);
    throw err; // let the caller (e.g. BullMQ worker) handle retry
  }
}

