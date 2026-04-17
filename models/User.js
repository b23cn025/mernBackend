const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  age:      { type: Number, default: null },
  height:   { type: Number, default: null },   // cm
  weight:   { type: Number, default: null },   // kg

  // ── New profile fields ──────────────────────────────────────
  username: { type: String, unique: true, sparse: true, trim: true },
  bio:      { type: String, default: '' },
  avatar:   { type: String, default: '' },
  dob:      { type: String, default: null },   // 'YYYY-MM-DD'
  totalWorkouts: { type: Number, default: 0 },
  totalCalories: { type: Number, default: 0 },
  // ───────────────────────────────────────────────────────────

  fitnessGoal: {
    type: String,
    enum: ['Fat Loss', 'Muscle Gain', 'General Fitness'],
    default: 'General Fitness'
  },
  role:  { type: String, enum: ['user', 'admin'], default: 'user' },
  coins: { type: Number, default: 0 },

  subscription: {
    plan:       { type: String, enum: ['free', 'premium', 'daily'], default: 'free' },
    status:     { type: String, enum: ['active', 'inactive'], default: 'active' },
    expiryDate: { type: Date, default: null }
  },

  language: { type: String, enum: ['en', 'te'], default: 'en' },
  familyMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember' }],

  // ── New settings object ─────────────────────────────────────
  settings: {
    notifs: {
      workoutReminder: { type: Boolean, default: true },
      streakAlert:     { type: Boolean, default: true },
      weeklyReport:    { type: Boolean, default: true },
      prAchievement:   { type: Boolean, default: true },
      restDay:         { type: Boolean, default: false },
      goalDeadline:    { type: Boolean, default: false },
    },
    goals: {
      primaryGoal:   { type: String, default: 'General Fitness' },
      daysPerWeek:   { type: Number, default: 4 },
      sessionLength: { type: Number, default: 60 },
      targetWeight:  { type: Number, default: null },
      targetDate:    { type: String, default: null },
      level:         { type: String, default: 'Intermediate' },
    },
    privacy: {
      publicProfile: { type: Boolean, default: false },
      shareActivity: { type: Boolean, default: true },
      showMetrics:   { type: Boolean, default: false },
      analytics:     { type: Boolean, default: true },
      twoFA:         { type: Boolean, default: false },
    },
    units: {
      weight:   { type: String, default: 'kg' },
      distance: { type: String, default: 'km' },
      language: { type: String, default: 'en' },
      theme:    { type: String, default: 'dark' },
    },
  },
  // ───────────────────────────────────────────────────────────



}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);