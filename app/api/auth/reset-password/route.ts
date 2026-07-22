// app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { token, employeeId, newPassword } = await req.json();

    // Validate input data
    if (!token || !employeeId || !newPassword) {
      return NextResponse.json(
        { message: "Token, employee ID, and new password are required" }, 
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find user with valid reset token - use exact match and check expiration
    const user = await User.findOne({
      employeeId: employeeId.trim(),
      resetPasswordToken: token.trim(),
      resetPasswordExpiry: { $gt: Date.now() }, // Check if expiry time is greater than now
    });

    if (!user) {
      // Additional debugging - check what's actually in the database
      console.log(`Reset attempt - EmployeeID: ${employeeId}, Token: ${token}`);
      
      // Check if user exists but token is different or expired
      const userExists = await User.findOne({ employeeId: employeeId.trim() });
      if (userExists) {
        console.log(`User found but token mismatch or expired. DB token: ${userExists.resetPasswordToken}, Expiry: ${userExists.resetPasswordExpiry}`);
        
        if (userExists.resetPasswordExpiry && userExists.resetPasswordExpiry < Date.now()) {
          return NextResponse.json(
            { message: "Reset link has expired. Please request a new one." }, 
            { status: 400 }
          );
        }
      }
      
      return NextResponse.json(
        { message: "Invalid or expired reset link" }, 
        { status: 400 }
      );
    }

    // Update the user's password and clear reset token
    user.password = newPassword; // In production, you should hash this!
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    return NextResponse.json(
      { message: "Password reset successfully. You can now log in with your new password." }, 
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { message: "An internal server error occurred. Please try again later." }, 
      { status: 500 }
    );
  }
}