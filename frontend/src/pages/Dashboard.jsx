import React from 'react';
import { useCodex } from '../context/CodexContext';
import { Flame, Award, CheckCircle2, Play, Trophy, Clock, Star } from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal';

export const Dashboard = ({ setCurrentView }) => {
  const { userState, courses, selectCourse } = useCodex();

  // Рассчитываем суммарные статистики
  const totalCompleted = Object.values(userState.completedSteps).reduce((acc, curr) => acc + curr.length, 0);
  const xpNeeded = userState.level * 1000;
  const xpPercent = Math.round((userState.xp / xpNeeded) * 100);

  // Список всех возможных достижений
  const ACHIEVEMENTS_LIST = [
    { id: 'first-lesson', title: 'Первый шаг в ИТ', desc: 'Завершите ваш самый первый урок на платформе.', icon: Star },
    { id: 'level-2', title: 'Быстрообучаемый', desc: 'Достигните 2-го уровня профиля.', icon: Award },
    { id: 'level-3', title: 'Код-мастер', desc: 'Достигните 3-го уровня профиля.', icon: Trophy },
    { id: 'streak-3', title: 'Упорство', desc: 'Поддерживайте серию занятий в течение 3 дней.', icon: Flame }
  ];

  const handleResumeCourse = async (courseId) => {
    await selectCourse(courseId);
    setCurrentView('sandbox');
  };

  const startedCourses = courses.filter(course => {
    const completed = userState.completedSteps[course.id] || [];
    return completed.length > 0;
  });

  return (
    <div className="page-fade" style={{ padding: '50px 24px', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
      <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '28px', letterSpacing: '-0.5px' }}>
        Панель обучения <span className="text-glow-gradient">ученика</span>
      </h2>

      {/* Верхняя сетка с общей статистикой */}
      <div className="dashboard-stats-grid">
        {/* Карточка профиля */}
        <ScrollReveal delay={0}>
          <div className="glass-card" style={{ display: 'flex', gap: '16px', alignItems: 'center', height: '100%' }}>
            {/* Очищенная круглая иконка уровня */}
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: '#1c1c1f',
              border: '1px solid #3f3f46',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', fontFamily: 'var(--font-mono)' }}>{userState.level}</span>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px', color: '#ffffff' }}>Профиль студента</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                <span>Опыт XP</span>
                <span>{userState.xp} / {xpNeeded}</span>
              </div>
              <div style={{ width: '100%', height: '5px', background: '#09090b', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                <div style={{ width: `${xpPercent}%`, height: '100%', background: 'var(--color-accent)', borderRadius: '3px' }}></div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Общая статистика */}
        <ScrollReveal delay={80}>
          <div className="glass-card" style={{ display: 'flex', gap: '16px', alignItems: 'center', height: '100%' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '6px',
              background: 'rgba(16, 185, 129, 0.04)',
              border: '1px solid rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-success)'
            }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Завершено шагов</h4>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>{totalCompleted} уроков</p>
            </div>
          </div>
        </ScrollReveal>

        {/* Серия дней */}
        <ScrollReveal delay={160}>
          <div className="glass-card" style={{ display: 'flex', gap: '16px', alignItems: 'center', height: '100%' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '6px',
              background: 'rgba(245, 158, 11, 0.04)',
              border: '1px solid rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24'
            }}>
              <Flame size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Текущая серия</h4>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>{userState.streak} дней подряд</p>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* 2-Column Split Layout */}
      <div className="dashboard-split-layout">
        {/* Активные курсы (слева) */}
        <ScrollReveal delay={100}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#ffffff' }}>Продолжить обучение</h3>
            {startedCourses.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                <Clock size={32} style={{ marginBottom: '12px', color: 'var(--text-muted)' }} />
                <p style={{ fontSize: '13px', marginBottom: '16px' }}>У вас пока нет активных курсов. Выберите первый курс в каталоге!</p>
                <button className="btn-neon" onClick={() => setCurrentView('landing')} style={{ padding: '8px 16px', fontSize: '12px' }}>
                  Каталог курсов
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {startedCourses.map(course => {
                  const completed = userState.completedSteps[course.id] || [];
                  const progressPercent = Math.round((completed.length / course.lessonsCount) * 100);

                  return (
                    <div key={course.id} className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '4px', color: '#ffffff' }}>{course.title}</h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                          Завершено: {completed.length} из {course.lessonsCount} шагов
                        </p>
                        <div style={{ width: '100%', height: '4px', background: '#09090b', borderRadius: '2px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                          <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--color-accent)', borderRadius: '2px' }}></div>
                        </div>
                      </div>
                      <button className="btn-neon" onClick={() => handleResumeCourse(course.id)} style={{ padding: '8px 16px', fontSize: '12px', gap: '6px' }}>
                        <Play size={12} fill="black" />
                        <span>Продолжить</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Достижения (справа, с плоскими бордерами успеха) */}
        <ScrollReveal delay={180}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#ffffff' }}>Достижения</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {ACHIEVEMENTS_LIST.map((ach, index) => {
                let isUnlocked = userState.unlockedAchievements.some(a => a.id === ach.id);
                if (ach.id === 'level-2' && userState.level >= 2) isUnlocked = true;
                if (ach.id === 'level-3' && userState.level >= 3) isUnlocked = true;
                if (ach.id === 'streak-3' && userState.streak >= 3) isUnlocked = true;

                const AchIcon = ach.icon;

                return (
                  <div 
                    key={ach.id} 
                    style={{ 
                      padding: '13px 15px', 
                      display: 'flex', 
                      gap: '14px', 
                      alignItems: 'center',
                      opacity: isUnlocked ? 1 : 0.35,
                      borderRadius: '8px',
                      border: isUnlocked ? '1px solid var(--color-success)' : '1px solid var(--glass-border)',
                      background: '#121214',
                      transition: 'var(--transition-spring)'
                    }}
                    onMouseEnter={(e) => { if (isUnlocked) e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '6px',
                      background: isUnlocked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.01)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isUnlocked ? 'var(--color-success)' : 'var(--text-muted)',
                      border: isUnlocked ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid #1e1e22',
                      boxShadow: 'none'
                    }}>
                      <AchIcon size={16} />
                    </div>
                    <div>
                      <h5 style={{ fontSize: '13px', fontWeight: 'bold', color: isUnlocked ? '#ffffff' : 'var(--text-secondary)' }}>
                        {ach.title}
                      </h5>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{ach.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};
