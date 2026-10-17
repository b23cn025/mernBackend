const mongoose = require('mongoose');

const muscleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  exercises: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' }]
}, { timestamps: true });

module.exports = mongoose.model('Muscle', muscleSchema);
