const User = require("../models/User");
const otpService = require("../services/otpService");

/**
 * @desc    Update user details
 * @route   PUT /api/users/update-details
 * @access  Private
 */
exports.updateDetails = async (req, res, next) => {
  try {
    const { name } = req.body;

    const fieldsToUpdate = {
      name,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user email
 * @route   POST /api/users/update-email
 * @access  Private
 */
exports.updateEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if email is already in use
    const existingUser = await User.findOne({ email });

    if (existingUser && existingUser._id.toString() !== req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    const user = await User.findById(req.user.id).select("+otpLastSent");

    // Set new email but mark as unverified
    user.email = email;
    user.isVerified = false;
    await user.save();

    // Generate and send OTP
    await otpService.generateAndSendOTP(user);

    res.status(200).json({
      success: true,
      message: "Please verify your new email address",
      userId: user._id,
    });
  } catch (error) {
    if (error) next(error);
  }
};

/**
 * @desc    Update password
 * @route   PUT /api/users/update-password
 * @access  Private
 */
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Check current password
    const user = await User.findById(req.user.id).select("+password +salt");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
