// frontend/src/components/ExpenseManagement.jsx - CREATE THIS FILE
import { useState } from 'react';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';

const ExpenseManagement = ({ expenses, onExpenseAdded }) => {
  const [view, setView] = useState('add'); // 'add' or 'list'

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">💰 Expense Management</h2>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setView('add')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                view === 'add'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ➕ Add Expense
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                view === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📋 View All
            </button>
          </div>
        </div>

        {view === 'add' && (
          <ExpenseForm onAddExpense={onExpenseAdded} />
        )}

        {view === 'list' && (
          <div>
            <div className="mb-4 text-sm text-gray-600">
              Total Expenses: {expenses.length} | 
              This Month: ₹{expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
            </div>
            <ExpenseList expenses={expenses} onRefresh={onExpenseAdded} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseManagement;
