import {  useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';

const AppContent = () => {
  const { user, token, loading } = useAuth();

  // Debug state changes
  useEffect(() => {
    console.log('🔍 App state update:', { 
      hasUser: !!user, 
      hasToken: !!token, 
      loading,
      userName: user?.profile?.name,
      timestamp: new Date().toLocaleTimeString()
    });
  }, [user, token, loading]);

  if (loading) {
    console.log('⏳ App loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Finance X...</p>
        </div>
      </div>
    );
  }

  // Check for both user and token
  if (user && token) {
    console.log('✅ Showing dashboard - auth state stable');
    return <Dashboard />;
  }

  console.log('📝 Showing login page');
  return <AuthPage />;
};

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;
