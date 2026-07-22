// lib/email.ts
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,       // SSL (alternative: 587 for TLS)
  secure: true,    // Use SSL if port 465, use TLS if port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export async function sendTemporaryPasswordEmail(
  to: string,
  fullName: string,
  employeeId: string,
  password: string,
  role: string
) {
  const mailOptions = {
    from: `"HR System" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Temporary Login Credentials",
    html: `
      <p>Hello ${fullName},</p>
      <p>Your account has been created with the role <strong>${role}</strong>.</p>
      <p>Here are your login details:</p>
      <ul>
        <li><b>Employee ID:</b> ${employeeId}</li>
        <li><b>Email:</b> ${to}</li>
        <li><b>Temporary Password:</b> ${password}</li>
      </ul>
      <p>Please log in and change your password immediately.</p>
      <br/>
      <p>Best regards,<br/>HR Team</p>
    `,
  }

  return transporter.sendMail(mailOptions)
}
