// frontend/src/components/ExpenseList.jsx - COMPLETE UPDATED VERSION
import { useState } from 'react';

const API_BASE_URL = 'http://localhost:5001';

const ExpenseList = ({ expenses, onRefresh, isCompact = false }) => {
  const [deleteLoading, setDeleteLoading] = useState(null);

  const categoryEmojis = {
    food: '🍽️',
    transport: '🚗',
    shopping: '🛒',
    entertainment: '🎬',
    bills: '📄',
    healthcare: '🏥',
    education: '📚',
    others: '📦'
  };

  // Debug: Log expense data to check ID structure
  console.log('🔍 Expense data received:', expenses?.map(e => ({ 
    id: e._id, 
    idType: typeof e._id,
    description: e.description?.substring(0, 20) 
  })));

  const handleDeleteExpense = async (expenseId) => {
    console.log('🗑️ Attempting to delete expense with ID:', expenseId);
    console.log('🔍 ID type:', typeof expenseId);
    
    // Validate expense ID before proceeding
    if (!expenseId || expenseId === 'undefined') {
      console.error('❌ Invalid expense ID:', expenseId);
      alert('Error: Cannot delete expense - invalid ID');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    setDeleteLoading(expenseId);
    try {
      const token = localStorage.getItem('token');
      const deleteUrl = `${API_BASE_URL}/api/expenses/${expenseId}`;
      
      console.log('🔗 Delete URL:', deleteUrl);

      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('📨 Delete response:', data);

      if (response.ok && data.success) {
        // Success notification - different for compact mode
        if (isCompact) {
          console.log('✅ Expense deleted successfully!');
        } else {
          alert('✅ Expense deleted successfully!');
        }
        await onRefresh();
      } else {
        console.error('❌ Delete failed:', data);
        alert(`❌ ${data.message || 'Failed to delete expense'}`);
      }
    } catch (error) {
      console.error('❌ Error deleting expense:', error);
      alert('❌ Network error. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isCompact) {
      // Shorter date format for compact mode
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short'
      });
    }
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  console.log('📋 ExpenseList rendering with', expenses?.length || 0, 'expenses');

  if (!expenses || expenses.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-md ${isCompact ? 'p-4' : 'p-6'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`font-semibold text-gray-900 ${isCompact ? 'text-lg' : 'text-xl'}`}>
            Recent Expenses
          </h2>
          <button
            onClick={onRefresh}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
          >
            🔄 Refresh
          </button>
        </div>
        <div className={`text-center ${isCompact ? 'py-4' : 'py-8'}`}>
          <div className={`mb-4 ${isCompact ? 'text-4xl' : 'text-6xl'}`}>💸</div>
          <p className={`text-gray-500 font-medium ${isCompact ? 'text-sm' : 'text-lg'}`}>
            No expenses recorded yet
          </p>
          {!isCompact && (
            <p className="text-sm text-gray-400 mt-2">
              Add your first expense using the form above!
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${isCompact ? 'p-4' : 'p-6'}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`font-semibold text-gray-900 ${isCompact ? 'text-lg' : 'text-xl'}`}>
          Recent Expenses
        </h2>
        <div className="flex items-center space-x-4">
          <span className={`text-gray-500 ${isCompact ? 'text-xs' : 'text-sm'}`}>
            {expenses.length} expenses
          </span>
          <button
            onClick={onRefresh}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className={`space-y-3 overflow-y-auto ${isCompact ? 'max-h-64' : 'max-h-96'}`}>
        {expenses.map((expense) => {
          // Debug: Log each expense ID
          console.log('💳 Rendering expense:', { 
            id: expense._id, 
            description: expense.description 
          });
          
          return (
            <div
              key={expense._id || Math.random()} // Fallback key if ID missing
              className={`flex items-center justify-between border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 ${
                isCompact ? 'p-3' : 'p-4'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={isCompact ? 'text-lg' : 'text-2xl'}>
                  {categoryEmojis[expense.category] || '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-gray-900 capitalize truncate ${
                    isCompact ? 'text-sm' : 'text-base'
                  }`}>
                    {expense.category}
                  </div>
                  <div className={`text-gray-600 truncate ${
                    isCompact ? 'text-xs' : 'text-sm'
                  }`}>
                    {expense.description}
                  </div>
                  <div className={`text-gray-400 ${
                    isCompact ? 'text-xs' : 'text-xs'
                  }`}>
                    {formatDate(expense.date)}
                  </div>
                  {/* Debug: Show ID in development - only in non-compact mode */}
                  {import.meta.env.DEV && !isCompact && (
                    <div className="text-xs text-red-400 font-mono">
                      ID: {expense._id || 'MISSING'}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className={`font-semibold text-red-600 ${
                    isCompact ? 'text-sm' : 'text-base'
                  }`}>
                    ₹{expense.amount?.toLocaleString()}
                  </div>
                </div>
                
                <button
                  onClick={() => handleDeleteExpense(expense._id)}
                  disabled={deleteLoading === expense._id || !expense._id}
                  className={`rounded transition-all duration-200 ${
                    isCompact ? 'p-1' : 'p-2'
                  } ${
                    deleteLoading === expense._id || !expense._id
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'text-red-500 hover:text-red-700 hover:bg-red-50 active:bg-red-100'
                  }`}
                  title={expense._id ? "Delete expense" : "Cannot delete - missing ID"}
                >
                  {deleteLoading === expense._id ? (
                    <div className={`animate-spin border-2 border-gray-400 border-t-transparent rounded-full ${
                      isCompact ? 'h-3 w-3' : 'h-4 w-4'
                    }`}></div>
                  ) : (
                    <svg className={isCompact ? 'w-3 h-3' : 'w-4 h-4'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show totals in compact mode */}
      {isCompact && expenses.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Total Spent:</span>
            <span className="font-semibold text-red-600">
              ₹{expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Load more button - different for compact mode */}
      {expenses.length > (isCompact ? 3 : 5) && (
        <div className="mt-4 text-center">
          <button
            onClick={onRefresh}
            className={`text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 ${
              isCompact ? 'text-xs' : 'text-sm'
            }`}
          >
            🔄 {isCompact ? 'Refresh' : 'Load More / Refresh'}
          </button>
        </div>
      )}

      {/* Quick stats for non-compact mode */}
      {!isCompact && expenses.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">
                ₹{expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Total Spent</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                ₹{Math.round(expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0) / expenses.length).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Avg per Expense</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {Object.keys(expenses.reduce((cats, exp) => ({ ...cats, [exp.category]: true }), {})).length}
              </div>
              <div className="text-xs text-gray-500">Categories</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">
                {expenses.filter(exp => new Date(exp.date) >= new Date(Date.now() - 7*24*60*60*1000)).length}
              </div>
              <div className="text-xs text-gray-500">This Week</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
