import React from 'react';
import { useCodex } from '../context/CodexContext';
import { Flame, Award, BookOpen, RotateCcw, Home } from 'lucide-react';

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
      {/* Логотип (Полностью очищен от градиентов) */}
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
        <span className="text-glow-gradient" style={{ fontWeight: '800', fontSize: '15px', letterSpacing: '1.5px', fontFamily: 'var(--font-mono)' }}>
          CODEX
        </span>
      </div>

      {/* Индикатор прогресса текущего курса (Однотонный синий индикатор) */}
      {currentView === 'sandbox' && activeCourseDetail && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifySelf: 'center', maxWidth: '40%', margin: '0 20px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
            STEP {String(activeStepIndex + 1).padStart(2, '0')}/{String(activeCourseDetail.steps.length).padStart(2, '0')}
          </span>
          <div style={{ width: '100%', height: '5px', background: '#09090b', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${getCourseProgress()}%`, 
                background: 'var(--color-accent)',
                borderRadius: '3px',
                transition: 'width 0.4s ease'
              }} 
            />
          </div>
          <span style={{ fontSize: '11px', fontWeight: 'bold', fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
            {getCourseProgress()}%
          </span>
        </div>
      )}

      {/* Управление и профиль */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
          <span>Кабинет</span>
        </button>

        {/* Счётчик серии дней */}
        <div style={{ 
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
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
        >
          <Flame size={14} />
          <span style={{ fontSize: '12px', fontWeight: '600', fontFamily: 'var(--font-mono)' }}>{userState.streak}d</span>
        </div>

        {/* Индикатор уровня и опыта */}
        <div style={{ 
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
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
        >
          <Award size={14} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontSize: '12px', fontWeight: '600', fontFamily: 'var(--font-mono)' }}>
            Lvl {userState.level} ({userState.xp}/{userState.level * 1000} XP)
          </span>
        </div>

        {/* Кнопка сброса прогресса */}
        <button 
          className="btn-glass" 
          onClick={handleReset}
          style={{ color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.2)', padding: '6px 10px', height: '32px' }}
          title="Сбросить прогресс"
        >
          <RotateCcw size={14} />
        </button>

        {/* Профиль и Выход */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid var(--glass-border)', paddingLeft: '12px', marginLeft: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', fontFamily: 'var(--font-mono)' }}>
              @{user.name.toUpperCase()}
            </span>
            <button
              className="btn-glass"
              onClick={logout}
              style={{ padding: '6px 10px', height: '32px', fontSize: '11px', borderColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-danger)' }}
              title="Выйти"
            >
              Выйти
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
