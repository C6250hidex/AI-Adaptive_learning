const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

/**
 * 1. IDENTITY PROVISIONING (Register)
 * Optimized for Postgres ENUM constraints and data integrity.
 */
exports.register = async (req, res) => {
  console.log("📥 [AUTH] Registration Attempt Received:", req.body.email);

  try {
    const { username, email, password, role } = req.body;

    // A. DATA SANITIZATION
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "All authentication fields are required." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.trim();

    // B. SECURITY GUARD: Role Logic
    // We strictly map incoming roles to lowercase to match Postgres ENUM.
    // We prevent "admin" registration via this public endpoint.
    const allowedRoles = ["student", "teacher"];
    let finalRole = role ? role.toLowerCase() : "student";

    if (finalRole === "admin" || !allowedRoles.includes(finalRole)) {
      finalRole = "student";
    }

    // C. IDENTITY UNIQUENESS CHECK
    const existingUser = await User.findOne({ where: { email: cleanEmail } });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "This academic identity is already registered." });
    }

    // D. ENCRYPTION
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // E. PERSISTENCE
    const newUser = await User.create({
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
      role: finalRole,
      currentLevel: "Medium", // AI Baseline start
      points: 0,
    });

    console.log(`✅ [AUTH] Identity Created: ${cleanUsername} [${finalRole}]`);
    res.status(201).json({
      message: "Academic profile successfully indexed in database.",
      role: newUser.role,
    });
  } catch (error) {
    console.error(
      "❌ [AUTH] DB INSERT ERROR:",
      error.name,
      "->",
      error.message,
    );

    // Professional Error feedback based on Sequelize error types
    if (error.name === "SequelizeValidationError") {
      return res
        .status(400)
        .json({
          message: "Data format invalid. Check email and username length.",
        });
    }
    res.status(500).json({ message: "Internal Authentication Node failure." });
  }
};

/**
 * 2. SESSION INITIALIZATION (Login)
 * Secure credential verification and JWT issuance.
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Credentials missing." });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Query Database
    const user = await User.findOne({ where: { email: cleanEmail } });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Identity rejected. Check email or password." });
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Identity rejected. Check email or password." });
    }

    // Generate Token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    console.log(`🔑 [AUTH] Session Started: ${user.username} [${user.role}]`);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        currentLevel: user.currentLevel,
      },
    });
  } catch (error) {
    console.error("❌ [AUTH] LOGIN ERROR:", error.message);
    res
      .status(500)
      .json({ error: "Cloud authentication service unavailable." });
  }
};

/**
 * 3. IDENTITY SYNC (Get Me)
 * Real-time database verification for the AuthContext.
 */
exports.getMe = async (req, res) => {
  try {
    // req.user.id is injected by the 'protect' middleware
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Session expired. Identity not found." });
    }

    res.json(user);
  } catch (error) {
    console.error("❌ [AUTH] GET_ME ERROR:", error.message);
    res.status(500).json({ error: "Failed to verify database session." });
  }
};

/**
 * 4. SECURITY UPDATE (Change Password)
 * Ensures user is authenticated before changing sensitive keys.
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new passwords required." });
    }

    const user = await User.findByPk(req.user.id);

    // Verify Ownership
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Verification failed. Current password incorrect." });
    }

    // Hash new key
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    console.log(`🔐 [AUTH] Password Updated for User: ${user.username}`);
    res.json({ message: "Security credentials updated successfully." });
  } catch (error) {
    console.error("❌ [AUTH] PWD CHANGE ERROR:", error.message);
    res.status(500).json({ error: "Password update sequence failed." });
  }
};
