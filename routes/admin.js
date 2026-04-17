const express = require('express');
const User = require('../models/User');
const Exercise = require('../models/Exercise');
const Workout = require('../models/Workout');
const Progress = require('../models/Progress');
const { protect } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { isValidYoutubeUrl, getEmbedUrl } = require('../utils/videoService');

const router = express.Router();

// All admin routes require auth + admin role
router.use(protect, adminMiddleware);

// @route GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const premiumUsers = await User.countDocuments({ 'subscription.plan': 'premium' });
    const totalExercises = await Exercise.countDocuments();
    const totalWorkouts = await Workout.countDocuments();
    const totalProgress = await Progress.countDocuments();
    res.json({ totalUsers, premiumUsers, totalExercises, totalWorkouts, totalProgress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ────────────────────────────────────────────────────
// Exercise Management with Video URL Conversion
// ────────────────────────────────────────────────────

// @route POST /api/admin/exercises
// Create new exercise with YouTube video URL
router.post('/exercises', async (req, res) => {
  try {
    const { name, targetMuscle, difficulty, equipment, instructions, youtubeUrl, caloriesPerMin } = req.body;
    
    if (!name || !targetMuscle || !difficulty) {
      return res.status(400).json({ message: 'Name, targetMuscle, and difficulty are required.' });
    }

    // Validate and convert YouTube URL
    let embedUrl = null;
    if (youtubeUrl) {
      if (!isValidYoutubeUrl(youtubeUrl)) {
        return res.status(400).json({ message: 'Invalid YouTube URL format.' });
      }
      embedUrl = getEmbedUrl(youtubeUrl);
    }

    const exercise = await Exercise.create({
      name,
      targetMuscle,
      difficulty,
      equipment: equipment || 'No equipment',
      instructions: {
        en: instructions?.en || instructions || '',
        te: instructions?.te || ''
      },
      youtubeUrl: embedUrl || youtubeUrl || '',
      caloriesPerMin: caloriesPerMin || 5
    });

    res.status(201).json(exercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/admin/exercises
// Get all exercises
router.get('/exercises', async (req, res) => {
  try {
    const exercises = await Exercise.find().sort({ createdAt: -1 });
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/admin/exercises/:id
// Update exercise with video URL conversion
router.put('/exercises/:id', async (req, res) => {
  try {
    const { name, targetMuscle, difficulty, equipment, instructions, youtubeUrl, caloriesPerMin } = req.body;

    // Validate and convert YouTube URL if provided
    let embedUrl = null;
    if (youtubeUrl) {
      if (!isValidYoutubeUrl(youtubeUrl)) {
        return res.status(400).json({ message: 'Invalid YouTube URL format.' });
      }
      embedUrl = getEmbedUrl(youtubeUrl);
    }

    const updated = await Exercise.findByIdAndUpdate(
      req.params.id,
      {
        name,
        targetMuscle,
        difficulty,
        equipment,
        instructions: {
          en: instructions?.en || instructions || '',
          te: instructions?.te || ''
        },
        youtubeUrl: embedUrl || youtubeUrl,
        caloriesPerMin
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Exercise not found.' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route DELETE /api/admin/exercises/:id
router.delete('/exercises/:id', async (req, res) => {
  try {
    await Exercise.findByIdAndDelete(req.params.id);
    res.json({ message: 'Exercise deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
