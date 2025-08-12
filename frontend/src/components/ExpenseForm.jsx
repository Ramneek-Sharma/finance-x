// frontend/src/components/ExpenseForm.jsx - COMPLETE UPDATED VERSION
import { useState } from 'react';

const ExpenseForm = ({ onAddExpense, isCompact = false }) => {
  const [formData, setFormData] = useState({
    category: 'food',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'food', label: '🍽️ Food' },
    { value: 'transport', label: '🚗 Transport' },
    { value: 'shopping', label: '🛒 Shopping' },
    { value: 'entertainment', label: '🎬 Entertainment' },
    { value: 'bills', label: '📄 Bills' },
    { value: 'healthcare', label: '🏥 Healthcare' },
    { value: 'education', label: '📚 Education' },
    { value: 'others', label: '📦 Others' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (Number(formData.amount) <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }

    setLoading(true);
    
    try {
      console.log('💰 Submitting expense:', formData);
      
      // Call the parent function to add expense
      await onAddExpense({
        category: formData.category,
        amount: Number(formData.amount),
        description: formData.description.trim(),
        date: formData.date
      });

      // Reset form after successful addition
      setFormData({
        category: 'food',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });

      console.log('✅ Form reset after successful expense addition');

    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className={`bg-white rounded-lg shadow-md ${isCompact ? 'p-4' : 'p-6'}`}>
      {!isCompact && (
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Expense</h2>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className={`grid gap-4 ${isCompact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹) *
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              disabled={loading}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              placeholder="100"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            placeholder={isCompact ? "Description..." : "What did you spend on?"}
          />
        </div>

        {/* Date - Hidden in compact mode */}
        {!isCompact && (
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            />
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100 ${
            isCompact ? 'w-full py-2 px-3 text-sm' : 'w-full py-2 px-4'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isCompact ? 'Adding...' : 'Adding Expense...'}
            </span>
          ) : (
            isCompact ? 'Add' : 'Add Expense'
          )}
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;
