import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import { getTheme, applyTheme, THEMES } from './data/themes';
import type { ThemeColor } from './types';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading || user === undefined) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [themeColor, setThemeColor] = useState<ThemeColor>(getTheme());

  // Apply theme on mount and when it changes
  useEffect(() => {
    applyTheme(themeColor);
  }, [themeColor]);

  const theme = THEMES[themeColor];

  return (
    <Layout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} themeColor={themeColor}>
      <Routes>
        <Route path="/" element={<Home isDarkMode={isDarkMode} themeColor={themeColor} />} />
        <Route path="/login" element={<Login isDarkMode={isDarkMode} themeColor={themeColor} />} />
        <Route path="/leaderboard" element={<Leaderboard isDarkMode={isDarkMode} themeColor={themeColor} />} />
        <Route path="/groups" element={<ProtectedRoute><Groups isDarkMode={isDarkMode} /></ProtectedRoute>} />
        <Route path="/groups/:id" element={<ProtectedRoute><GroupDetail isDarkMode={isDarkMode} /></ProtectedRoute>} />
        <Route path="/groups/:id/test" element={<ProtectedRoute><Home isDarkMode={isDarkMode} themeColor={themeColor} /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile isDarkMode={isDarkMode} onThemeChange={setThemeColor} /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
