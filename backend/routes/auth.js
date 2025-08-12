const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Sign Up
router.post('/signup', async (req, res) => {
  try {
    console.log('📝 Signup request received:', req.body);
    
    const { email, password, profile } = req.body;

    // Validation logging
    if (!email || !password || !profile) {
      console.log('❌ Missing required fields:', { email: !!email, password: !!password, profile: !!profile });
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and profile information'
      });
    }

    console.log('✅ Basic validation passed');

    // Check if user exists
    console.log('🔍 Checking for existing user with email:', email);
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    console.log('✅ No existing user found, creating new user');

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      profile: {
        name: profile.name.trim(),
        city: profile.city.trim(),
        status: profile.status,
        monthlyIncome: Number(profile.monthlyIncome),
        fixedExpenses: Number(profile.fixedExpenses) || 0,
        savingsGoal: Number(profile.savingsGoal) || 0
      }
    });

    console.log('💾 Attempting to save user to database');
    await user.save();
    console.log('✅ User saved successfully');

    // Generate JWT
    console.log('🔐 Generating JWT token');
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log('✅ Signup successful for user:', user.email);

    res.status(201).json({
      success: true,
      message: 'User created successfully!',
      token,
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile
      }
    });

  } catch (error) {
    console.error('❌ Signup error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Handle specific errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during account creation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
   
  }
});

// Sign In
// Sign In route
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,  // Make sure this is present
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile
      }
    });

  } catch (error) {
    console.error('❌ Signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});


// Update monthly income
router.put('/update-income', authMiddleware, async (req, res) => {
  try {
    const { monthlyIncome } = req.body;
    
    const user = await User.findById(req.user._id);
    user.profile.monthlyIncome = monthlyIncome;
    await user.save();

    res.json({
      message: 'Income updated successfully',
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Get Profile
router.get('/profile', authMiddleware, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      profile: req.user.profile
    }
  });
});

module.exports = router;