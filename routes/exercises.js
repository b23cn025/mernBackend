const express = require('express');
const Exercise = require('../models/Exercise');
const { protect: authMiddleware } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// @route GET /api/exercises
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { muscle, difficulty, search } = req.query;
    let query = {};
    if (muscle) query.targetMuscle = { $regex: muscle, $options: 'i' };
    if (difficulty) query.difficulty = difficulty;
    if (search) query.name = { $regex: search, $options: 'i' };
    const exercises = await Exercise.find(query).sort({ createdAt: -1 });
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/exercises/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ message: 'Exercise not found.' });
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/exercises — Admin only
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const exercise = await Exercise.create(req.body);
    res.status(201).json(exercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/exercises/:id — Admin only
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!exercise) return res.status(404).json({ message: 'Exercise not found.' });
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route DELETE /api/exercises/:id — Admin only
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Exercise.findByIdAndDelete(req.params.id);
    res.json({ message: 'Exercise deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
