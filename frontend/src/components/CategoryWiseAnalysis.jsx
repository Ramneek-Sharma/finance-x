// frontend/src/components/CategoryWiseAnalysis.jsx - FIXED VERSION
import { useState, useEffect, useCallback } from 'react';

const CategoryWiseAnalysis = ({ expenses, userIncome, city }) => {
  const [analysis, setAnalysis] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add the missing convertCityDataToBenchmarks function
  const convertCityDataToBenchmarks = (cityData) => {
    // Convert API city data to benchmark format
    const benchmarks = {};
    if (cityData.data && cityData.data.costOfLiving) {
      Object.entries(cityData.data.costOfLiving).forEach(([category, data]) => {
        benchmarks[category] = {
          average: data.average || 0,
          percentage: data.percentage || 0
        };
      });
    }
    return benchmarks;
  };

  const fetchCityBenchmarks = async (city, incomeBracket) => {
    try {
      const response = await fetch(`/api/city-data/${city}/${incomeBracket}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        return convertCityDataToBenchmarks(data);
      }
    } catch (err) {
      console.log('API not available, using enhanced mock benchmarks');
      // Remove unused error variable
    }
    
    return getMockBenchmarks(city, incomeBracket);
  };

  const getMockBenchmarks = (city, incomeBracket) => {
    // City-specific multipliers
    const cityMultipliers = {
      mumbai: 1.3,
      bangalore: 1.15,
      delhi: 1.1,
      chennai: 1.0,
      hyderabad: 0.95,
      pune: 1.05,
      kolkata: 0.9,
      ahmedabad: 0.85
    };

    const multiplier = cityMultipliers[city?.toLowerCase()] || 1.0;

    const baseBenchmarks = {
      budget: {
        food: { average: Math.round(4500 * multiplier), percentage: 35 },
        transport: { average: Math.round(2000 * multiplier), percentage: 15 },
        housing: { average: Math.round(6000 * multiplier), percentage: 40 },
        bills: { average: Math.round(1200 * multiplier), percentage: 8 },
        entertainment: { average: Math.round(800 * multiplier), percentage: 5 },
        healthcare: { average: Math.round(1000 * multiplier), percentage: 7 },
        education: { average: Math.round(600 * multiplier), percentage: 4 },
        others: { average: Math.round(500 * multiplier), percentage: 3 }
      },
      emerging: {
        food: { average: Math.round(7000 * multiplier), percentage: 28 },
        transport: { average: Math.round(4000 * multiplier), percentage: 18 },
        housing: { average: Math.round(10000 * multiplier), percentage: 35 },
        bills: { average: Math.round(2500 * multiplier), percentage: 10 },
        entertainment: { average: Math.round(2000 * multiplier), percentage: 8 },
        healthcare: { average: Math.round(1500 * multiplier), percentage: 5 },
        education: { average: Math.round(1000 * multiplier), percentage: 4 },
        others: { average: Math.round(800 * multiplier), percentage: 3 }
      },
      stable: {
        food: { average: Math.round(12000 * multiplier), percentage: 25 },
        transport: { average: Math.round(6000 * multiplier), percentage: 15 },
        housing: { average: Math.round(18000 * multiplier), percentage: 30 },
        bills: { average: Math.round(4000 * multiplier), percentage: 8 },
        entertainment: { average: Math.round(5000 * multiplier), percentage: 12 },
        healthcare: { average: Math.round(3000 * multiplier), percentage: 6 },
        education: { average: Math.round(2000 * multiplier), percentage: 4 },
        others: { average: Math.round(1500 * multiplier), percentage: 3 }
      },
      affluent: {
        food: { average: Math.round(20000 * multiplier), percentage: 20 },
        transport: { average: Math.round(10000 * multiplier), percentage: 12 },
        housing: { average: Math.round(30000 * multiplier), percentage: 30 },
        bills: { average: Math.round(6000 * multiplier), percentage: 6 },
        entertainment: { average: Math.round(10000 * multiplier), percentage: 15 },
        healthcare: { average: Math.round(5000 * multiplier), percentage: 6 },
        education: { average: Math.round(4000 * multiplier), percentage: 5 },
        others: { average: Math.round(3000 * multiplier), percentage: 4 }
      }
    };

    return baseBenchmarks[incomeBracket] || baseBenchmarks.emerging;
  };

  const calculateEfficiency = (spent, expected) => {
    if (expected === 0) return spent === 0 ? 100 : 0;
    const ratio = spent / expected;
    if (ratio <= 0.8) return 100;
    if (ratio <= 1.0) return 85;
    if (ratio <= 1.2) return 65;
    if (ratio <= 1.5) return 40;
    return 20;
  };

  const getIncomeBracket = (income) => {
    if (!income) return 'emerging';
    if (income <= 15000) return 'budget';
    if (income <= 30000) return 'emerging';
    if (income <= 60000) return 'stable';
    return 'affluent';
  };

  const getSpendingStatus = (spent, expected) => {
    if (spent === 0 && expected > 0) return 'unused';
    if (spent <= expected * 0.8) return 'excellent';
    if (spent <= expected) return 'good';
    if (spent <= expected * 1.2) return 'okay';
    return 'over';
  };

  const getMockCategoryInsights = (income, city) => {
    const incomeBracket = getIncomeBracket(income);
    const benchmarks = getMockBenchmarks(city, incomeBracket);
    
    return Object.entries(benchmarks).map(([category, benchmark]) => {
      // Add realistic variation to spending
      const variationFactor = 0.8 + Math.random() * 0.6; // 0.8 to 1.4
      const spent = Math.round(benchmark.average * variationFactor);
      const expected = Math.round((income * benchmark.percentage) / 100);
      
      return {
        category,
        spent,
        expected,
        benchmark: benchmark.average,
        efficiency: calculateEfficiency(spent, expected),
        percentage: (spent / income) * 100,
        status: getSpendingStatus(spent, expected),
        hasSpending: true,
        transactionCount: Math.floor(Math.random() * 15) + 1 // 1-15 transactions
      };
    });
  };

  const filterExpensesByPeriod = (expenses, period) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOf3MonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      switch (period) {
        case 'thisMonth':
          return expenseDate >= startOfMonth;
        case 'lastMonth':
          return expenseDate >= startOfLastMonth && expenseDate < startOfMonth;
        case 'last3Months':
          return expenseDate >= startOf3MonthsAgo;
        default:
          return true;
      }
    });
  };

  // Fix: Use useCallback to memoize generateAnalysis
  const generateAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Handle empty or missing data
      if (!expenses || expenses.length === 0 || !userIncome) {
        setAnalysis({
          categoryInsights: getMockCategoryInsights(userIncome || 25000, city),
          totalSpent: (userIncome || 25000) * 0.6, // Mock 60% spending
          incomeBracket: getIncomeBracket(userIncome || 25000),
          benchmarks: getMockBenchmarks(city, getIncomeBracket(userIncome || 25000))
        });
        setLoading(false);
        return;
      }
      
      // Filter expenses by selected period
      const filteredExpenses = filterExpensesByPeriod(expenses, selectedPeriod);
      
      // Calculate category-wise totals
      const categoryTotals = {};
      filteredExpenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
      });

      // Get city benchmarks for user's income bracket
      const incomeBracket = getIncomeBracket(userIncome);
      const benchmarks = await fetchCityBenchmarks(city, incomeBracket);
      
      // Generate insights for all categories (even if user hasn't spent)
      const allCategories = ['food', 'transport', 'housing', 'bills', 'entertainment', 'healthcare', 'education', 'others'];
      const categoryInsights = allCategories.map(category => {
        const spent = categoryTotals[category] || 0;
        const benchmark = benchmarks[category] || { average: 0, percentage: 0 };
        const expectedAmount = (userIncome * benchmark.percentage) / 100;
        const efficiency = calculateEfficiency(spent, expectedAmount);
        
        return {
          category,
          spent,
          expected: expectedAmount,
          benchmark: benchmark.average,
          efficiency,
          percentage: spent > 0 ? (spent / userIncome) * 100 : 0,
          status: getSpendingStatus(spent, expectedAmount),
          hasSpending: spent > 0,
          transactionCount: filteredExpenses.filter(e => e.category === category).length
        };
      }).filter(insight => insight.hasSpending || insight.expected > 0);

      setAnalysis({
        categoryInsights,
        totalSpent: Object.values(categoryTotals).reduce((sum, val) => sum + val, 0),
        incomeBracket,
        benchmarks,
        filteredExpenses
      });
      
    } catch (err) {
      console.error('Error generating analysis:', err);
      setError('Failed to generate analysis. Using estimated data.');
      
      // Enhanced fallback analysis
      setAnalysis({
        categoryInsights: getMockCategoryInsights(userIncome || 25000, city),
        totalSpent: (userIncome || 25000) * 0.6,
        incomeBracket: getIncomeBracket(userIncome || 25000),
        benchmarks: getMockBenchmarks(city, getIncomeBracket(userIncome || 25000))
      });
    } finally {
      setLoading(false);
    }
  }, [expenses, selectedPeriod, userIncome, city]); // Add all dependencies

  // Fix: Include generateAnalysis in the dependency array
  useEffect(() => {
    generateAnalysis();
  }, [generateAnalysis]);

  const getStatusColor = (status) => {
    const colors = {
      excellent: 'text-green-600 bg-green-50 border-green-200',
      good: 'text-blue-600 bg-blue-50 border-blue-200',
      okay: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      over: 'text-red-600 bg-red-50 border-red-200',
      unused: 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return colors[status] || colors.okay;
  };

  const getStatusIcon = (status) => {
    const icons = {
      excellent: '🌟',
      good: '✅',
      okay: '⚠️',
      over: '🚨',
      unused: '💤'
    };
    return icons[status] || icons.okay;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      food: '🍽️',
      transport: '🚗',
      housing: '🏠',
      entertainment: '🎬',
      healthcare: '🏥',
      bills: '📄',
      education: '📚',
      others: '📦',
      shopping: '🛒'
    };
    return icons[category] || '📦';
  };

  const getIncomeBracketLabel = (bracket) => {
    const labels = {
      budget: 'Under ₹15K',
      emerging: '₹15K-₹30K',
      stable: '₹30K-₹60K',
      affluent: 'Above ₹60K'
    };
    return labels[bracket] || 'Unknown';
  };

  const getPeriodLabel = (period) => {
    const labels = {
      thisMonth: 'This Month',
      lastMonth: 'Last Month',
      last3Months: 'Last 3 Months'
    };
    return labels[period] || 'This Month';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const safeIncome = userIncome || 25000;
  const safeTotalSpent = analysis?.totalSpent || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              📈 Category-Wise Expense Analysis
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Analysis for {getPeriodLabel(selectedPeriod)} in {city}
            </p>
          </div>
          
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="last3Months">Last 3 Months</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="text-sm text-yellow-800">
              ⚠️ {error}
            </div>
          </div>
        )}

        {/* Enhanced Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border">
            <div className="text-3xl font-bold text-gray-900">
              ₹{safeTotalSpent.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Spent</div>
            <div className="text-xs text-gray-500 mt-1">
              {getPeriodLabel(selectedPeriod)}
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="text-3xl font-bold text-blue-600">
              {((safeTotalSpent / safeIncome) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Of Income Used</div>
            <div className="text-xs text-gray-500 mt-1">
              Out of ₹{safeIncome.toLocaleString()}
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="text-3xl font-bold text-green-600">
              ₹{Math.max(0, safeIncome - safeTotalSpent).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Remaining Budget</div>
            <div className="text-xs text-gray-500 mt-1">
              {((Math.max(0, safeIncome - safeTotalSpent) / safeIncome) * 100).toFixed(1)}% left
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Category Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {analysis?.categoryInsights?.map(insight => (
          <div key={insight.category} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 border-l-4" 
               style={{borderLeftColor: insight.status === 'excellent' ? '#10b981' : 
                                       insight.status === 'good' ? '#3b82f6' :
                                       insight.status === 'okay' ? '#f59e0b' : '#ef4444'}}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">
                  {getCategoryIcon(insight.category)}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 capitalize">
                    {insight.category}
                  </h3>
                  <div className="text-xs text-gray-500">
                    {insight.transactionCount ? `${insight.transactionCount} transactions` : 'No transactions'}
                  </div>
                </div>
              </div>
              
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(insight.status)}`}>
                {getStatusIcon(insight.status)} {insight.status.toUpperCase()}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Amount Spent:</span>
                <span className="font-semibold text-gray-900">
                  ₹{insight.spent.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Expected ({city} avg):</span>
                <span className="font-semibold text-blue-600">
                  ₹{insight.expected.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">% of Income:</span>
                <span className="font-semibold text-gray-700">
                  {insight.percentage.toFixed(1)}%
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Efficiency Score:</span>
                <span className={`font-semibold ${
                  insight.efficiency >= 80 ? 'text-green-600' :
                  insight.efficiency >= 60 ? 'text-blue-600' :
                  insight.efficiency >= 40 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {insight.efficiency}/100
                </span>
              </div>

              {/* Enhanced Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ${
                    insight.status === 'excellent' ? 'bg-green-500' :
                    insight.status === 'good' ? 'bg-blue-500' :
                    insight.status === 'okay' ? 'bg-yellow-500' : 
                    insight.status === 'over' ? 'bg-red-500' : 'bg-gray-400'
                  }`}
                  style={{ 
                    width: `${Math.min(Math.max((insight.spent / Math.max(insight.expected, 1)) * 100, 5), 100)}%` 
                  }}
                />
              </div>

              {/* Enhanced Recommendation */}
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <div className="text-xs font-medium text-gray-700 mb-1">
                  💡 Smart Tip:
                </div>
                <div className="text-xs text-gray-600 leading-relaxed">
                  {insight.status === 'excellent' && 
                    `Outstanding! Your ${insight.category} spending is 20% below expectations. Consider if you're meeting all your needs in this category.`}
                  {insight.status === 'good' && 
                    `Well managed! Your ${insight.category} expenses are within healthy limits. Maintain this discipline.`}
                  {insight.status === 'okay' && 
                    `Room for improvement. Try to reduce ${insight.category} spending by ₹${Math.round((insight.spent - insight.expected * 0.9)).toLocaleString()} to optimize your budget.`}
                  {insight.status === 'over' && 
                    `Action needed! You're overspending by ₹${(insight.spent - insight.expected).toLocaleString()}. Consider budgeting ₹${Math.round(insight.expected * 1.1).toLocaleString()} monthly for ${insight.category}.`}
                  {insight.status === 'unused' && 
                    `Consider allocating ₹${insight.expected.toLocaleString()} for ${insight.category} to maintain a balanced lifestyle.`}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced City & Income Bracket Comparison */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
        <h3 className="text-xl font-semibold text-purple-900 mb-4">
          🏙️ How You Compare in {city}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-sm text-purple-700 mb-2">Income Bracket:</div>
            <div className="text-lg font-bold text-purple-900 capitalize">
              {analysis?.incomeBracket}
            </div>
            <div className="text-sm text-purple-600">
              {getIncomeBracketLabel(analysis?.incomeBracket)}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-purple-700 mb-2">Categories Optimized:</div>
            <div className="text-lg font-bold text-purple-900">
              {analysis?.categoryInsights?.filter(c => c.status === 'excellent' || c.status === 'good').length || 0}/
              {analysis?.categoryInsights?.length || 0}
            </div>
            <div className="text-sm text-purple-600">
              {Math.round(((analysis?.categoryInsights?.filter(c => c.status === 'excellent' || c.status === 'good').length || 0) / (analysis?.categoryInsights?.length || 1)) * 100)}% optimized
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm text-purple-700 mb-2">Savings Potential:</div>
            <div className="text-lg font-bold text-purple-900">
              ₹{analysis?.categoryInsights?.reduce((sum, c) => 
                c.status === 'over' ? sum + Math.max(0, c.spent - c.expected) : sum, 0
              )?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-purple-600">Monthly savings possible</div>
          </div>

          <div className="text-center">
            <div className="text-sm text-purple-700 mb-2">Financial Health:</div>
            <div className="text-lg font-bold text-purple-900">
              {analysis?.categoryInsights?.filter(c => c.status === 'excellent').length >= 3 ? '🌟 Excellent' :
               analysis?.categoryInsights?.filter(c => c.status === 'good' || c.status === 'excellent').length >= 3 ? '✅ Good' :
               analysis?.categoryInsights?.filter(c => c.status !== 'over').length >= 3 ? '⚠️ Fair' : '🚨 Needs Focus'}
            </div>
            <div className="text-sm text-purple-600">Overall rating</div>
          </div>
        </div>

        {/* Advanced Insights */}
        <div className="mt-6 p-4 bg-white/50 rounded-lg">
          <div className="text-sm font-medium text-purple-900 mb-3">
            🎯 Personalized Action Plan:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
            <div className="space-y-2">
              <div>• Set monthly budgets for overspending categories</div>
              <div>• Track daily expenses for better awareness</div>
              <div>• Use the 50/30/20 rule: needs/wants/savings</div>
            </div>
            <div className="space-y-2">
              <div>• Compare prices before major purchases</div>
              <div>• Review subscriptions and recurring charges</div>
              <div>• Build an emergency fund of 3-6 months expenses</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryWiseAnalysis;
