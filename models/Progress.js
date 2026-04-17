const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workout' },
  workoutTitle: { type: String, default: '' },
  caloriesBurned: { type: Number, default: 0 },
  duration: { type: Number, default: 0 }, // minutes
  coinsEarned: { type: Number, default: 0 },
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);
