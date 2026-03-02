import nodemailer from "nodemailer"

// Create transporter — uses Gmail SMTP by default, but can be swapped
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App-password for Gmail
  },
})

// Verify connection once at startup (non-blocking)
transporter.verify().then(() => {
  console.log("[Email] Transporter ready")
}).catch((err) => {
  console.warn("[Email] Transporter NOT ready — emails will fail:", err.message)
})

// ─── Base HTML wrapper ────────────────────────────────────────────────────────
function wrapHtml(body) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>
      body { margin:0; padding:0; background:#f4f6f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
      .container { max-width:600px; margin:40px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,.08); }
      .header { background: linear-gradient(135deg, #6c5ce7 0%, #a855f7 100%); padding:32px; text-align:center; }
      .header img { height:40px; margin-bottom:8px; }
      .header h1 { color:#fff; margin:0; font-size:22px; font-weight:600; }
      .body { padding:32px; color:#333; line-height:1.7; }
      .body h2 { margin-top:0; color:#1a1a2e; }
      .btn { display:inline-block; padding:14px 32px; background:linear-gradient(135deg, #6c5ce7, #a855f7); color:#ffffff !important; text-decoration:none; border-radius:8px; font-weight:600; font-size:15px; margin:16px 0; }
      .info-box { background:#f8f9ff; border-left:4px solid #6c5ce7; padding:16px; border-radius:0 8px 8px 0; margin:16px 0; }
      .footer { text-align:center; padding:24px; color:#999; font-size:13px; border-top:1px solid #eee; }
      .footer a { color:#6c5ce7; text-decoration:none; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Tixe</h1>
      </div>
      <div class="body">
        ${body}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Tixe — Your AI-Powered Freelancing Platform</p>
        <p><a href="${process.env.FRONTEND_ORIGIN || "http://localhost:3000"}">Visit Tixe</a></p>
      </div>
    </div>
  </body>
  </html>`
}

// ─── Send helper ──────────────────────────────────────────────────────────────
async function send(to, subject, htmlBody) {
  const mailOptions = {
    from: `"Tixe" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: wrapHtml(htmlBody),
  }
  try {
    const info = await transporter.sendMail(mailOptions)
    console.log(`[Email] Sent "${subject}" to ${to} — ${info.messageId}`)
    return info
  } catch (err) {
    console.error(`[Email] Failed to send "${subject}" to ${to}:`, err.message)
    throw err
  }
}

// ─── Email: Verify your email (OTP) ───────────────────────────────────────────
export async function sendVerificationOTP(to, name, otpCode) {
  const digits = otpCode.toString().split("")
  const digitBoxes = digits
    .map(
      (d) =>
        `<span style="display:inline-block;width:48px;height:56px;line-height:56px;font-size:28px;font-weight:700;color:#1a1a2e;background:#f0edff;border:2px solid #6c5ce7;border-radius:10px;margin:0 4px;text-align:center;">${d}</span>`
    )
    .join("")

  const body = `
    <h2>Verify Your Email</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Thanks for signing up on <strong>Tixe</strong>! Use the verification code below to complete your registration:</p>
    <div style="text-align:center;margin:24px 0;">
      ${digitBoxes}
    </div>
    <p style="text-align:center;font-size:22px;letter-spacing:8px;font-weight:700;color:#6c5ce7;margin:8px 0;">${otpCode}</p>
    <p style="font-size:13px;color:#888;text-align:center;">Enter this code on the verification page to activate your account.</p>
    <p style="font-size:13px;color:#888;text-align:center;">This code will expire in <strong>10 minutes</strong>.</p>
    <p style="font-size:12px;color:#aaa;text-align:center;margin-top:16px;">If you didn't create an account on Tixe, you can safely ignore this email.</p>
  `
  return send(to, "Your Tixe verification code", body)
}

// ─── Email: Gig Created ──────────────────────────────────────────────────────
export async function sendGigCreatedEmail(to, name, gigTitle) {
  const dashboardUrl = `${process.env.FRONTEND_ORIGIN || "http://localhost:3000"}/freelancer/Gigs`
  const body = `
    <h2>Your Gig is Live! 🎉</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your gig has been successfully created and is now live on Tixe:</p>
    <div class="info-box">
      <strong>${gigTitle}</strong>
    </div>
    <p>Clients can now discover and order your gig. Make sure your profile is complete to attract more buyers!</p>
    <p style="text-align:center;">
      <a class="btn" href="${dashboardUrl}">View My Gigs</a>
    </p>
  `
  return send(to, `Your gig "${gigTitle}" is live on Tixe!`, body)
}

// ─── Email: New Proposal Received (to Client) ────────────────────────────────
export async function sendProposalNotificationEmail(to, clientName, freelancerName, jobTitle, proposalId) {
  const proposalUrl = `${process.env.FRONTEND_ORIGIN || "http://localhost:3000"}/client/proposals/${proposalId}`
  const body = `
    <h2>New Proposal Received 📩</h2>
    <p>Hi <strong>${clientName}</strong>,</p>
    <p>A freelancer has submitted a proposal for your job posting:</p>
    <div class="info-box">
      <p style="margin:0 0 8px;"><strong>Job:</strong> ${jobTitle}</p>
      <p style="margin:0;"><strong>Freelancer:</strong> ${freelancerName}</p>
    </div>
    <p>Review the proposal and decide whether to accept or pass.</p>
    <p style="text-align:center;">
      <a class="btn" href="${proposalUrl}">View Proposal</a>
    </p>
  `
  return send(to, `New proposal for "${jobTitle}"`, body)
}

export default {
  sendVerificationOTP,
  sendGigCreatedEmail,
  sendProposalNotificationEmail,
}
