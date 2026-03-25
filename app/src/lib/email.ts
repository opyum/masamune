import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Masamune <noreply@masamune.fr>";

interface SendEmailOptions {
  to: string;
  subject: string;
  react: React.ReactElement;
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    react,
  });

  if (error) {
    console.error("Failed to send email:", error);
    throw new Error(`Email send failed: ${error.message}`);
  }

  return data;
}
