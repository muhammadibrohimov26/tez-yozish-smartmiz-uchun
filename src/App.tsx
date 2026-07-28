import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import { getTheme, applyTheme } from './data/themes';
import { useDarkMode } from './hooks/useDarkMode';
import type { ThemeColor } from './types';

// Route-level code splitting keeps the initial bundle (firebase + motion) small.
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Lessons = lazy(() => import('./pages/Lessons'));
const LessonDrill = lazy(() => import('./pages/LessonDrill'));
const Groups = lazy(() => import('./pages/Groups'));
const GroupDetail = lazy(() => import('./pages/GroupDetail'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Profile = lazy(() => import('./pages/Profile'));
const BattleRoom = lazy(() => import('./pages/BattleRoom'));
const Admin = lazy(() => import('./pages/Admin'));

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading || user === undefined) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const [isDarkMode, setIsDarkMode] = useDarkMode();
  const [themeColor, setThemeColor] = useState<ThemeColor>(getTheme());

  // Apply theme on mount and when it changes
  useEffect(() => {
    applyTheme(themeColor);
  }, [themeColor]);

  return (
    <Layout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} themeColor={themeColor}>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<Home isDarkMode={isDarkMode} themeColor={themeColor} />} />
          <Route path="/login" element={<Login isDarkMode={isDarkMode} themeColor={themeColor} />} />
          <Route path="/lessons" element={<Lessons isDarkMode={isDarkMode} themeColor={themeColor} />} />
          <Route path="/lessons/:lessonId" element={<LessonDrill isDarkMode={isDarkMode} themeColor={themeColor} />} />
          <Route path="/leaderboard" element={<Leaderboard isDarkMode={isDarkMode} themeColor={themeColor} />} />
          <Route path="/groups" element={<ProtectedRoute><Groups isDarkMode={isDarkMode} /></ProtectedRoute>} />
          <Route path="/groups/:id" element={<ProtectedRoute><GroupDetail isDarkMode={isDarkMode} /></ProtectedRoute>} />
          <Route path="/groups/:id/test" element={<ProtectedRoute><Home isDarkMode={isDarkMode} themeColor={themeColor} /></ProtectedRoute>} />
          <Route path="/groups/:id/battle/:battleId" element={<ProtectedRoute><BattleRoom isDarkMode={isDarkMode} themeColor={themeColor} /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile isDarkMode={isDarkMode} onThemeChange={setThemeColor} /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Admin isDarkMode={isDarkMode} /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
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
