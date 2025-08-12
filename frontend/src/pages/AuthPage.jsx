import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const API_BASE_URL = 'http://localhost:5001';

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    city: '',
    status: 'student',
    monthlyIncome: '',
    fixedExpenses: '',
    savingsGoal: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent any event bubbling
    
    console.log('🚀 Form submitted, preventing default behavior');
    console.log('📋 Form mode:', isSignUp ? 'Sign Up' : 'Sign In');
    
    setLoading(true);
    setError('');

    try {
      const url = `${API_BASE_URL}/api/auth/${isSignUp ? 'signup' : 'signin'}`;
      
      const payload = isSignUp ? {
        email: formData.email.trim(),
        password: formData.password,
        profile: {
          name: formData.name.trim(),
          city: formData.city.trim(),
          status: formData.status,
          monthlyIncome: Number(formData.monthlyIncome),
          fixedExpenses: Number(formData.fixedExpenses) || 0,
          savingsGoal: Number(formData.savingsGoal) || 0
        }
      } : {
        email: formData.email.trim(),
        password: formData.password
      };

      console.log('🚀 Submitting to:', url);
      console.log('📦 Payload:', payload);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Debug response details
      console.log('📨 Response status:', response.status);
      console.log('📨 Response ok:', response.ok);

      const data = await response.json();
      console.log('📨 Response data:', data);

      // Handle successful response
      if (response.ok && data.success && data.token && data.user) {
        console.log('✅ Authentication successful - calling login function');
        console.log('👤 User data:', data.user);
        console.log('🔑 Token preview:', data.token.substring(0, 20) + '...');
        
        // Call login function to update auth state
        login(data.token, data.user);
        
        // Clear form data after successful authentication
        setFormData({
          email: '',
          password: '',
          name: '',
          city: '',
          status: 'student',
          monthlyIncome: '',
          fixedExpenses: '',
          savingsGoal: ''
        });
        
        console.log('✅ Form cleared, should redirect to dashboard now');
        
        // Verify token storage
        setTimeout(() => {
          const storedToken = localStorage.getItem('token');
          console.log('🔍 Token verification:', storedToken ? 'Successfully stored' : '❌ Not stored');
          
          if (storedToken) {
            console.log('🎉 Authentication complete - dashboard should be visible');
          }
        }, 100);
        
      } else {
        console.error('❌ Authentication failed:', data);
        setError(data.message || 'Authentication failed. Please try again.');
      }
    } catch (error) {
      console.error('🔥 Network error during authentication:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Finance X</h1>
          <p className="text-gray-600 mt-2">
            {isSignUp ? 'Create your account to start tracking' : 'Welcome back to your financial journey'}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="your@email.com"
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your password"
            />
          </div>

          {/* Sign Up Fields */}
          {isSignUp && (
            <>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  autoComplete="address-level2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Your city"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="student">Student</option>
                  <option value="working">Working Professional</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="freelancer">Freelancer</option>
                </select>
              </div>

              <div>
                <label htmlFor="monthlyIncome" className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Income (₹)
                </label>
                <input
                  type="number"
                  id="monthlyIncome"
                  name="monthlyIncome"
                  value={formData.monthlyIncome}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="5000"
                />
              </div>

              <div>
                <label htmlFor="fixedExpenses" className="block text-sm font-medium text-gray-700 mb-1">
                  Fixed Expenses (₹) - Optional
                </label>
                <input
                  type="number"
                  id="fixedExpenses"
                  name="fixedExpenses"
                  value={formData.fixedExpenses}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="2000"
                />
              </div>

              <div>
                <label htmlFor="savingsGoal" className="block text-sm font-medium text-gray-700 mb-1">
                  Savings Goal (₹) - Optional
                </label>
                <input
                  type="number"
                  id="savingsGoal"
                  name="savingsGoal"
                  value={formData.savingsGoal}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="10000"
                />
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </span>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        {/* Toggle Sign Up/Sign In */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              // Clear form when switching modes
              setFormData({
                email: '',
                password: '',
                name: '',
                city: '',
                status: 'student',
                monthlyIncome: '',
                fixedExpenses: '',
                savingsGoal: ''
              });
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200 hover:underline"
          >
            {isSignUp 
              ? 'Already have an account? Sign In' 
              : "Don't have an account? Create one"}
          </button>
        </div>

        {/* Development Info */}
        {import.meta.env.DEV === 'development' && (
          <div className="mt-4 text-center text-xs text-gray-400">
            API: {API_BASE_URL} | Mode: {isSignUp ? 'Sign Up' : 'Sign In'}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
