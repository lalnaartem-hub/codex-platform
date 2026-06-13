import React from 'react';
import { useCodex } from '../context/CodexContext';
import { Flame, Award, BookOpen, RotateCcw, Home, LogOut } from 'lucide-react';

export const Navbar = ({ currentView, setCurrentView }) => {
  const { userState, activeCourseDetail, activeStepIndex, resetProgress, user, logout } = useCodex();

  const getCourseProgress = () => {
    if (!activeCourseDetail) return 0;
    const completed = userState.completedSteps[activeCourseDetail.id] || [];
    return Math.round((completed.length / activeCourseDetail.steps.length) * 100);
  };

  const handleReset = () => {
    if (window.confirm('Вы действительно хотите сбросить весь свой прогресс обучения, XP и достижения?')) {
      resetProgress();
      setCurrentView('landing');
    }
  };

  return (
    <nav className="navbar">
      {/* Логотип */}
      <div 
        className="logo-container" 
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        onClick={() => setCurrentView('landing')}
      >
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '5px',
          background: '#1c1c1f',
          border: '1px solid #3f3f46',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#fff', fontFamily: 'var(--font-mono)' }}>C</span>
        </div>
        <span className="text-glow-gradient navbar-logo-text" style={{ fontWeight: '800', fontSize: '15px', letterSpacing: '1.5px', fontFamily: 'var(--font-mono)' }}>
          CODEX
        </span>
      </div>

      {/* Индикатор прогресса текущего курса */}
      {currentView === 'sandbox' && activeCourseDetail && (
        <div className="navbar-progress-container">
          <span className="navbar-progress-text">
            STEP {String(activeStepIndex + 1).padStart(2, '0')}/{String(activeCourseDetail.steps.length).padStart(2, '0')}
          </span>
          <div className="navbar-progress-bar-bg">
            <div 
              className="navbar-progress-bar-fill"
              style={{ 
                width: `${getCourseProgress()}%`, 
              }} 
            />
          </div>
          <span className="navbar-progress-percentage">
            {getCourseProgress()}%
          </span>
        </div>
      )}

      {/* Управление и профиль */}
      <div className="navbar-controls" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          className={`btn-glass ${currentView === 'landing' ? 'active' : ''}`}
          onClick={() => setCurrentView('landing')}
          style={{ padding: '6px 10px', height: '32px' }}
          title="Главная"
        >
          <Home size={14} />
        </button>

        <button 
          className={`btn-glass ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentView('dashboard')}
          style={{ padding: '6px 12px', height: '32px', gap: '6px', fontSize: '12px' }}
        >
          <BookOpen size={14} />
          <span className="navbar-btn-text">Кабинет</span>
        </button>

        {/* Счётчик серии дней */}
        <div className="navbar-badge streak-badge"
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            height: '32px',
            borderRadius: '6px',
            background: '#121214',
            border: '1px solid var(--glass-border)',
            color: '#fbbf24',
            transition: 'var(--transition-spring)',
            cursor: 'default'
          }}
        >
          <Flame size={14} />
          <span style={{ fontSize: '12px', fontWeight: '600', fontFamily: 'var(--font-mono)' }}>{userState.streak}d</span>
        </div>

        {/* Индикатор уровня и опыта */}
        <div className="navbar-badge level-badge"
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            height: '32px',
            borderRadius: '6px',
            background: '#121214',
            border: '1px solid var(--glass-border)',
            color: '#ffffff',
            transition: 'var(--transition-spring)',
            cursor: 'default'
          }}
        >
          <Award size={14} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontSize: '12px', fontWeight: '600', fontFamily: 'var(--font-mono)' }}>
            Lvl {userState.level}
            <span className="navbar-xp-text"> ({userState.xp}/{userState.level * 1000} XP)</span>
          </span>
        </div>

        {/* Кнопка сброса прогресса */}
        <button 
          className="btn-glass reset-btn" 
          onClick={handleReset}
          style={{ color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.2)', padding: '6px 10px', height: '32px' }}
          title="Сбросить прогресс"
        >
          <RotateCcw size={14} />
        </button>

        {/* Профиль и Выход */}
        {user && (
          <div className="navbar-profile">
            <span className="navbar-username">
              @{user.name.toUpperCase()}
            </span>
            <button
              className="btn-glass logout-btn"
              onClick={logout}
              style={{ borderColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Выйти"
            >
              <span className="logout-btn-text">Выйти</span>
              <LogOut size={14} className="logout-btn-icon" style={{ display: 'none' }} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

