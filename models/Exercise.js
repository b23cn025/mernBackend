const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  targetMuscle: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  equipment: { type: String, default: 'No equipment' },
  instructions: {
    en: { type: String, required: true },
    te: { type: String, default: '' }
  },
  youtubeUrl: { type: String, default: '' },
  audioUrl: { type: String, default: '' },
  caloriesPerMin: { type: Number, default: 5 },
  imageUrl: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Exercise', exerciseSchema);
