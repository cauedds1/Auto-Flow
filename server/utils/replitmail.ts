// Referenced from Replit Mail integration blueprint
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { z } from "zod";

// Zod schema matching the backend implementation
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

export type SmtpMessage = z.infer<typeof zSmtpMessage>

async function getAuthToken(): Promise<{ authToken: string, hostname: string }> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  console.log("[ReplitMail] REPLIT_CONNECTORS_HOSTNAME:", hostname);
  
  if (!hostname) {
    throw new Error("REPLIT_CONNECTORS_HOSTNAME environment variable not found");
  }

  try {
    const { stdout } = await promisify(execFile)(
      "replit",
      ["identity", "create", "--audience", `https://${hostname}`],
      { encoding: "utf8" },
    );

    const replitToken = stdout.trim();
    if (!replitToken) {
      throw new Error("Replit Identity Token not found for repl/depl");
    }

    console.log("[ReplitMail] Auth token obtained successfully");
    return { authToken: `Bearer ${replitToken}`, hostname };
  } catch (error) {
    console.error("[ReplitMail] Error getting auth token:", error);
    throw error;
  }
}

export async function sendEmail(message: SmtpMessage): Promise<{
  accepted: string[];
  rejected: string[];
  pending?: string[];
  messageId: string;
  response: string;
}> {
  try {
    console.log("[ReplitMail] Starting to send email to:", message.to);
    
    const { hostname, authToken } = await getAuthToken();
    console.log("[ReplitMail] Got auth, sending to endpoint");

    const response = await fetch(
      `https://${hostname}/api/v2/mailer/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Replit-Authentication": authToken,
        },
        body: JSON.stringify({
          to: message.to,
          cc: message.cc,
          subject: message.subject,
          text: message.text,
          html: message.html,
          attachments: message.attachments,
        }),
      }
    );

    console.log("[ReplitMail] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ReplitMail] Error response:", errorText);
      throw new Error(`Failed to send email: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("[ReplitMail] Email sent successfully:", result);
    return result;
  } catch (error) {
    console.error("[ReplitMail] Fatal error sending email:", error);
    throw error;
  }
}
