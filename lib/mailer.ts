// lib/mailer.ts
import nodemailer from "nodemailer"

export const transporter = nodemailer.createTransport({
   host: 'smtp.gmail.com',
  port: 465,       // SSL (alternative: 587 for TLS)
  secure: true,    // Use SSL if port 465, use TLS if port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export async function sendCandidateEmail(to: string, jobTitle: string) {
  const mailOptions = {
    from: `"HR Team" <${process.env.EMAIL_USER}>`,
    to,
    subject: `You have been shortlisted for ${jobTitle}`,
    html: `
      <p>Dear Candidate,</p>
      <p>We are pleased to inform you that you have been shortlisted for the <strong>${jobTitle}</strong> role.</p>
      <p>Our team will contact you soon with further details.</p>
      <br />
      <p>Best regards,<br/>HR Team</p>
    `,
  }

  return transporter.sendMail(mailOptions)
}
