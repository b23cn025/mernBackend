const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  getProfile,
  updateProfile,
  uploadAvatar,
} = require('../controllers/profileController');

router.get('/',         protect, getProfile);
router.patch('/',       protect, updateProfile);
router.post('/avatar',  protect, upload.single('avatar'), uploadAvatar);

module.exports = router;
