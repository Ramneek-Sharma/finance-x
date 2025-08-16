// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const expenseSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: [
      'food',
      'transport',
      'transportation', // allow legacy
      'shopping',
      'entertainment',
      'bills',
      'healthcare',
      'education',
      'others'
    ]
  },
  amount: { type: Number, required: true, min: 0 },
  description: { type: String, required: true, trim: true },
  date: { type: Date, default: Date.now }
}, { _id: true, timestamps: false });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile: {
    name: { type: String, required: true },
    city: { type: String, required: true },
    status: {
      type: String,
      enum: ['student', 'working', 'unemployed', 'freelancer'],
      required: true
    },
    monthlyIncome: { type: Number, required: true },
    fixedExpenses: { type: Number, default: 0 },
    savingsGoal: { type: Number, default: 0 }
  },
  expenses: [expenseSchema]
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
