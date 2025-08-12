// import { useState, useEffect } from 'react';
// import { useAuth } from '../hooks/useAuth';
// import BudgetOverview from '../components/BudgetOverview';
// import ExpenseForm from '../components/ExpenseForm';
// import ExpenseList from '../components/ExpenseList';

// const API_BASE_URL = 'http://localhost:5001'; // Updated to port 5001

// const Dashboard = () => {
//   const { user, logout, refreshProfile } = useAuth();
//   const [expenses, setExpenses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     fetchExpenses();
//   }, []);

//   const fetchExpenses = async () => {
//   try {
//     setError('');
//     console.log('📋 Fetching expenses...');
    
//     const token = localStorage.getItem('token');
//     if (!token) {
//       setError('No authentication token found');
//       return;
//     }

//     const response = await fetch(`${API_BASE_URL}/api/expenses`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       }
//     });

//     console.log('📨 Fetch response status:', response.status);

//     const data = await response.json();
//     console.log('📨 Fetch response data:', data);

//     if (response.ok && data.success) {
//       setExpenses(data.expenses || []);
//       console.log('✅ Expenses fetched:', data.expenses?.length || 0);
//     } else {
//       console.error('❌ Fetch failed:', data);
//       setError(data.message || 'Failed to fetch expenses');
//     }
//   } catch (error) {
//     console.error('🔥 Network error fetching expenses:', error);
//     setError('Network error. Please check your connection.');
//   } finally {
//     setLoading(false);
//   }
// };

// const addExpense = async (expenseData) => {
//   try {
//     console.log('💰 Adding expense:', expenseData);
    
//     const token = localStorage.getItem('token');
//     if (!token) {
//       alert('Please login again');
//       return;
//     }

//     const response = await fetch(`${API_BASE_URL}/api/expenses`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       },
//       body: JSON.stringify(expenseData)
//     });

//     const data = await response.json();
//     console.log('📨 Add expense response:', data);

//     if (response.ok && data.success) {
//       console.log('✅ Expense added successfully, refreshing list...');
      
//       // Immediately refresh the expense list
//       await fetchExpenses();
      
//       // Show success message
//       alert('✅ Expense added successfully!');
      
//     } else {
//       console.error('❌ Add expense failed:', data);
//       alert(`❌ ${data.message || 'Failed to add expense'}`);
//       throw new Error(data.message || 'Failed to add expense');
//     }
//   } catch (error) {
//     console.error('🔥 Network error adding expense:', error);
//     alert('❌ Network error. Please try again.');
//     throw error; // Re-throw so ExpenseForm knows it failed
//   }
// };

// const handleUpdateIncome = async () => {
//   try {
//     // Refresh user profile to get updated income data
//     await refreshProfile();
    
//     // Refresh expenses to recalculate budget overview
//     await fetchExpenses();
    
//     console.log('✅ Profile and expenses refreshed after income update');
//   } catch (error) {
//     console.error('❌ Error refreshing data after income update:', error);
//   }
// };


//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading your dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-4">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">Finance X</h1>
//               <p className="text-sm text-gray-600">Your personal finance dashboard (Port 5001)</p>
//             </div>
//             <div className="flex items-center space-x-4">
//               <div className="text-right">
//                 <div className="text-sm text-gray-600">Welcome back,</div>
//                 <div className="font-medium text-gray-900">{user?.profile?.name}</div>
//               </div>
//               <button
//                 onClick={logout}
//                 className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
//               >
//                 Logout
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Error Message */}
//       {error && (
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
//             {error}
//           </div>
//         </div>
//       )}

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Budget Overview - Left Sidebar */}
//           <div className="lg:col-span-1">
//             <BudgetOverview 
//               user={user}
//               expenses={expenses}
//               onUpdateIncome={handleUpdateIncome}
//             />
//           </div>

//           {/* Expense Management - Main Content */}
//           <div className="lg:col-span-2 space-y-6">
//             <ExpenseForm onAddExpense={addExpense} />
//             <ExpenseList 
//               expenses={expenses} 
//               onRefresh={fetchExpenses}
//             />
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Dashboard;
// frontend/src/pages/EnhancedDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import CityIntelligenceDashboard from '../components/CityIntelligenceDashboard';
import LiveLeaderboard from '../components/LiveLeaderboard';
import CategoryWiseAnalysis from '../components/CategoryWiseAnalysis';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import BudgetOverview from '../components/BudgetOverview';

const EnhancedDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expenses, setExpenses] = useState([]);
  const [intelligenceScore, setIntelligenceScore] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(true);

  const tabs = [
    { id: 'dashboard', name: '📊 Dashboard', icon: '📊' },
    { id: 'intelligence', name: '🧠 City Intelligence', icon: '🧠' },
    { id: 'leaderboard', name: '🏆 Leaderboard', icon: '🏆' },
    { id: 'expenses', name: '💰 Expenses', icon: '💰' },
    { id: 'analytics', name: '📈 Analytics', icon: '📈' }
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Fetch expenses and intelligence score
      const [expensesRes, scoreRes] = await Promise.all([
        fetch('/api/expenses', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/intelligence/score', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      const expensesData = await expensesRes.json();
      const scoreData = await scoreRes.json();

      setExpenses(expensesData.expenses || []);
      setIntelligenceScore(scoreData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Finance X</h1>
              <p className="text-sm text-gray-600">
                Your intelligent financial companion for {user?.profile?.city}
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {intelligenceScore?.totalScore || 0}
                </div>
                <div className="text-xs text-gray-500">Intelligence Score</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  #{intelligenceScore?.cityRank || '--'}
                </div>
                <div className="text-xs text-gray-500">City Rank</div>
              </div>

              <button
                onClick={() => setShowLeaderboard(!showLeaderboard)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showLeaderboard 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {showLeaderboard ? '🏆 Hide Leaderboard' : '🏆 Show Leaderboard'}
              </button>

              <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Logout
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={`grid gap-6 ${showLeaderboard ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1'}`}>
          
          {/* Main Content Area */}
          <div className={showLeaderboard ? 'lg:col-span-3' : 'col-span-1'}>
            {activeTab === 'dashboard' && (
              <DashboardContent 
                user={user} 
                expenses={expenses}
                intelligenceScore={intelligenceScore}
                onExpenseAdded={fetchUserData}
              />
            )}

            {activeTab === 'intelligence' && (
              <CityIntelligenceDashboard />
            )}

            {activeTab === 'leaderboard' && (
              <div className="lg:hidden">
                <LiveLeaderboard />
              </div>
            )}

            {activeTab === 'expenses' && (
              <ExpenseManagement 
                expenses={expenses}
                onExpenseAdded={fetchUserData}
              />
            )}

            {activeTab === 'analytics' && (
              <CategoryWiseAnalysis 
                expenses={expenses}
                userIncome={user?.profile?.monthlyIncome}
                city={user?.profile?.city}
              />
            )}
          </div>

          {/* Leaderboard Sidebar */}
          {showLeaderboard && (
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <LiveLeaderboard isCompact={true} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Dashboard Content Component
const DashboardContent = ({ user, expenses, intelligenceScore, onExpenseAdded }) => {
  return (
    <div className="space-y-6">
      {/* Intelligence Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">🧠 Intelligence Score</h3>
          <div className="text-3xl font-bold mb-2">
            {intelligenceScore?.totalScore || 0}/100
          </div>
          <p className="text-blue-100 text-sm">
            Based on your spending habits in {user?.profile?.city}
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">🏙️ City Rank</h3>
          <div className="text-3xl font-bold mb-2">
            #{intelligenceScore?.cityRank || '--'}
          </div>
          <p className="text-green-100 text-sm">
            Among {user?.profile?.status} in {user?.profile?.city}
          </p>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">🔥 Current Streak</h3>
          <div className="text-3xl font-bold mb-2">
            {intelligenceScore?.streak || 0} days
          </div>
          <p className="text-orange-100 text-sm">
            Keep tracking expenses daily!
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Overview */}
        <BudgetOverview 
          user={user} 
          expenses={expenses}
          intelligenceScore={intelligenceScore}
        />

        {/* Quick Add Expense */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ⚡ Quick Add Expense
          </h3>
          <ExpenseForm onAddExpense={onExpenseAdded} isCompact={true} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📱 Recent Activity
        </h3>
        <ExpenseList 
          expenses={expenses.slice(0, 5)} 
          onRefresh={onExpenseAdded}
          isCompact={true}
        />
      </div>
    </div>
  );
};

export default EnhancedDashboard;
