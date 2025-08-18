require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const transporter = require('../config/nodemailer')

// Register function
module.exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "Please fill all fields" });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({
      name,
      email,
      password: hashedPassword
    });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Welcome to authentication',
      text: `Welcome ${name}! Your account with email ${email} has been successfully created.`
    }
    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: "User registered successfully" });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
}

// Login function
module.exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: "Email and Password are required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found or invalid email" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({ success: true, message: "User logged in successfully" });
  }
  catch (err) {
    res.json({ success: false, message: err.message });
  }
}

// Logout function
module.exports.logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'None'
    });
    return res.json({ success: true, message: "User logged out successfully" });
  }
  catch (err) {
    return res.json({ success: false, message: err.message });
  }
}

module.exports.sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await userModel.findById(userId);

    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account Already verified" })
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000))

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Account Verification OTP',
      text: `Your OTP is ${otp}. Verify your account using this OTP.`
    }
    await transporter.sendMail(mailOption)

    res.json({ success: true, message: "verification OTP sent on Email" })

  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

module.exports.verifyEmail = async (req, res) => {
  const userId = req.userId;
  const { otp } = req.body;

  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing Details" })
  }
  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" })
    }
    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" })
    }
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" })
    }
    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;

    await user.save();
    return res.json({ success: true, message: "Email verified successfully" })

  } catch (error) {
    return res.json({ success: false, message: error.message })
  }
}

module.exports.isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true, message: "User is authenticated" })
  } catch (error) {
    return res.json({ success: false, message: error.message })
  }
}

module.exports.sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ success: false, message: "Email is required" })
  }
  try {
    const user = await userModel.findOne({ email })
    if (!user) {
      return res.json({ success: false, message: "User not found" })
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000))

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Password Reset OTP',
      text: `Your OTP is ${otp}. Reset your Password using this OTP.`
    }
    await transporter.sendMail(mailOption)

    res.json({ success: true, message: "verification OTP sent on Email" })
  }
  catch (error) {
    return res.json({ success: false, message: error.message })
  }
}

module.exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.json({ success: false, message: "Email ,OTP and New Password are required" })
  }
  try {
    const user = await userModel.findOne({ email })
    if (!user) {
      return res.json({ success: false, message: "User not found" })
    }
    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }
    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP has expired" })
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();

    return res.json({ success: true, message: "Password reset successfully" })

  } catch (error) {
    return res.json({ success: false, message: error.message })
  }

}

// Verify Reset OTP
module.exports.verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.json({ success: false, message: "Email and OTP are required" });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.resetOtp !== otp || Date.now() > user.resetOtpExpireAt) {
      return res.json({ success: false, message: "Invalid or expired OTP" });
    }

    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();

    return res.json({ success: true, message: "OTP verified successfully" });

  } catch (error) {
    console.error("Error in verifyResetOtp:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};