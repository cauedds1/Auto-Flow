import sgMail from '@sendgrid/mail';
import { z } from 'zod';

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
});

export type SmtpMessage = z.infer<typeof zSmtpMessage>;

async function getCredentials() {
  try {
    console.log("[SendGrid] Iniciando busca de credenciais...");
    
    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
    console.log("[SendGrid] REPLIT_CONNECTORS_HOSTNAME:", hostname);
    
    const xReplitToken = process.env.REPL_IDENTITY
      ? 'repl ' + process.env.REPL_IDENTITY
      : process.env.WEB_REPL_RENEWAL
        ? 'depl ' + process.env.WEB_REPL_RENEWAL
        : null;

    console.log("[SendGrid] Token type:", xReplitToken ? 'found' : 'NOT FOUND');

    if (!hostname || !xReplitToken) {
      throw new Error(`Missing credentials: hostname=${!!hostname}, token=${!!xReplitToken}`);
    }

    const url = `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=sendgrid`;
    console.log("[SendGrid] Fetching from:", url);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    });

    console.log("[SendGrid] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[SendGrid] Response error:", errorText);
      throw new Error(`Failed to get credentials: ${response.status}`);
    }

    const data = await response.json();
    console.log("[SendGrid] Got connection data:", data.items ? `${data.items.length} items` : 'no items');

    const connectionSettings = data.items?.[0];

    if (!connectionSettings) {
      console.error("[SendGrid] No connection settings found");
      throw new Error('SendGrid connection not found');
    }

    const apiKey = connectionSettings.settings?.api_key;
    const fromEmail = connectionSettings.settings?.from_email;

    console.log("[SendGrid] API Key:", apiKey ? `${apiKey.substring(0, 5)}...` : 'MISSING');
    console.log("[SendGrid] From Email:", fromEmail || 'MISSING');

    if (!apiKey || !fromEmail) {
      throw new Error(`Missing settings: apiKey=${!!apiKey}, fromEmail=${!!fromEmail}`);
    }

    return { apiKey, email: fromEmail };
  } catch (error) {
    console.error("[SendGrid] Error getting credentials:", error);
    throw error;
  }
}

export async function sendEmail(message: SmtpMessage) {
  try {
    console.log("[SendGrid] Starting email send to:", message.to);

    const { apiKey, email } = await getCredentials();
    
    console.log("[SendGrid] Setting API key...");
    sgMail.setApiKey(apiKey);

    const msg: any = {
      to: message.to,
      from: email,
      subject: message.subject,
    };

    if (message.html) {
      msg.html = message.html;
    }

    if (message.text) {
      msg.text = message.text;
    }

    if (!message.html && !message.text) {
      msg.text = 'Email';
    }

    if (message.cc) {
      msg.cc = message.cc;
    }

    console.log("[SendGrid] Sending message...");
    const result = await sgMail.send(msg);

    console.log("[SendGrid] Email sent successfully!");

    const toArray = Array.isArray(message.to) ? message.to : [message.to];
    return {
      accepted: toArray,
      rejected: [],
      messageId: `sg-${Date.now()}`,
      response: 'Email sent successfully'
    };
  } catch (error) {
    console.error("[SendGrid] Fatal error:", error);
    throw error;
  }
}
