const express = require('express');
const Muscle = require('../models/Muscle');
const { protect: authMiddleware } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// @route GET /api/muscles
router.get('/', authMiddleware, async (req, res) => {
  try {
    const muscles = await Muscle.find().populate('exercises');
    res.json(muscles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/muscles — Admin only
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const muscle = await Muscle.create(req.body);
    res.status(201).json(muscle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route DELETE /api/muscles/:id — Admin only
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Muscle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Muscle group deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
