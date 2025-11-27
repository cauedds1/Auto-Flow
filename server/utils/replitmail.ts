import { z } from "zod";

export const zSmtpMessage = z.object({
  to: z
    .union([z.string().email(), z.array(z.string().email())])
    .describe("Recipient email address(es)"),
  cc: z
    .union([z.string().email(), z.array(z.string().email())])
    .optional()
    .describe("CC recipient email address(es)"),
  subject: z.string().describe("Email subject"),
  text: z.string().optional().describe("Plain text body"),
  html: z.string().optional().describe("HTML body"),
  attachments: z
    .array(
      z.object({
        filename: z.string().describe("File name"),
        content: z.string().describe("Base64 encoded content"),
        contentType: z.string().optional().describe("MIME type"),
        encoding: z
          .enum(["base64", "7bit", "quoted-printable", "binary"])
          .default("base64"),
      })
    )
    .optional()
    .describe("Email attachments"),
});

export type SmtpMessage = z.infer<typeof zSmtpMessage>;

export async function sendEmail(message: SmtpMessage): Promise<{
  accepted: string[];
  rejected: string[];
  pending?: string[];
  messageId: string;
  response: string;
}> {
  try {
    console.log("[Email] Enviando email para:", message.to);

    // Em desenvolvimento, apenas logar
    if (process.env.NODE_ENV !== "production") {
      console.log("[Email] MODO DESENVOLVIMENTO - Email não enviado fisicamente");
      console.log("[Email] Detalhes:", {
        to: message.to,
        subject: message.subject,
      });

      // Retornar simulado
      return {
        accepted: Array.isArray(message.to) ? message.to : [message.to],
        rejected: [],
        messageId: `dev-${Date.now()}`,
        response: "Email logged in development mode",
      };
    }

    // Em produção, usar a API do Replit Connectors
    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME || "connectors.replit.com";

    // Tentar enviar via Replit Mail
    const response = await fetch(`https://${hostname}/api/v2/mailer/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: message.to,
        cc: message.cc,
        subject: message.subject,
        text: message.text,
        html: message.html,
        attachments: message.attachments,
      }),
    });

    console.log("[Email] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Email] Error response:", errorText);
      throw new Error(`Failed to send email: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("[Email] Email sent successfully:", result);
    return result;
  } catch (error) {
    console.error("[Email] Fatal error sending email:", error);
    throw error;
  }
}
