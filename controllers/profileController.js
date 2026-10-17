const User = require('../models/User');
const cloudinary = require('../utils/cloudinary'); // optional, swap for local if needed

// @desc  GET logged-in user profile
// @route GET /api/users/profile
// @access Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  UPDATE profile (name, username, bio, height, weight, dob)
// @route PATCH /api/users/profile
// @access Private
const updateProfile = async (req, res) => {
  try {
    const { name, username, bio, height, weight, dob } = req.body;

    // Check username uniqueness if changed
    if (username) {
      const taken = await User.findOne({ username, _id: { $ne: req.user._id } });
      if (taken) return res.status(400).json({ message: 'Username already taken' });
    }

    const updateFields = {};
    if (name)     updateFields.name     = name;
    if (username) updateFields.username = username;
    if (bio !== undefined) updateFields.bio = bio;
    if (height)   updateFields.height   = Number(height);
    if (weight)   updateFields.weight   = Number(weight);
    if (dob)      updateFields.dob      = dob;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Upload/update avatar image
// @route POST /api/users/avatar
// @access Private
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // ── Option A: Cloudinary ──────────────────────────────────
    // const result = await cloudinary.uploader.upload(req.file.path, {
    //   folder: 'fitness-app/avatars',
    //   width: 300,
    //   crop: 'fill',
    // });
    // const avatarUrl = result.secure_url;

    // ── Option B: Local storage (comment A, uncomment this) ───
    const avatarUrl = `http://localhost:5000/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { avatar: avatarUrl } },
      { new: true }
    ).select('-password');

    res.json({ message: 'Avatar updated', avatarUrl, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getProfile, updateProfile, uploadAvatar };
