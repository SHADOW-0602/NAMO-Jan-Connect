import { connect } from 'cloudflare:sockets';

export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const payload = await request.json();
      const { smtp_user, smtp_pass, to, subject, body, html } = payload;

      if (!smtp_user || !smtp_pass || !to || !subject || (!body && !html)) {
        return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      await sendEmailViaSMTP(smtp_user, smtp_pass, to, subject, body || '', html);

      return new Response(JSON.stringify({ status: 'sent' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) {
      console.error('Email send error:', err);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};

class SMTPConnection {
  constructor(socket) {
    this.socket = socket;
    this.reader = socket.readable.getReader();
    this.writer = socket.writable.getWriter();
    this.decoder = new TextDecoder();
    this.encoder = new TextEncoder();
    this.buffer = "";
  }

  async writeLine(line) {
    await this.writer.write(this.encoder.encode(line + "\r\n"));
  }

  async readResponse() {
    while (true) {
      const idx = this.buffer.indexOf("\n");
      if (idx !== -1) {
        const line = this.buffer.substring(0, idx + 1);
        this.buffer = this.buffer.substring(idx + 1);
        if (line.charAt(3) === " ") {
          return line;
        }
        continue;
      }
      const { value, done } = await this.reader.read();
      if (done) {
        if (this.buffer.length > 0) {
          const temp = this.buffer;
          this.buffer = "";
          return temp;
        }
        throw new Error("SMTP connection closed unexpectedly");
      }
      this.buffer += this.decoder.decode(value);
    }
  }

  async close() {
    try {
      this.reader.releaseLock();
      this.writer.releaseLock();
      await this.socket.close();
    } catch (e) {
      // ignore
    }
  }
}

function utf8ToBase64(str) {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  const len = utf8Bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary);
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function convertPlainTextToHtml(bodyText, subject) {
  const normalized = bodyText.replace(/\r\n/g, '\n').trim();
  const paragraphs = normalized.split(/\n\n+/);
  
  let htmlContent = '';
  
  for (let para of paragraphs) {
    para = para.trim();
    if (!para) continue;
    
    // 1. Check if it's a greeting
    if (para.toLowerCase().startsWith('dear ') || para.toLowerCase().startsWith('hello ')) {
      htmlContent += `<h2 style="color: #1e293b; font-size: 18px; font-weight: 600; margin-top: 0; margin-bottom: 16px; line-height: 1.4;">${escapeHtml(para)}</h2>`;
      continue;
    }
    
    // 2. Check if it's a signature (Regards, ...)
    if (para.toLowerCase().startsWith('regards,') || para.toLowerCase().startsWith('sincerely,')) {
      const lines = para.split('\n').map(escapeHtml).join('<br>');
      htmlContent += `<p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-top: 24px; margin-bottom: 0; border-top: 1px solid #e2e8f0; padding-top: 16px;">${lines}</p>`;
      continue;
    }
    
    // 3. Check if paragraph contains key-value details (e.g. Tracking ID: ...)
    const lines = para.split('\n');
    const isKeyValue = lines.every(line => line.includes(':') || line.trim() === '');
    if (isKeyValue && lines.length > 1) {
      let tableRows = '';
      for (const line of lines) {
        const parts = line.split(':');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const val = parts.slice(1).join(':').trim();
          tableRows += `
            <tr>
              <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #475569; width: 120px; vertical-align: top;">${escapeHtml(key)}</td>
              <td style="padding: 8px 0; font-size: 14px; color: #0f172a; vertical-align: top;">${escapeHtml(val)}</td>
            </tr>
          `;
        }
      }
      if (tableRows) {
        htmlContent += `
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              ${tableRows}
            </table>
          </div>
        `;
        continue;
      }
    }
    
    // 4. Check if paragraph contains tracking/action URL
    const urlMatch = para.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      const url = urlMatch[0];
      const textBeforeUrl = para.replace(url, '').replace(/:\s*$/, '').trim();
      let buttonLabel = "Track Progress";
      if (textBeforeUrl.toLowerCase().includes('track') || subject.toLowerCase().includes('status')) {
        buttonLabel = "Track Live Status";
      }
      
      if (textBeforeUrl) {
        htmlContent += `<p style="color: #334155; font-size: 15px; line-height: 1.6; margin-top: 0; margin-bottom: 12px;">${escapeHtml(textBeforeUrl)}</p>`;
      }
      
      htmlContent += `
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
          <tr>
            <td align="center">
              <a href="${escapeHtml(url)}" target="_blank" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 15px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2), 0 2px 4px -2px rgba(37, 99, 235, 0.2);">${escapeHtml(buttonLabel)}</a>
            </td>
          </tr>
        </table>
      `;
      continue;
    }
    
    // Standard paragraph
    const formattedLines = para.split('\n').map(escapeHtml).join('<br>');
    htmlContent += `<p style="color: #334155; font-size: 15px; line-height: 1.6; margin-top: 0; margin-bottom: 16px;">${formattedLines}</p>`;
  }
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        border-radius: 0 !important;
      }
      .content {
        padding: 24px 16px !important;
      }
      .header {
        padding: 24px 0 !important;
      }
      .footer {
        padding: 20px 16px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 40px 0;">
    <tr>
      <td align="center">
        <!-- Main responsive container with class 'container' -->
        <table class="container" border="0" cellpadding="0" cellspacing="0" width="580" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td class="header" align="center" style="padding: 32px 0; background-color: #1e3a8a;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">NAMO Jan Connect</h1>
            </td>
          </tr>
          
          <!-- Content Area -->
          <tr>
            <td class="content" style="padding: 40px 32px;">
              ${htmlContent}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="footer" style="background-color: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #f1f5f9;">
              <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0 0 8px 0;">
                This is an automated administrative notification from NAMO Jan Connect.
              </p>
              <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0;">
                If you did not file a complaint or request this, please disregard this email.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendEmailViaSMTP(smtpUser, smtpPass, to, subject, bodyText, bodyHtml) {
  const socket = connect({ hostname: 'smtp.gmail.com', port: 465 }, { secureTransport: 'on' });
  const conn = new SMTPConnection(socket);

  try {
    // 1. Read greeting
    const greeting = await conn.readResponse();
    if (!greeting.startsWith('220')) {
      throw new Error('Invalid SMTP greeting: ' + greeting);
    }

    // 2. Send EHLO
    await conn.writeLine('EHLO localhost');
    const ehlo = await conn.readResponse();
    if (!ehlo.startsWith('250')) {
      throw new Error('EHLO failed: ' + ehlo);
    }

    // 3. AUTH LOGIN
    await conn.writeLine('AUTH LOGIN');
    const auth = await conn.readResponse();
    if (!auth.startsWith('334')) {
      throw new Error('AUTH LOGIN failed: ' + auth);
    }

    // 4. Send username (base64)
    await conn.writeLine(btoa(smtpUser));
    const userResp = await conn.readResponse();
    if (!userResp.startsWith('334')) {
      throw new Error('AUTH LOGIN username failed: ' + userResp);
    }

    // 5. Send password (base64)
    await conn.writeLine(btoa(smtpPass));
    const passResp = await conn.readResponse();
    if (!passResp.startsWith('235')) {
      throw new Error('AUTH LOGIN password failed: ' + passResp);
    }

    // 6. MAIL FROM
    await conn.writeLine(`MAIL FROM:<${smtpUser}>`);
    const mailFrom = await conn.readResponse();
    if (!mailFrom.startsWith('250')) {
      throw new Error('MAIL FROM failed: ' + mailFrom);
    }

    // 7. RCPT TO
    await conn.writeLine(`RCPT TO:<${to}>`);
    const rcptTo = await conn.readResponse();
    if (!rcptTo.startsWith('250')) {
      throw new Error('RCPT TO failed: ' + rcptTo);
    }

    // 8. DATA
    await conn.writeLine('DATA');
    const dataResp = await conn.readResponse();
    if (!dataResp.startsWith('354')) {
      throw new Error('DATA command failed: ' + dataResp);
    }

    // 9. Send email message headers and body, ending with \r\n.\r\n
    const domain = smtpUser.includes('@') ? smtpUser.split('@')[1] : 'gmail.com';
    const messageId = `<${Date.now()}.${Math.random().toString(36).substring(2)}@${domain}>`;
    const dateStr = new Date().toUTCString();
    const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    // Prepare content parts
    const textPart = bodyText || '';
    const htmlPart = bodyHtml || convertPlainTextToHtml(textPart, subject);

    const base64Text = utf8ToBase64(textPart);
    const base64Html = utf8ToBase64(htmlPart);

    // Format base64 chunks (76 chars per line)
    const formatBase64 = (str) => {
      const chunks = [];
      for (let i = 0; i < str.length; i += 76) {
        chunks.push(str.substring(i, i + 76));
      }
      return chunks.join('\r\n');
    };

    const formattedText = formatBase64(base64Text);
    const formattedHtml = formatBase64(base64Html);

    const message = [
      `From: "NAMO Jan Connect" <${smtpUser}>`,
      `To: <${to}>`,
      `Reply-To: <${smtpUser}>`,
      `Subject: ${subject}`,
      `Message-ID: ${messageId}`,
      `Date: ${dateStr}`,
      "MIME-Version: 1.0",
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      "Content-Type: text/plain; charset=utf-8",
      "Content-Transfer-Encoding: base64",
      "",
      formattedText,
      "",
      `--${boundary}`,
      "Content-Type: text/html; charset=utf-8",
      "Content-Transfer-Encoding: base64",
      "",
      formattedHtml,
      "",
      `--${boundary}--`,
      "."
    ].join('\r\n');

    await conn.writeLine(message);
    const msgResp = await conn.readResponse();
    if (!msgResp.startsWith('250')) {
      throw new Error('Send DATA failed: ' + msgResp);
    }

    // 10. QUIT
    await conn.writeLine('QUIT');
    await conn.readResponse();
  } finally {
    await conn.close();
  }
}
