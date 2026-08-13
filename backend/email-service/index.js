import { connect } from 'cloudflare:sockets';

export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const payload = await request.json();
      const { smtp_user, smtp_pass, to, subject, body } = payload;

      if (!smtp_user || !smtp_pass || !to || !subject || !body) {
        return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      await sendEmailViaSMTP(smtp_user, smtp_pass, to, subject, body);

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

async function sendEmailViaSMTP(smtpUser, smtpPass, to, subject, bodyText) {
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
    const messageId = `<${Date.now()}.${Math.random().toString(36).substring(2)}@gmail.com>`;
    const dateStr = new Date().toUTCString();

    const normalizedBody = bodyText.replace(/\r?\n/g, '\r\n');
    const stuffedBody = normalizedBody
      .split('\r\n')
      .map(line => line.startsWith('.') ? '.' + line : line)
      .join('\r\n');
    
    const message = [
      `From: <${smtpUser}>`,
      `To: <${to}>`,
      `Subject: ${subject}`,
      `Message-ID: ${messageId}`,
      `Date: ${dateStr}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=utf-8",
      "Content-Transfer-Encoding: 7bit",
      "",
      stuffedBody,
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
