import React, { useState, useEffect } from 'react';
import { useCodex, CodexProvider } from './context/CodexContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { SandboxView } from './pages/SandboxView';
import { ParticleBackground } from './components/ParticleBackground';

function AppContent() {
  const { user, login } = useCodex();
  const [currentView, setCurrentView] = useState('landing'); // landing | dashboard | sandbox

  // Слушаем события успешной авторизации из всплывающего окна
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.origin !== window.location.origin) return;
      if (e.data && e.data.type === 'GOOGLE_LOGIN_SUCCESS') {
        login(e.data.email, e.data.name);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [login]);

  const handleGoogleLogin = () => {
    const width = 450;
    const height = 550;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    window.open(
      '/google-login.html',
      'Google Sign-in',
      `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
    );
  };

  // Google Login Gate: блокируем доступ, если пользователь не авторизован
  if (!user) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        {/* Микрочастицы на фоне */}
        <ParticleBackground />

        <div 
          className="glass-panel page-fade" 
          style={{ 
            width: '100%', 
            maxWidth: '400px', 
            padding: '40px 32px', 
            textAlign: 'center', 
            background: '#0c0c0e', 
            border: '1px solid var(--glass-border)',
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.45)',
            zIndex: 1,
            borderRadius: '8px'
          }}
        >
          {/* Иконка */}
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '6px',
            background: '#1c1c1f',
            border: '1px solid #3f3f46',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#fff', fontFamily: 'var(--font-mono)' }}>C</span>
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: '#ffffff', letterSpacing: '-0.5px' }}>
            Войти в Codex
          </h2>
          
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '28px' }}>
            Интерактивная песочница обучения программированию. Авторизуйтесь через аккаунт Google для доступа к материалам.
          </p>

          <button 
            className="btn-neon" 
            onClick={handleGoogleLogin} 
            style={{ width: '100%', padding: '12px', fontSize: '13px', gap: '10px' }}
          >
            {/* Иконка Google */}
            <svg width="16" height="16" viewBox="0 0 24 24" style={{ fill: 'currentColor' }}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Войти через Google</span>
          </button>
        </div>
      </div>
    );
  }

  // Если авторизован, рендерим приложение
  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Анимированный фон */}
      <ParticleBackground />
      
      {/* Шапка сайта */}
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Основной контент */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {currentView === 'landing' && <LandingPage setCurrentView={setCurrentView} />}
        {currentView === 'dashboard' && <Dashboard setCurrentView={setCurrentView} />}
        {currentView === 'sandbox' && <SandboxView setCurrentView={setCurrentView} />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <CodexProvider>
      <AppContent />
    </CodexProvider>
  );
}
