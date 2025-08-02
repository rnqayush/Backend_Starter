const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

exports.register = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  try {
    // 1. Check if all fields are provided
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // 3. Check if user already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Save user
    const user = await User.create({ name, email, password: hashedPassword });

    // 6. Create and set token in cookie
    const token = createToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    });

    // 7. Send response
    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
      message: "Registration successful",
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = createToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    });

    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.logout = (req, res) => {
  res.cookie("token", "", { maxAge: 1 });
  res.json({ message: "Logged out successfully" });
};
