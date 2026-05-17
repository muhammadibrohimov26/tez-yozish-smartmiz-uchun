import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Login({ isDarkMode, themeColor }: { isDarkMode: boolean; themeColor?: string }) {
  const { loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className={`rounded-[32px] border p-10 text-center transition-all ${isDarkMode ? 'border-white/5 bg-white/5 backdrop-blur-2xl' : 'border-gray-200 bg-white shadow-2xl'}`}>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30 text-2xl">
          ⚡
        </div>
        <h1 className="text-3xl font-display font-black tracking-tighter mb-2">Our smartmiz</h1>
        <p className={`text-sm mb-8 ${isDarkMode ? 'opacity-40' : 'text-gray-500'}`}>
          Tez yozish platformasiga kirish
        </p>

        <div className={`rounded-2xl border p-4 mb-8 text-left space-y-3 ${isDarkMode ? 'border-white/5 bg-white/[0.03]' : 'border-gray-100 bg-gray-50'}`}>
          {[
            { icon: '⌨️', text: "Yozish tezligingizni sinang" },
            { icon: '🏆', text: "Global reytingda o'rin egallang" },
            { icon: '👥', text: "Guruh yaratib do'stlar bilan musobaqa qiling" },
            { icon: '📊', text: "Statistika va tahlil oling" },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-lg">{f.icon}</span>
              <span className={`text-sm ${isDarkMode ? 'opacity-60' : 'text-gray-600'}`}>{f.text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={loginWithGoogle}
          className="w-full py-4 rounded-2xl bg-white text-gray-900 font-bold text-base flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-95 border border-gray-200"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google orqali kirish
        </button>

        <p className={`text-xs mt-6 ${isDarkMode ? 'opacity-30' : 'text-gray-400'}`}>
          Login qilmasdan ham test qilishingiz mumkin
        </p>
      </div>
    </div>
  );
}
