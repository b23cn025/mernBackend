const express = require('express');
const Reward = require('../models/Reward');
const { protect: authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// @route GET /api/rewards
router.get('/', authMiddleware, async (req, res) => {
  try {
    let reward = await Reward.findOne({ userId: req.user._id });
    if (!reward) reward = await Reward.create({ userId: req.user._id });
    res.json(reward);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
