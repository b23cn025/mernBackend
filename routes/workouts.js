const express = require('express');
const Workout = require('../models/Workout');
const Progress = require('../models/Progress');
const Reward = require('../models/Reward');
const User = require('../models/User');
const { protect: authMiddleware } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// @route GET /api/workouts
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { goal, difficulty } = req.query;
    let query = {};
    if (goal) query.goal = goal;
    if (difficulty) query.difficulty = difficulty;

    // Free users only see non-premium workouts
    if (req.user.subscription.plan === 'free') {
      query.isPremium = false;
    }

    const workouts = await Workout.find(query).populate('exercises');
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/workouts/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id).populate('exercises');
    if (!workout) return res.status(404).json({ message: 'Workout not found.' });
    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/workouts/complete
router.post('/complete', authMiddleware, async (req, res) => {
  try {
    const { workoutId, duration } = req.body;
    const workout = await Workout.findById(workoutId);
    if (!workout) return res.status(404).json({ message: 'Workout not found.' });

    const coinsEarned = workout.coinsReward || 50;
    const caloriesBurned = workout.caloriesBurned || 200;

    // Log progress
    await Progress.create({
      userId: req.user._id,
      workoutId,
      workoutTitle: workout.title,
      caloriesBurned,
      duration: duration || workout.estimatedTime,
      coinsEarned
    });

    // Update user coins
    await User.findByIdAndUpdate(req.user._id, { $inc: { coins: coinsEarned } });

    // Update reward record
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let reward = await Reward.findOne({ userId: req.user._id });
    if (!reward) reward = await Reward.create({ userId: req.user._id });

    const lastDate = reward.lastWorkoutDate ? new Date(reward.lastWorkoutDate) : null;
    let newStreak = reward.streak;

    if (lastDate) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastDate >= yesterday) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    await Reward.findOneAndUpdate(
      { userId: req.user._id },
      { $inc: { coins: coinsEarned, totalWorkouts: 1 }, streak: newStreak, lastWorkoutDate: new Date() }
    );

    const updatedUser = await User.findById(req.user._id).select('-password');
    res.json({ message: 'Workout completed!', coinsEarned, caloriesBurned, streak: newStreak, user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/workouts — Admin only
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const workout = await Workout.create(req.body);
    res.status(201).json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/workouts/:id — Admin only
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const workout = await Workout.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route DELETE /api/workouts/:id — Admin only
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Workout.findByIdAndDelete(req.params.id);
    res.json({ message: 'Workout deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
