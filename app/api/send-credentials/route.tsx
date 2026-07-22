// app/api/send-credentials/route.ts
import { NextResponse } from 'next/server'
import User from '@/models/User'
import { sendEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { userIds, subject } = await request.json()

    // Fetch users with their details
    const users = await User.find({ _id: { $in: userIds } })

    // Send emails to each user
    const sendPromises = users.map(async (user) => {
      const emailContent = `
        <p>Hello ${user.name},</p>
        <p>Your login credentials for the MINT Internship Portal:</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Temporary Password:</strong> ${generateTemporaryPassword()}</p>
        <p>Please change your password after logging in.</p>
        <p>Best regards,<br/>MINT Admin Team</p>
      `

      await sendEmail({
        to: user.email,
        subject,
        html: emailContent
      })
    })

    await Promise.all(sendPromises)

    return NextResponse.json({ success: true, message: 'Credentials sent successfully' })
  } catch (error) {
    console.error('Error sending credentials:', error)
    return NextResponse.json(
      { error: 'Failed to send credentials' },
      { status: 500 }
    )
  }
}

function generateTemporaryPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}