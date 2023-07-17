const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Token = require('../models/token');
const sendEmail = require('../utils/SendEmail');
const crypto = require('crypto');
const jwtsecret = 'GenocideIsGoodForPeople/ThanosAndErenAreRight';

// Register User
router.post(
  '/createuser',
  [
    body('email').isEmail(),
    body('prefix').isLength(),
    body('Fname').isLength(),
    body('Mname').isLength(),
    body('Lname').isLength(),
    body('mobile').isNumeric(),
    body('password').isLength({ min: 8 }),
  ],
  async (req, res) => {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const secPassword = await bcrypt.hash(req.body.password, salt);

    try {
      const user = await User.create({
        prefix: req.body.prefix,
        Fname: req.body.Fname,
        Mname: req.body.Mname,
        Lname: req.body.Lname,
        password: secPassword,
        email: req.body.email,
        mobile: req.body.mobile,
        isVerified: req.body.isVerified, // Set initial verification status to false
      });

      await sendVerificationEmail(user, req.get('host'));

      res.json({ success: true });
    } catch (error) {
      console.log(error);
      res.json({ success: false });
    }
  }
);

// Login User
router.post(
  '/loginuser',
  [body('email').isEmail(), body('password').isLength({ min: 8 })],
  async (req, res) => {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const email = req.body.email;
    try {
      const userData = await User.findOne({ email });

      if (!userData) {
        return res
          .status(400)
          .json({ errors: 'Try logging with correct credentials' });
      }

      const pwdcompare = await bcrypt.compare(
        req.body.password,
        userData.password
      );
      if (!pwdcompare) {
        return res
          .status(400)
          .json({ errors: 'Try logging with correct credentials' });
      }

      const data = {
        user: {
          id: userData.id,
        },
      };

      const authToken = jwt.sign(data, jwtsecret);
      return res.json({ success: true, authToken: authToken });
    } catch (error) {
      console.log(error);
      res.json({ success: false });
    }
  }
);

// Verify Email
router.get('/verify-email/:token', async (req, res) => {
  try {
    // Find the token in the database
    const tokenData = await Token.findOne({ token: req.params.token });

    if (!tokenData) {
      return res.status(400).json({ errors: 'Invalid or expired token' });
    }

    // Find the corresponding user in the database
    const user = await User.findById(tokenData.userId);

    if (!user) {
      return res.status(400).json({ errors: 'User not found' });
    }

    // Update the user's email verification status
    user.isVerified = true;
    await user.save();

    // Delete the token from the database
    await Token.findOneAndRemove({ token: req.params.token });

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: 'Server error' });
  }
});

async function sendVerificationEmail(user, host, isResend = false) {
    try {
      // Generate verification token
      const token = crypto.randomBytes(20).toString('hex');
  
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
      const verificationLink = `${host}/verify-email/${token}`;
  
      // Email content
      let emailContent = {
        to: user.email,
        subject: 'Email Verification',
        text: `Please click on the following link to verify your email: ${verificationLink}`,
        html: `<p>Please click <a href="${verificationLink}" style="color: blue;">here</a> to verify your email.</p>`,
      };
  
  
      // Send the verification email
      await sendEmail(emailContent);
  
      console.log('Verification email sent successfully');
    } catch (error) {
      console.error('Error sending verification email:', error);
    }
  }
  
module.exports = router;
