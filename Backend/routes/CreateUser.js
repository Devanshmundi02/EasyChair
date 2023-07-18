const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Token = require("../models/Token");
const sendEmail = require("../utils/SendEmail");
const crypto = require("crypto");
const jwtsecret = "GenocideIsGoodForPeople/ThanosAndErenAreRight";

// Register User
router.post(
  "/createuser",
  [
    body("email").isEmail(),
    body("prefix").isLength(),
    body("Fname").isLength(),
    body("Mname").isLength(),
    body("Lname").isLength(),
    body("mobile").isNumeric(),
    body("password").isLength({ min: 8 }),
  ],
  async (req, res) => {
    try {
      // Validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      const secPassword = await bcrypt.hash(req.body.password, salt);

      console.log("Creating user:", req.body.email);

      const user = await User.create({
        prefix: req.body.prefix,
        Fname: req.body.Fname,
        Mname: req.body.Mname,
        Lname: req.body.Lname,
        password: secPassword,
        email: req.body.email,
        mobile: req.body.mobile,
        isVerified: false, // Set initial verification status to false
      });

      console.log("User created:", user);

      await sendVerificationEmail(user, req.get("host"));

      console.log("Verification email sent successfully");

      res.json({ success: true });
    } catch (error) {
      console.log("Error creating user:", error);
      res.json({ success: false, message: "Failed to create user" });
    }
  }
);

// Login User
router.post(
  "/loginuser",
  [body("email").isEmail(), body("password").isLength({ min: 8 })],
  async (req, res) => {
    try {
      // Validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const email = req.body.email;
      console.log("Logging in user:", email);

      const userData = await User.findOne({ email });

      console.log("User data:", userData);

      if (!userData) {
        console.log("User not found");
        return res.status(400).json({ success: false, message: "Invalid credentials" });
      }

       // Check if the user's email is verified
       if (!userData.isVerified) {
        return res.status(400).json({ errors: 'Email not verified' });
      }
      
      const pwdcompare = await bcrypt.compare(req.body.password, userData.password);
      if (!pwdcompare) {
        console.log("Invalid password");
        return res.status(400).json({ success: false, message: "Invalid credentials" });
      }

      const data = {
        user: {
          id: userData.id,
        },
      };

      const authToken = jwt.sign(data, jwtsecret);
      return res.json({ success: true, authToken: authToken });
    } catch (error) {
      console.log("Error logging in user:", error);
      res.json({ success: false, message: "Failed to log in" });
    }
  }
);

// Backend route to check email verification
// router.get('/check-email-verification', async (req, res) => {
//   try {
//     const { email } = req.query;
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.json({ isVerified: false });
//     }

//     res.json({ isVerified: user.isVerified });
//   } catch (error) {
//     console.log('Error checking email verification:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// Verify Email
router.get("/verify-email/:token", async (req, res) => {
  try {
    const token = req.params.token;
    console.log("Verifying email with token:", token);

    // Find the token in the database
    const tokenData = await Token.findOne({ token });

    console.log("Token data:", tokenData);

    if (!tokenData) {
      console.log("Invalid or expired token");
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    // Find the corresponding user in the database
    const user = await User.findById(tokenData.userId);

    console.log("User data:", user);

    if (!user) {
      console.log("User not found");
      return res.status(400).json({ success: false, message: "User not found" });
    }

    // Update the user's email verification status
    user.isVerified = true;
    await user.save();

    console.log("Email verified successfully");

    // Delete the token from the database
    await Token.findOneAndRemove({ token });

    // Redirect the user to the login page
    res.redirect("http://localhost:3000/login");
  } catch (error) {
    console.log("Error verifying email:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

async function sendVerificationEmail(user, host) {
  try {
    console.log("Sending verification email to:", user.email);

    // Generate verification token
    const token = crypto.randomBytes(20).toString("hex");

    // Save or update the token in the database
    let tokenData = await Token.findOne({ userId: user._id });

    if (tokenData) {
      tokenData.token = token;
      await tokenData.save();
    } else {
      tokenData = await Token.create({
        userId: user._id,
        token: token,
      });
    }

    // Construct the verification link
    const verificationLink = `http://${host}/api/verify-email/${token}`;

    // Email content
    const emailContent = {
      to: user.email,
      subject: "Email Verification",
      text: `Please click on the following link to verify your email: ${verificationLink}`,
      html: `<p>Please click <a href="${verificationLink}" style="color: blue;">here</a> to verify your email.</p>`,
    };

    console.log("Email content:", emailContent);

    // Send the verification email
    await sendEmail(emailContent);

    console.log("Verification email sent successfully");
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
}

module.exports = router;
