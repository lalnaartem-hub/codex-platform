import React, { useState, useEffect } from 'react';
import { useCodex } from '../context/CodexContext';
import { Layout as LayoutIcon, Terminal, Database, Cpu, Coffee, Play, BookOpen } from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal';
import { TiltCard } from '../components/TiltCard';

const CATEGORY_ICONS = {
  'Layout': LayoutIcon,
  'Terminal': Terminal,
  'Database': Database,
  'Cpu': Cpu,
  'Coffee': Coffee
};

const CODE_SNIPPETS = {
  HTML: `<!-- Создание карточки профиля -->
<div class="user-card">
  <img src="avatar.png" alt="Developer" />
  <h2>Alex Coder</h2>
  <span class="badge">Pro</span>
</div>`,
  Python: `# Функция для расчета опыта студента
def calculate_rewards(xp, multiplier):
    base_xp = xp * 10
    total_xp = base_xp * multiplier
    print(f"Награда: {total_xp} XP")
    return total_xp`,
  SQL: `-- Выборка активных курсов ученика
SELECT title, difficulty, xp_reward
FROM courses
WHERE difficulty = 'Средний'
ORDER BY xp_reward DESC;`,
  'C++': `// Решение задачи на нахождение факториала
#include <iostream>

long long factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}`
};

export const LandingPage = ({ setCurrentView }) => {
  const { courses, selectCourse, userState } = useCodex();
  const [activeTab, setActiveTab] = useState('All');
  
  // Вкладка интерактивного терминала
  const [selectedTerminalTab, setSelectedTerminalTab] = useState('HTML');
  const [typedCode, setTypedCode] = useState('');

  useEffect(() => {
    let index = 0;
    const currentCode = CODE_SNIPPETS[selectedTerminalTab];
    setTypedCode('');
    
    const interval = setInterval(() => {
      setTypedCode(currentCode.slice(0, index));
      index++;
      if (index > currentCode.length) {
        clearInterval(interval);
      }
    }, 15);
    return () => {
      clearInterval(interval);
    };
  }, [selectedTerminalTab]);

  const handleStartCourse = async (courseId) => {
    await selectCourse(courseId);
    setCurrentView('sandbox');
  };

  const filteredCourses = courses.filter(course => {
    if (activeTab === 'All') return true;
    return course.category === activeTab;
  });

  return (
    <div className="page-fade" style={{ padding: '60px 24px', position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Hero Секция (Центрированная, асимметричная структура) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        marginBottom: '90px',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '750px', marginBottom: '40px', position: 'relative', zIndex: 2 }}>
          <ScrollReveal>
            <h1 style={{ fontSize: '46px', fontWeight: '800', lineHeight: '1.15', marginBottom: '20px', letterSpacing: '-1px' }}>
              Освой IT-навыки в <span className="text-glow-gradient">интерактивной песочнице</span> разработки
            </h1>
          </ScrollReveal>
          
          <ScrollReveal delay={100}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '17px', lineHeight: '1.6', marginBottom: '28px' }}>
              Смотри встроенные видеоуроки, пиши реальный код на HTML, Python, SQL, C++, Java прямо в браузере и проверяй его за секунду с помощью нашего умного компилятора и ИИ-помощника.
            </p>
          </ScrollReveal>
          
          <ScrollReveal delay={150}>
            <button 
              className="btn-neon" 
              onClick={() => {
                const el = document.getElementById('courses-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{ fontSize: '15px', padding: '14px 30px' }}
            >
              <Play size={16} fill="black" />
              <span>Каталог курсов</span>
            </button>
          </ScrollReveal>
        </div>

        {/* Широкоэкранный интерактивный терминал с кодом */}
        <ScrollReveal delay={200}>
          <div 
            style={{
              width: '100%',
              minWidth: '320px',
              width: '720px',
              background: '#0c0c0e',
              border: '1px solid var(--glass-border)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
              borderRadius: '8px',
              height: '300px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative',
              zIndex: 2
            }}
          >
            {/* Header вкладки */}
            <div style={{ display: 'flex', background: '#070709', borderBottom: '1px solid var(--glass-border)', padding: '0 12px', height: '36px', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {Object.keys(CODE_SNIPPETS).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setSelectedTerminalTab(lang)}
                    style={{
                      background: selectedTerminalTab === lang ? '#121214' : 'transparent',
                      border: 'none',
                      borderBottom: selectedTerminalTab === lang ? '2px solid var(--color-primary)' : '2px solid transparent',
                      color: selectedTerminalTab === lang ? '#ffffff' : 'var(--text-secondary)',
                      padding: '0 12px',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                      height: '36px',
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    {lang === 'HTML' ? 'index.html' : lang === 'Python' ? 'main.py' : lang === 'SQL' ? 'query.sql' : 'solution.cpp'}
                  </button>
                ))}
              </div>
              
              <div style={{ display: 'flex', gap: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1e1e24' }}></div>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1e1e24' }}></div>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1e1e24' }}></div>
              </div>
            </div>

            <div style={{ padding: '20px', flex: 1, overflow: 'auto', fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: '1.6', textAlign: 'left' }}>
              <pre style={{ color: '#e4e4e7', margin: 0, whiteSpace: 'pre-wrap' }}>
                {typedCode}
                <span style={{ borderLeft: '2px solid var(--color-primary)', marginLeft: '2px', animation: 'blink 1s step-end infinite' }}></span>
              </pre>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Сплит-лейаут каталога (Sidebar-фильтр слева, сетка справа) */}
      <div>
        <ScrollReveal>
          <div style={{ marginBottom: '36px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '6px', letterSpacing: '-0.5px', color: '#ffffff' }}>Программы обучения</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Выберите интересующую технологию для детального освоения.</p>
          </div>
        </ScrollReveal>

        <div id="courses-section" style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          
          {/* Левый фильтр-панель */}
          <div style={{ flex: '1 1 240px', maxWidth: '280px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '96px' }}>
            <ScrollReveal delay={50}>
              <div className="glass-panel" style={{ padding: '16px', background: '#0c0c0e' }}>
                <h4 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Разделы
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {['All', 'Frontend', 'Programming', 'Database'].map(tab => (
                    <button
                      key={tab}
                      className={`btn-glass ${activeTab === tab ? 'active' : ''}`}
                      style={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        padding: '8px 12px',
                        fontSize: '12px',
                        borderRadius: '4px',
                        background: activeTab === tab ? '#27272a' : 'transparent',
                        borderColor: activeTab === tab ? '#3f3f46' : 'transparent',
                        color: activeTab === tab ? '#ffffff' : 'var(--text-secondary)',
                        height: '34px'
                      }}
                      onClick={() => setActiveTab(tab)}
                    >
                      <BookOpen size={12} style={{ marginRight: '8px' }} />
                      <span>{tab === 'All' ? 'Все курсы' : tab}</span>
                    </button>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Статистическая сводка */}
            <ScrollReveal delay={100}>
              <div className="glass-panel" style={{ padding: '16px', background: '#0c0c0e', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Доступно курсов:</span>
                  <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#ffffff', marginTop: '2px' }}>10 модулей</div>
                </div>
                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '10px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Суммарная награда:</span>
                  <div className="text-glow-gradient" style={{ fontWeight: 'bold', fontSize: '15px', marginTop: '2px' }}>+10,000 XP</div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Правая сетка курсов */}
          <div style={{ flex: '3 1 600px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              {filteredCourses.map((course, index) => {
                const IconComponent = CATEGORY_ICONS[course.icon] || Terminal;
                const completed = userState.completedSteps[course.id] || [];
                const isStarted = completed.length > 0;
                const progressPercent = Math.round((completed.length / course.lessonsCount) * 100);

                return (
                  <ScrollReveal key={course.id} delay={(index % 4) * 80}>
                    {/* TiltCard добавляет 3D-вращение за курсором */}
                    <TiltCard className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '340px', height: '100%' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '6px',
                            background: '#070709',
                            border: '1px solid #1e1e22',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isStarted ? 'var(--color-accent)' : 'var(--text-secondary)'
                          }}>
                            <IconComponent size={18} />
                          </div>
                          <div>
                            <span style={{
                              fontSize: '10px',
                              fontWeight: '600',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              background: course.difficulty === 'Легкий' ? 'rgba(16, 185, 129, 0.04)' : 'rgba(37, 99, 235, 0.04)',
                              border: `1px solid ${course.difficulty === 'Легкий' ? 'var(--color-success)' : 'var(--color-accent)'}`,
                              color: course.difficulty === 'Легкий' ? 'var(--color-success)' : '#a5b4fc'
                            }}>
                              {course.difficulty}
                            </span>
                          </div>
                        </div>

                        <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px', color: '#ffffff' }}>{course.title}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.45', marginBottom: '20px' }}>{course.description}</p>
                      </div>

                      <div>
                        {/* Прогресс-бар если курс начат */}
                        {isStarted && (
                          <div style={{ marginBottom: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Прогресс</span>
                              <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{progressPercent}%</span>
                            </div>
                            <div style={{ width: '100%', height: '4px', background: '#09090b', borderRadius: '2px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                              <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--color-accent)' }}></div>
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1e1e22', paddingTop: '14px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Материалы</span>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#e4e4e7' }}>{course.lessonsCount} шагов</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Награда</span>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#e4e4e7' }}>+{course.xpReward} XP</span>
                          </div>
                        </div>

                        <button 
                          className="btn-neon" 
                          onClick={() => handleStartCourse(course.id)}
                          style={{ width: '100%', marginTop: '16px', padding: '9px', fontSize: '12px' }}
                        >
                          <span>{isStarted ? 'Продолжить' : 'Начать обучение'}</span>
                        </button>
                      </div>
                    </TiltCard>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
