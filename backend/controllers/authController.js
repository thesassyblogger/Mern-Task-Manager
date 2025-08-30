const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ---- helpers ---------------------------------------------------------------
const normalizeEmail = (e = "") => e.trim().toLowerCase();
const hasJwtSecret = () => Boolean(process.env.JWT_SECRET);

const generateToken = (userId) => {
  if (!hasJwtSecret()) {
    // Make the cause obvious in logs & API
    throw new Error("JWT_SECRET not set");
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const sendUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  profileImageUrl: user.profileImageUrl,
  token: generateToken(user._id),
});

// ---- controllers -----------------------------------------------------------

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    let { name, email, password, profileImageUrl, adminInviteToken } = req.body;

    // basic validation
    name = (name || "").trim();
    email = normalizeEmail(email);
    password = password || "";

    if (!name || !email || !password) {
      return res.status(400).json({ code: "MISSING_FIELDS", message: "Name, email and password are required" });
    }
    // simple email sanity
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ code: "BAD_EMAIL", message: "Email format is invalid" });
    }
    if (password.length < 6) {
      return res.status(400).json({ code: "WEAK_PASSWORD", message: "Password must be at least 6 characters" });
    }

    // If a token is provided, enforce correctness (explicit 403 on mismatch)
    if (adminInviteToken && adminInviteToken !== process.env.ADMIN_INVITE_TOKEN) {
      return res.status(403).json({ code: "BAD_INVITE", message: "Invalid admin invite token" });
    }

    const existing = await User.exists({ email });
    if (existing) {
      return res.status(409).json({ code: "DUP_EMAIL", message: "Email already registered" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // role selection
    const role = adminInviteToken && adminInviteToken === process.env.ADMIN_INVITE_TOKEN ? "admin" : "member";

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      profileImageUrl: profileImageUrl || "",
      role,
    });

    return res.status(201).json(sendUser(user));
  } catch (err) {
    console.error("AUTH_REGISTER_ERROR:", err);
    if (err.code === 11000) {
      return res.status(409).json({ code: "DUP_EMAIL", message: "Email already registered" });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ code: "VALIDATION", message: err.message });
    }
    if (err.message && err.message.includes("JWT_SECRET")) {
      return res.status(500).json({ code: "NO_JWT_SECRET", message: "Server misconfigured: JWT_SECRET not set" });
    }
    return res.status(500).json({ code: "SERVER", message: "Server error" });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password || "";

    if (!email || !password) {
      return res.status(400).json({ code: "MISSING_FIELDS", message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ code: "BAD_CREDENTIALS", message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ code: "BAD_CREDENTIALS", message: "Invalid email or password" });
    }

    return res.json(sendUser(user));
  } catch (err) {
    console.error("AUTH_LOGIN_ERROR:", err);
    if (err.message && err.message.includes("JWT_SECRET")) {
      return res.status(500).json({ code: "NO_JWT_SECRET", message: "Server misconfigured: JWT_SECRET not set" });
    }
    return res.status(500).json({ code: "SERVER", message: "Server error" });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ code: "NOT_FOUND", message: "User not found" });
    }
    return res.json(user);
  } catch (err) {
    console.error("AUTH_PROFILE_ERROR:", err);
    return res.status(500).json({ code: "SERVER", message: "Server error" });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ code: "NOT_FOUND", message: "User not found" });
    }

    if (req.body.name) user.name = req.body.name.trim();
    if (req.body.email) user.email = normalizeEmail(req.body.email);
    if (req.body.profileImageUrl !== undefined) user.profileImageUrl = req.body.profileImageUrl;

    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.status(400).json({ code: "WEAK_PASSWORD", message: "Password must be at least 6 characters" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    // Prevent changing to an email that already exists (other user)
    if (req.body.email) {
      const conflict = await User.exists({ _id: { $ne: user._id }, email: user.email });
      if (conflict) {
        return res.status(409).json({ code: "DUP_EMAIL", message: "Email already registered" });
      }
    }

    const updated = await user.save();
    return res.json(sendUser(updated));
  } catch (err) {
    console.error("AUTH_UPDATE_ERROR:", err);
    if (err.code === 11000) {
      return res.status(409).json({ code: "DUP_EMAIL", message: "Email already registered" });
    }
    return res.status(500).json({ code: "SERVER", message: "Server error" });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile };
