const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/expenses
// @desc    Get all user expenses
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('📋 Fetching expenses for user:', req.user.email);
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Return expenses sorted by date (newest first)
    const expenses = user.expenses
      .map(expense => ({
        _id: expense._id.toString(),
        category: expense.category,
        amount: expense.amount,
        description: expense.description,
        date: expense.date
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    console.log('✅ Found', expenses.length, 'expenses');
    
    res.json({
      success: true,
      expenses: expenses
    });

  } catch (error) {
    console.error('❌ Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expenses',
      error: error.message
    });
  }
});

// @route   POST /api/expenses
// @desc    Add new expense
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('💰 Adding expense:', req.body);
    
    const { category, amount, description, date } = req.body;

    // Validation
    if (!category || !amount || !description) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide category, amount, and description'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const newExpense = {
      category: category.toLowerCase(),
      amount: Number(amount),
      description: description.trim(),
      date: date ? new Date(date) : new Date()
    };

    console.log('💾 Saving expense:', newExpense);
    
    user.expenses.push(newExpense);
    await user.save();

    console.log('✅ Expense saved successfully');

    res.status(201).json({
      success: true,
      message: 'Expense added successfully!',
      expense: user.expenses[user.expenses.length - 1]
    });

  } catch (error) {
    console.error('❌ Add expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding expense',
      error: error.message
    });
  }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete expense (FIXED IMPLEMENTATION)
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('🗑️ Delete request for expense ID:', req.params.id);
    console.log('👤 User ID from token:', req.user._id);
    
    const expenseId = req.params.id;
    
    // Validate expense ID format
    if (!expenseId || expenseId === 'undefined') {
      console.log('❌ Invalid expense ID provided');
      return res.status(400).json({
        success: false,
        message: 'Invalid expense ID provided'
      });
    }
    
    // Find the user
    const user = await User.findById(req.user._id);
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if expense exists before deletion
    const expenseExists = user.expenses.find(expense => expense._id.toString() === expenseId);
    if (!expenseExists) {
      console.log('❌ Expense not found in user expenses');
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }
    
    // Remove the expense from user's expenses array
    const initialLength = user.expenses.length;
    user.expenses = user.expenses.filter(expense => expense._id.toString() !== expenseId);
    
    // Verify expense was actually removed
    if (user.expenses.length === initialLength) {
      console.log('❌ Failed to remove expense from array');
      return res.status(500).json({
        success: false,
        message: 'Failed to delete expense'
      });
    }
    
    // Save the updated user
    await user.save();
    console.log('✅ Expense deleted successfully');
    
    res.json({
      success: true,
      message: 'Expense deleted successfully!'
    });

  } catch (error) {
    console.error('❌ Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting expense',
      error: error.message
    });
  }
});

// @route   PUT /api/expenses/:id
// @desc    Update expense
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('📝 Update request for expense ID:', req.params.id);
    
    const { category, amount, description, date } = req.body;
    const expenseId = req.params.id;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const expenseIndex = user.expenses.findIndex(
      expense => expense._id.toString() === expenseId
    );
    
    if (expenseIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Update expense fields
    if (category) user.expenses[expenseIndex].category = category.toLowerCase();
    if (amount) user.expenses[expenseIndex].amount = Number(amount);
    if (description) user.expenses[expenseIndex].description = description.trim();
    if (date) user.expenses[expenseIndex].date = new Date(date);
    
    await user.save();
    console.log('✅ Expense updated successfully');

    res.json({
      success: true,
      message: 'Expense updated successfully!',
      expense: user.expenses[expenseIndex]
    });

  } catch (error) {
    console.error('❌ Update expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating expense',
      error: error.message
    });
  }
});

module.exports = router;
