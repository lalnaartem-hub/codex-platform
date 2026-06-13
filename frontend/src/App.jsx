import React, { useState } from 'react';
import { useCodex, CodexProvider } from './context/CodexContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { SandboxView } from './pages/SandboxView';
import { ParticleBackground } from './components/ParticleBackground';

function AppContent() {
  const { user, login } = useCodex();
  const [currentView, setCurrentView] = useState('landing'); // landing | dashboard | sandbox
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState('');

  const handleSelectAccount = (email, name) => {
    setIsAuthenticating(true);
    setSelectedEmail(email);
    
    // Симулируем проверку токена Google OAuth
    setTimeout(() => {
      login(email, name);
      setIsAuthenticating(false);
      setShowGoogleModal(false);
    }, 1000);
  };

  const handleCustomAccount = () => {
    const email = prompt("Введите ваш email:");
    if (!email || !email.includes('@')) {
      alert("Пожалуйста, введите корректный адрес email.");
      return;
    }
    const name = email.split('@')[0];
    handleSelectAccount(email, name);
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
            onClick={() => setShowGoogleModal(true)} 
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

        {/* Модальное окно Google Sign-In */}
        {showGoogleModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div 
              className="glass-panel page-fade"
              style={{
                background: '#141416',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                width: '100%',
                maxWidth: '400px',
                padding: '32px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                position: 'relative'
              }}
            >
              {/* Кнопка закрытия модалки */}
              {!isAuthenticating && (
                <button 
                  onClick={() => setShowGoogleModal(false)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}
                >
                  &times;
                </button>
              )}

              {isAuthenticating ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: '16px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid rgba(255,255,255,0.05)',
                    borderTopColor: 'var(--color-accent)',
                    borderRadius: '50%',
                    animation: 'blink 1s linear infinite'
                  }} />
                  <div style={{ fontSize: '14px', color: '#ffffff', fontFamily: 'var(--font-mono)' }}>Подключение к Google...</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Авторизуем {selectedEmail}</div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: '#ffffff',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                    </div>
                  </div>
                  
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>Вход через Google</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '24px' }}>Выберите один из аккаунтов Google</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Аккаунт 1 */}
                    <div 
                      onClick={() => handleSelectAccount('lalna@gmail.com', 'lalna')}
                      style={{
                        background: '#1c1c1f',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '6px',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'var(--transition-smooth)'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#27272a'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#1c1c1f'; }}
                    >
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContext: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', color: '#ffffff' }}>L</div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff' }}>lalna</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>lalna@gmail.com</div>
                      </div>
                    </div>

                    {/* Аккаунт 2 */}
                    <div 
                      onClick={() => handleSelectAccount('developer@gmail.com', 'DevCoder')}
                      style={{
                        background: '#1c1c1f',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '6px',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'var(--transition-smooth)'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#27272a'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#1c1c1f'; }}
                    >
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContext: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', color: '#ffffff' }}>D</div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff' }}>DevCoder</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>developer@gmail.com</div>
                      </div>
                    </div>

                    {/* Другой аккаунт */}
                    <div 
                      onClick={handleCustomAccount}
                      style={{
                        background: '#1c1c1f',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '6px',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'var(--transition-smooth)'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#27272a'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#1c1c1f'; }}
                    >
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#52525b', display: 'flex', alignItems: 'center', justifyContext: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', color: '#ffffff' }}>+</div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Другой аккаунт</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Вход под другим email</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
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
