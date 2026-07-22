// app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { employeeId, email } = await req.json();

    // Validate input
    if (!employeeId && !email) {
      return NextResponse.json(
        { message: "Employee ID or Email is required" }, 
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find user by employeeId or email
    let user;
    if (employeeId) {
      user = await User.findOne({ employeeId: employeeId.trim() });
    } else {
      user = await User.findOne({ email: email.trim().toLowerCase() });
    }

    // For security, don't reveal if user exists or not
    if (!user) {
      console.log("User not found with provided credentials");
      return NextResponse.json(
        { message: "If an account exists with the provided information, a reset link has been sent." }, 
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Save token to database
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    
    try {
      await user.save();
      console.log(`Reset token saved for user ${user.employeeId}: ${resetToken}`);
    } catch (saveError) {
      console.error("Error saving reset token:", saveError);
      return NextResponse.json(
        { message: "Error processing your request. Please try again." }, 
        { status: 500 }
      );
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Create reset URL
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(resetToken)}&id=${encodeURIComponent(user.employeeId)}`;

    // Send email
    try {
      await transporter.sendMail({
        from: `"Password Reset" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Password Reset Request",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #087684;">Password Reset Request</h2>
            <p>Hello ${user.name || user.employeeId},</p>
            <p>You requested to reset your password. Click the button below to proceed:</p>
            <div style="text-align: center; margin: 25px 0;">
              <a href="${resetUrl}" style="background-color: #087684; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p>This link will expire in 15 minutes for security reasons.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #777;">
              Trouble with the button? Copy and paste this URL into your browser:<br>
              ${resetUrl}
            </p>
          </div>
        `,
      });

      console.log(`Password reset email sent to ${user.email}`);
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      { message: "If an account exists with the provided information, a reset link has been sent." }, 
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "An internal server error occurred. Please try again later." }, 
      { status: 500 }
    );
  }
}