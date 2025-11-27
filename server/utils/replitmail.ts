import sgMail from '@sendgrid/mail';
import { z } from 'zod';

export const zSmtpMessage = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]).describe("Recipient email address(es)"),
  cc: z.union([z.string().email(), z.array(z.string().email())]).optional().describe("CC recipient email address(es)"),
  subject: z.string().describe("Email subject"),
  text: z.string().optional().describe("Plain text body"),
  html: z.string().optional().describe("HTML body"),
});

export type SmtpMessage = z.infer<typeof zSmtpMessage>;

async function getCredentials() {
  try {
    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME || 'connectors.replit.com';
    
    // Tentar via Replit Connectors
    const xReplitToken = process.env.REPL_IDENTITY
      ? 'repl ' + process.env.REPL_IDENTITY
      : process.env.WEB_REPL_RENEWAL
        ? 'depl ' + process.env.WEB_REPL_RENEWAL
        : null;

    if (xReplitToken) {
      console.log("[SendGrid] Tentando via Replit Connectors...");
      
      const response = await fetch(
        `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=sendgrid`,
        {
          headers: {
            'Accept': 'application/json',
            'X_REPLIT_TOKEN': xReplitToken
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const settings = data.items?.[0]?.settings;
        
        if (settings?.api_key && settings?.from_email) {
          console.log("[SendGrid] ✓ Credenciais obtidas via Replit Connectors");
          return {
            apiKey: settings.api_key,
            email: settings.from_email
          };
        }
      }
    }

    // Fallback: tentar env vars
    const apiKey = process.env.SENDGRID_API_KEY;
    const email = process.env.SENDGRID_FROM_EMAIL;

    if (apiKey && email) {
      console.log("[SendGrid] ✓ Credenciais obtidas via Environment Variables");
      return { apiKey, email };
    }

    throw new Error('SendGrid credentials not found');
  } catch (error) {
    console.error("[SendGrid] Erro ao obter credenciais:", error);
    throw error;
  }
}

export async function sendEmail(message: SmtpMessage) {
  try {
    const to = Array.isArray(message.to) ? message.to[0] : message.to;
    
    console.log("\n" + "=".repeat(60));
    console.log("📧 ENVIANDO EMAIL DE VERIFICAÇÃO");
    console.log("=".repeat(60));
    console.log("Para:", to);
    console.log("Assunto:", message.subject);

    const { apiKey, email: fromEmail } = await getCredentials();

    console.log("[SendGrid] Configurando cliente SendGrid...");
    sgMail.setApiKey(apiKey);

    const msg: any = {
      to,
      from: fromEmail,
      subject: message.subject,
    };

    if (message.html) msg.html = message.html;
    if (message.text) msg.text = message.text;
    if (message.cc) msg.cc = message.cc;

    console.log("[SendGrid] Enviando via SendGrid...");
    const response = await sgMail.send(msg);

    console.log("[SendGrid] ✓ Email enviado com sucesso!");
    
    // Extrair código do HTML para log
    const codeMatch = message.html?.match(/class="code">(\d{6})</);
    if (codeMatch) {
      console.log("🔑 Código:", codeMatch[1]);
    }
    
    console.log("=".repeat(60) + "\n");

    const toArray = Array.isArray(message.to) ? message.to : [message.to];
    return {
      accepted: toArray,
      rejected: [],
      messageId: response[0].headers['x-message-id'] || `sg-${Date.now()}`,
      response: 'Email sent successfully'
    };
  } catch (error) {
    console.error("\n[SendGrid] ❌ ERRO ao enviar email:", error);
    console.log("=".repeat(60) + "\n");
    throw error;
  }
}
