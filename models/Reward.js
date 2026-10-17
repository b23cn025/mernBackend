const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  coins: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastWorkoutDate: { type: Date, default: null },
  totalWorkouts: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Reward', rewardSchema);
