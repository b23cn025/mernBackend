const User = require('../models/User');

// @desc  GET current user settings
// @route GET /api/users/settings
// @access Private
const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('settings');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.settings || {});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  UPDATE user settings (notifications, goals, privacy, units)
// @route PATCH /api/users/settings
// @access Private
const updateSettings = async (req, res) => {
  try {
    const { notifs, goals, privacy, units } = req.body;

    const updateFields = {};
    if (notifs)  updateFields['settings.notifs']  = notifs;
    if (goals)   updateFields['settings.goals']   = goals;
    if (privacy) updateFields['settings.privacy'] = privacy;
    if (units)   updateFields['settings.units']   = units;

    // Sync top-level fitnessGoal if goal changed
    if (goals?.primaryGoal) updateFields['fitnessGoal'] = goals.primaryGoal;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Settings updated', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getSettings, updateSettings };
