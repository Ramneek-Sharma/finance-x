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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserData = async () => {
    try {
      // Fetch expenses and intelligence score
      const [expensesRes, scoreRes] = await Promise.all([
        fetch('/api/expenses', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/intelligence/score', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
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

  const userCity = user?.profile?.city || 'abc';
  const currentUserId = user?._id;
  const currentUserEmail = user?.email;

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

            {/* Quick Stats + Actions */}
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

              {/* Wire your actual logout handler here if needed */}
              <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Logout
              </button>
            </div>
          </div>

          {/* Tabs */}
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
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
          {/* Main panel */}
          <div className={showLeaderboard ? 'lg:col-span-3' : 'col-span-1'}>
            {activeTab === 'dashboard' && (
              <>
                <DashboardContent
                  user={user}
                  expenses={expenses}
                  intelligenceScore={intelligenceScore}
                  onExpenseAdded={fetchUserData}
                />

                {/* Compact leaderboard (Rank + Name only) on Dashboard */}
                <div className="mt-6">
                  <LiveLeaderboard
                    variant="compact"
                    city={userCity}
                    currentUserId={currentUserId}
                    currentUserEmail={currentUserEmail}
                  />
                </div>
              </>
            )}

            {activeTab === 'intelligence' && <CityIntelligenceDashboard />}

            {activeTab === 'leaderboard' && (
              <div className="w-full">
                {/* Full table when Leaderboard tab is active */}
                <LiveLeaderboard
                  variant="full"
                  city={userCity}
                  currentUserId={currentUserId}
                  currentUserEmail={currentUserEmail}
                  className="mb-6"
                />
              </div>
            )}

            {activeTab === 'expenses' && (
              <ExpenseManagement expenses={expenses} onExpenseAdded={fetchUserData} />
            )}

            {activeTab === 'analytics' && (
              <CategoryWiseAnalysis
                expenses={expenses}
                userIncome={user?.profile?.monthlyIncome}
                city={user?.profile?.city}
              />
            )}
          </div>

          {/* Sidebar leaderboard (full) */}
          {showLeaderboard && (
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <LiveLeaderboard
                  variant="full"
                  city={userCity}
                  currentUserId={currentUserId}
                  currentUserEmail={currentUserEmail}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* Dashboard Content Component */
const DashboardContent = ({ user, expenses, intelligenceScore, onExpenseAdded }) => {
  return (
    <div className="space-y-6">
      {/* Intelligence Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">🧠 Intelligence Score</h3>
          <div className="text-3xl font-bold mb-2">{intelligenceScore?.totalScore || 0}/100</div>
          <p className="text-blue-100 text-sm">
            Based on your spending habits in {user?.profile?.city}
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">🏙️ City Rank</h3>
          <div className="text-3xl font-bold mb-2">#{intelligenceScore?.cityRank || '--'}</div>
          <p className="text-green-100 text-sm">
            Among {user?.profile?.status} in {user?.profile?.city}
          </p>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">🔥 Current Streak</h3>
          <div className="text-3xl font-bold mb-2">{intelligenceScore?.streak || 0} days</div>
          <p className="text-orange-100 text-sm">Keep tracking expenses daily!</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Overview */}
        <BudgetOverview user={user} expenses={expenses} intelligenceScore={intelligenceScore} />

        {/* Quick Add Expense */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Quick Add Expense</h3>
          <ExpenseForm onAddExpense={onExpenseAdded} isCompact={true} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📱 Recent Activity</h3>
        <ExpenseList expenses={expenses.slice(0, 5)} onRefresh={onExpenseAdded} isCompact={true} />
      </div>
    </div>
  );
};

export default EnhancedDashboard;

/* Note:
- LiveLeaderboard must be the upgraded version that supports props:
  variant="full" | "compact", city, currentUserId, currentUserEmail, className
- Backend leaderboard payload should include userId and optionally email to enable highlighting.
*/
