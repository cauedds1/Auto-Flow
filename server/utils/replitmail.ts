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

export async function sendEmail(message: SmtpMessage) {
  try {
    const to = Array.isArray(message.to) ? message.to[0] : message.to;
    
    console.log("\n═════════════════════════════════════════════════════════");
    console.log("📧 EMAIL VERIFICATION CODE");
    console.log("═════════════════════════════════════════════════════════");
    console.log("Para:", to);
    console.log("Assunto:", message.subject);
    
    // Extrair código do HTML
    const codeMatch = message.html?.match(/class="code">(\d{6})</);
    if (codeMatch) {
      console.log("🔑 CÓDIGO DE VERIFICAÇÃO:", codeMatch[1]);
      console.log("⏰ Válido por 15 minutos");
    }
    
    console.log("═════════════════════════════════════════════════════════\n");

    // Tentar SendGrid se credenciais estiverem disponíveis
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;

    if (apiKey && fromEmail) {
      console.log("[SendGrid] Enviando via SendGrid...");
      sgMail.setApiKey(apiKey);

      const msg: any = {
        to,
        from: fromEmail,
        subject: message.subject,
      };

      if (message.html) msg.html = message.html;
      if (message.text) msg.text = message.text;
      if (message.cc) msg.cc = message.cc;

      await sgMail.send(msg);
      console.log("[SendGrid] ✓ Email enviado com sucesso!");
    } else {
      console.log("[Email] SendGrid não configurado - código exibido acima para referência");
    }

    const toArray = Array.isArray(message.to) ? message.to : [message.to];
    return {
      accepted: toArray,
      rejected: [],
      messageId: `sg-${Date.now()}`,
      response: 'Email processed'
    };
  } catch (error) {
    console.error("[Email] Erro:", error);
    throw error;
  }
}
