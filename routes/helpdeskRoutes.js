const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  submitTicket,
  getMyTickets,
  getAllTickets,   // admin only
  updateTicket,   // admin only
} = require('../controllers/helpdeskController');
const { adminOnly } = require('../middleware/authMiddleware');

router.post('/tickets',         protect, submitTicket);
router.get('/tickets/mine',     protect, getMyTickets);
router.get('/tickets',          protect, adminOnly, getAllTickets);
router.patch('/tickets/:id',    protect, adminOnly, updateTicket);

module.exports = router;
