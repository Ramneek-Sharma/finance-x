import { useState } from 'react';

const API_BASE_URL = 'http://localhost:5001'; // Updated to port 5001

const BudgetOverview = ({ user, expenses, onUpdateIncome }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newIncome, setNewIncome] = useState(user?.profile?.monthlyIncome || 0);
  const [loading, setLoading] = useState(false);

  const handleUpdateIncome = async () => {
    if (!newIncome || newIncome < 0) {
      alert('Please enter a valid income amount');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/update-income`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ monthlyIncome: newIncome })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onUpdateIncome(newIncome);
        setIsEditing(false);
        alert('✅ Income updated successfully!');
      } else {
        alert(data.message || 'Failed to update income');
      }
    } catch (error) {
      console.error('Error updating income:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBudget = (user?.profile?.monthlyIncome || 0) - totalExpenses;
  const budgetUsedPercentage = user?.profile?.monthlyIncome 
    ? Math.min((totalExpenses / user.profile.monthlyIncome) * 100, 100)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Budget Overview</h2>
      
      {/* Profile Info */}
      <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Name:</span>
          <span className="font-medium text-gray-900">{user?.profile?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">City:</span>
          <span className="font-medium text-gray-900">{user?.profile?.city}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Status:</span>
          <span className="font-medium text-gray-900 capitalize">{user?.profile?.status}</span>
        </div>
      </div>

      {/* Monthly Income with Edit */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Monthly Income:</span>
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={newIncome}
                onChange={(e) => setNewIncome(Number(e.target.value))}
                className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
              <button
                onClick={handleUpdateIncome}
                disabled={loading}
                className="text-green-600 hover:text-green-800 disabled:opacity-50"
                title="Save"
              >
                {loading ? '⏳' : '✓'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setNewIncome(user?.profile?.monthlyIncome || 0);
                }}
                className="text-red-600 hover:text-red-800"
                title="Cancel"
              >
                ✗
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-lg text-gray-900">
                ₹{user?.profile?.monthlyIncome?.toLocaleString()}
              </span>
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-800 p-1"
                title="Edit Income"
              >
                ✏️
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Expenses:</span>
          <span className="font-semibold text-red-600">₹{totalExpenses.toLocaleString()}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Remaining Budget:</span>
          <span className={`font-semibold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{remainingBudget.toLocaleString()}
          </span>
        </div>

        {/* Budget Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-600">Budget Usage</span>
            <span className="text-xs text-gray-600">{budgetUsedPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                budgetUsedPercentage <= 75 
                  ? 'bg-green-500' 
                  : budgetUsedPercentage <= 90 
                  ? 'bg-yellow-500' 
                  : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(budgetUsedPercentage, 100)}%` }}
            />
          </div>
          {budgetUsedPercentage > 100 && (
            <p className="text-xs text-red-600 mt-1">⚠️ You've exceeded your budget!</p>
          )}
        </div>

        {/* Savings Goal */}
        {user?.profile?.savingsGoal > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Savings Goal:</span>
              <span className="font-medium text-blue-600">
                ₹{user.profile.savingsGoal.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetOverview;
