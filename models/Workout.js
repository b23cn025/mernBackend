const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  title: { type: String, required: true },
  goal: {
    type: String,
    enum: ['Fat Loss', 'Muscle Gain', 'General Fitness'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  exercises: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' }],
  estimatedTime: { type: Number, default: 30 }, // minutes
  caloriesBurned: { type: Number, default: 200 },
  coinsReward: { type: Number, default: 50 },
  description: { type: String, default: '' },
  isPremium: { type: Boolean, default: false },
  youtubeVideoId: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Workout', workoutSchema);
