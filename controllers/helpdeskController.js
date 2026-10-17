const Ticket = require('../models/Ticket');

// @desc  Submit a new support ticket
// @route POST /api/helpdesk/tickets
// @access Private
const submitTicket = async (req, res) => {
  try {
    const { category, subject, message } = req.body;
    if (!category || !subject || !message) {
      return res.status(400).json({ message: 'category, subject, and message are required' });
    }

    const ticket = await Ticket.create({
      user:     req.user._id,
      email:    req.user.email,
      category,
      subject,
      message,
      status:   'open',
    });

    res.status(201).json({ message: 'Ticket submitted', ticket });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get tickets submitted by the logged-in user
// @route GET /api/helpdesk/tickets/mine
// @access Private
const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get ALL tickets (admin)
// @route GET /api/helpdesk/tickets
// @access Admin
const getAllTickets = async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status)   filter.status   = status;
    if (category) filter.category = category;

    const tickets = await Ticket.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Update ticket status / add admin reply
// @route PATCH /api/helpdesk/tickets/:id
// @access Admin
const updateTicket = async (req, res) => {
  try {
    const { status, reply } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { $set: { status, adminReply: reply, repliedAt: Date.now() } },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json({ message: 'Ticket updated', ticket });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { submitTicket, getMyTickets, getAllTickets, updateTicket };
