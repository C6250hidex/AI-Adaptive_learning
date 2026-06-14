const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

// 1. REGISTER: Provisioning new Academic Identities
exports.register = async (req, res) => {
  // ADD THIS LOG:
  console.log("📥 Incoming Registration:", req.body);

  try {
    const { username, email, password, role } = req.body;

    // Loosen validation logic for the demo
    const cleanEmail = email ? email.toLowerCase().trim() : null;
    const finalRole =
      role && role.toLowerCase() === "teacher" ? "teacher" : "student";

    if (!username || !cleanEmail || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      username: username.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: finalRole,
    });

    res.status(201).json({ message: "Account created successfully" });
  } catch (error) {
    // ADD THIS LOG:
    console.error("❌ DB Insert Error:", error);
    res.status(500).json({ message: error.message || "Registration failed" });
  }
};

// 2. LOGIN: Authenticating Database Sessions
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    // DATABASE QUERY: Find user by sanitized email
    const user = await User.findOne({ where: { email: cleanEmail } });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid credentials or account non-existent." });
    }

    // VERIFICATION: Compare provided key with encrypted database hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid credentials. Authentication rejected." });
    }

    // TOKEN GENERATION: Issue JWT with role-based claims
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }, // Professional session length
    );

    console.log(`USER AUTHENTICATED: ${user.username} [Role: ${user.role}]`);

    // Return identity package to wake up Frontend AuthContext
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ error: "Authentication node failure" });
  }
};

// 3. GET ME: Live Database Identity Verification
// Used by AuthContext.jsx on every page refresh to verify current session
exports.getMe = async (req, res) => {
  try {
    // req.user.id is attached by the 'protect' middleware
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] }, // CRITICAL: Never send password back
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Session expired or identity purged." });
    }

    res.json(user);
  } catch (error) {
    console.error("GET_ME ERROR:", error);
    res.status(500).json({ error: "Failed to verify live database session." });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password incorrect." });

    // Hash and save new password
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: "Security credentials updated successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
