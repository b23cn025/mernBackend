const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Reward = require('../models/Reward');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, age, height, weight, fitnessGoal } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email, password: hashedPassword,
      age, height, weight,
      fitnessGoal: fitnessGoal || 'General Fitness'
    });

    // Create reward record for new user
    await Reward.create({ userId: user._id });

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        _id: user._id, name: user.name, email: user.email,
        role: user.role, fitnessGoal: user.fitnessGoal,
        coins: user.coins, subscription: user.subscription, language: user.language
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required.' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });

    // Generate JWT token directly (no 2FA)
    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        fitnessGoal: user.fitnessGoal,
        coins: user.coins,
        subscription: user.subscription,
        language: user.language
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// @route GET /api/auth/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('familyMembers');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, age, height, weight, fitnessGoal, language } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, age, height, weight, fitnessGoal, language },
      { new: true }
    ).select('-password');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route DELETE /api/auth/account
router.delete('/account', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Delete user account and all associated data
    await User.findByIdAndDelete(userId);
    
    res.json({ success: true, message: 'Account deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
