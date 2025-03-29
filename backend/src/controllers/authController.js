const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Create a cookie options object
const cookieOptions = {
  httpOnly: true,
  secure: false, // Set to false for testing
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  // Remove domain for local testing
};

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log("Registering user:", { username, email, password });

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        errors: {
          [existingUser.email === email.toLowerCase() ? "email" : "username"]:
            existingUser.email === email.toLowerCase()
              ? "Email already registered"
              : "Username already taken",
        },
      });
    }

    // Create new user
    const user = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Set cookie with dynamic options
    res.cookie("token", token, cookieOptions);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token, // Still sending token in response for flexibility
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      errors: {
        server: "Error registering user",
      },
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: email.toLowerCase() }],
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        errors: {
          email: "Invalid email/username or password",
        },
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        errors: {
          email: "Invalid email/username or password",
        },
      });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Set cookie
    res.cookie("token", token, cookieOptions);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      errors: {
        server: "Error logging in",
      },
    });
  }
};

exports.logout = async (req, res) => {
  try {
    // Clear the cookie
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0), // Expire immediately
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      errors: {
        server: "Error logging out",
      },
    });
  }
};
