const User = require("../models/User");
const otpService = require("../services/otpService");

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_EXPIRE.split("d")[0] * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};

// @desc    Sign up user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Extract name from email if not provided
    const userName = name || email.split("@")[0];

    // Create user
    const user = await User.create({
      name: userName,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful. You can verify your email later.",
      userId: user._id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Skip email verification
// @route   POST /api/auth/skip-verification
// @access  Public
exports.skipVerification = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Please provide userId",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Send token response without marking as verified
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email with OTP
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please provide userId and OTP",
      });
    }

    // Verify OTP
    const user = await otpService.verifyOTP(userId, otp);

    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res, next) => {
  try {
    const { userId, email } = req.body;

    let user;

    if (userId) {
      user = await User.findById(userId).select("+otpLastSent");
    } else if (email) {
      user = await User.findOne({ email }).select("+otpLastSent");
    } else {
      return res.status(400).json({
        success: false,
        message: "Please provide userId or email",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate and send OTP
    await otpService.generateAndSendOTP(user);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      userId: user._id,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Sign in user
// @route   POST /api/auth/signin
// @access  Public
exports.signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email and password",
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password +salt");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Sign out user / clear cookie
// @route   GET /api/auth/signout
// @access  Private
exports.signout = (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "User signed out successfully",
  });
};

// @desc    Get current signed in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email }).select("+otpLastSent");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with that email",
      });
    }

    // Generate and send OTP
    await otpService.generateAndSendOTP(user, "Password Reset Request");

    res.status(200).json({
      success: true,
      message: "OTP sent for password reset",
      userId: user._id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { userId, otp, password } = req.body;

    if (!userId || !otp || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide userId, OTP and new password",
      });
    }

    // Verify OTP
    const user = await otpService.verifyOTP(userId, otp);

    // Update password
    user.password = password;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
