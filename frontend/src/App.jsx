import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import FormBuilder from './components/FormBuilder';
import FormRenderer from './components/FormRenderer';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const Navigation = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  // Don't show navigation on auth pages
  const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';
  if (isAuthPage) return null;

  return (
    <nav className="bg-white border-b border-[#E2E8F0] p-4 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-[#6366F1] hover:text-[#22D3EE] transition-colors">
          ✨ AI Form Builder
        </Link>
        <div className="space-x-4 flex items-center">
          <Link to="/create" className="text-[#0F172A] hover:text-[#6366F1] font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-[#F1F5F9]">Create</Link>
          <Link to="/" className="text-[#0F172A] hover:text-[#6366F1] font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-[#F1F5F9]">Dashboard</Link>

          {user ? (
            <>
              <span className="text-[#0F172A] font-medium">Welcome, {user.name}</span>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white font-medium transition-colors px-4 py-1.5 rounded-lg shadow-md hover:shadow-lg"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="text-[#0F172A] hover:text-[#6366F1] font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-[#F1F5F9]">Sign In</Link>
              <Link to="/signup" className="bg-[#6366F1] hover:bg-[#22D3EE] text-white font-medium transition-colors px-4 py-1.5 rounded-lg shadow-md hover:shadow-lg">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/form/:id" element={<FormRenderer />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<FormBuilder />} />
        <Route path="/edit/:id" element={<FormBuilder />} />
        <Route path="/analytics/:id" element={<Analytics />} />
      </Route>

      {/* Redirect any other route to home or 404 in the future */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-grow">
            <AppRoutes />
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-[#E2E8F0] py-4 mt-8">
            <div className="max-w-7xl mx-auto px-4 text-center text-[#64748B] text-sm">
              <p> {new Date().getFullYear()} AI Form Builder. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
