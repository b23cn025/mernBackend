const express = require('express');
const Progress = require('../models/Progress');
const { protect: authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// @route GET /api/progress
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { limit = 30 } = req.query;
    const progress = await Progress.find({ userId: req.user._id })
      .sort({ completedAt: -1 })
      .limit(parseInt(limit))
      .populate('workoutId', 'title');
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/progress/stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const allProgress = await Progress.find({ userId: req.user._id });
    const totalWorkouts = allProgress.length;
    const totalCalories = allProgress.reduce((sum, p) => sum + p.caloriesBurned, 0);
    const totalCoins = allProgress.reduce((sum, p) => sum + p.coinsEarned, 0);

    // Weekly data (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weekly = await Progress.find({ userId: req.user._id, completedAt: { $gte: sevenDaysAgo } });

    res.json({ totalWorkouts, totalCalories, totalCoins, weeklyCount: weekly.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
