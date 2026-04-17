const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema({
  parentUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  age: { type: Number, default: null },
  fitnessGoal: {
    type: String,
    enum: ['Fat Loss', 'Muscle Gain', 'General Fitness'],
    default: 'General Fitness'
  },
  workoutsCompleted: { type: Number, default: 0 },
  caloriesBurned: { type: Number, default: 0 },
  coinsEarned: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('FamilyMember', familyMemberSchema);
