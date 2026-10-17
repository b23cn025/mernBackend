const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getSettings,
  updateSettings,
} = require('../controllers/settingsController');

router.get('/', protect, getSettings);
router.patch('/', protect, updateSettings);

module.exports = router;
