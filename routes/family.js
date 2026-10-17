const express = require('express');
const FamilyMember = require('../models/FamilyMember');
const User = require('../models/User');
const { protect: authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// @route GET /api/family
router.get('/', authMiddleware, async (req, res) => {
  try {
    const members = await FamilyMember.find({ parentUserId: req.user._id });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/family/add
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { name, age, fitnessGoal } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required.' });

    const member = await FamilyMember.create({ parentUserId: req.user._id, name, age, fitnessGoal });
    await User.findByIdAndUpdate(req.user._id, { $push: { familyMembers: member._id } });
    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route DELETE /api/family/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const member = await FamilyMember.findOneAndDelete({ _id: req.params.id, parentUserId: req.user._id });
    if (!member) return res.status(404).json({ message: 'Family member not found.' });
    await User.findByIdAndUpdate(req.user._id, { $pull: { familyMembers: req.params.id } });
    res.json({ message: 'Family member removed.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
