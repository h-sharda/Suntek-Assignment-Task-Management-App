const User = require("../models/User");
const sendEmail = require("../configs/email");
const crypto = require("crypto");

// Generate and send OTP
exports.generateAndSendOTP = async (user, subject = "Email Verification") => {
  try {
    // Check if OTP was sent within the last minute
    if (user.otpLastSent && Date.now() - user.otpLastSent < 60000) {
      throw new Error("Please wait 1 minute before requesting a new OTP");
    }

    // Generate OTP
    const otp = user.getOTP();

    await user.save();

    // Create email content
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">Email Verification OTP</h2>
        <p>Your OTP for verification is:</p>
        <h1 style="font-size: 32px; background-color: #f5f5f5; padding: 10px 15px; display: inline-block; border-radius: 4px;">${otp}</h1>
        <p>This OTP will expire in 15 minutes.</p>
        <p>If you did not request this OTP, please ignore this email.</p>
      </div>
    `;

    // Send email
    await sendEmail({
      to: user.email,
      subject,
      text: message,
    });

    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Verify OTP
exports.verifyOTP = async (userId, otp) => {
  try {
    // Hash OTP for comparison
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    // Find user with the OTP
    const user = await User.findOne({
      _id: userId,
      otp: hashedOTP,
      otpExpire: { $gt: Date.now() },
    }).select("+otp +otpExpire");

    if (!user) {
      throw new Error("Invalid or expired OTP");
    }

    // Clear OTP fields and set verified
    user.otp = undefined;
    user.otpExpire = undefined;
    user.isVerified = true;

    await user.save();

    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};
