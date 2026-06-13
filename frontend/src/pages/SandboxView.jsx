import React, { useState, useEffect, useRef } from 'react';
import { useCodex } from '../context/CodexContext';
import { ResizableSplitter as Resizable } from '../components/ResizablePanels';
import { Play, CheckCircle2, ChevronRight, HelpCircle, Send, Sparkles, Terminal as TermIcon, FileCode, Check, X, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SandboxView = ({ setCurrentView }) => {
  const { 
    activeCourseDetail, 
    activeStep, 
    activeStepIndex, 
    userState, 
    aiChatHistory, 
    aiThinking,
    loadStep,
    nextStep,
    prevStep,
    completeStep,
    askAI 
  } = useCodex();

  const [code, setCode] = useState('');
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [activeTab, setActiveTab] = useState('preview'); // preview | tests
  const [hintIndex, setHintIndex] = useState(-1);
  const [chatInput, setChatInput] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  
  // Состояния видео-плеера и тестов
  const [playVideo, setPlayVideo] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  
  // Вкладки левой панели для задач (task | theory | hints)
  const [leftTab, setLeftTab] = useState('task');

  // Состояния для мобильной адаптивности
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileTab, setMobileTab] = useState('lesson'); // lesson | editor | result | chat
  
  const iframeRef = useRef(null);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Сброс состояния при смене шага
  useEffect(() => {
    if (activeStep) {
      setCode(activeStep.startingCode || '');
      setConsoleLogs([]);
      setTestResults([]);
      setIsValidated(false);
      setHintIndex(-1);
      setPlayVideo(false);
      setIsRunningTests(false);
      setLeftTab('task'); // Сбрасываем левую вкладку на "Задание"
      setMobileTab('lesson'); // Сбрасываем вкладку мобильного интерфейса на урок
      
      const courseId = activeCourseDetail.id;
      const completed = userState.completedSteps[courseId] || [];
      if (completed.includes(activeStep.id)) {
        setIsValidated(true);
      }
    }
  }, [activeStep, activeCourseDetail, userState]);

  // Автоскролл чата ИИ
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiChatHistory]);

  if (!activeStep) return <div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Загрузка урока...</div>;

  // Виртуальный SQL-клиент
  const executeVirtualSQL = (query) => {
    const mockUsers = [
      { id: 1, name: 'Алексей', age: 18, email: 'alex@codex.ru' },
      { id: 2, name: 'Мария', age: 25, email: 'maria@codex.ru' },
      { id: 3, name: 'Иван', age: 35, email: 'ivan@codex.ru' },
      { id: 4, name: 'Ольга', age: 48, email: 'olga@codex.ru' },
      { id: 5, name: 'Дмитрий', age: 60, email: 'dmitry@codex.ru' }
    ];

    try {
      const cleanQuery = query.toLowerCase().replace(/\s+/g, ' ').trim();
      if (!cleanQuery.includes('select')) {
        return { error: 'Ошибка синтаксиса: Запрос должен начинаться с SELECT.' };
      }

      const selectMatch = cleanQuery.match(/select\s+(.*?)\s+from/);
      if (!selectMatch) return { error: 'Ошибка синтаксиса: Не найден оператор FROM.' };
      
      const cols = selectMatch[1].split(',').map(c => c.trim());
      
      let filtered = [...mockUsers];
      
      if (cleanQuery.includes('where')) {
        let wherePart = cleanQuery.split('where')[1].trim();
        if (wherePart.includes('order by')) {
          wherePart = wherePart.split('order by')[0].trim();
        }
        
        const cmpMatch = wherePart.match(/(\w+)\s*(=|>|<|>=|<=|!=)\s*(\d+|'[^']+'|"[^"]+")/);
        if (cmpMatch) {
          const field = cmpMatch[1].trim();
          const op = cmpMatch[2];
          let val = cmpMatch[3].trim();
          
          if (val.startsWith("'") || val.startsWith('"')) {
            val = val.slice(1, -1);
          } else {
            val = parseInt(val);
          }

          filtered = filtered.filter(u => {
            const userVal = u[field];
            if (userVal === undefined) return false;
            
            if (op === '=') return userVal === val;
            if (op === '>') return userVal > val;
            if (op === '<') return userVal < val;
            if (op === '>=') return userVal >= val;
            if (op === '<=') return userVal <= val;
            if (op === '!=') return userVal !== val;
            return false;
          });
        }
      }

      if (cleanQuery.includes('order by')) {
        const orderByPart = cleanQuery.split('order by')[1].trim();
        const tokens = orderByPart.split(' ');
        const field = tokens[0].trim();
        const isDesc = tokens[1] === 'desc';

        filtered.sort((a, b) => {
          const valA = a[field];
          const valB = b[field];
          if (valA === undefined || valB === undefined) return 0;
          if (valA < valB) return isDesc ? 1 : -1;
          if (valA > valB) return isDesc ? -1 : 1;
          return 0;
        });
      }

      const rows = filtered.map(u => {
        const obj = {};
        cols.forEach(col => {
          if (col === '*') {
            Object.assign(obj, u);
          } else if (u[col] !== undefined) {
            obj[col] = u[col];
          }
        });
        return obj;
      });

      return { rows };
    } catch (err) {
      return { error: `Ошибка выполнения SQL: ${err.message}` };
    }
  };

  // Движок запуска и проверки кода с симуляцией терминала
  const handleRunCode = () => {
    if (isRunningTests) return;

    if (isMobile) {
      setMobileTab('result');
    }

    setIsRunningTests(true);
    setActiveTab('preview');
    setConsoleLogs(['[system] Инициализация компилятора...', '']);

    setTimeout(() => {
      setConsoleLogs(prev => [...prev, '[compiler] Проверка синтаксиса исходного кода... OK']);
    }, 150);

    setTimeout(() => {
      setConsoleLogs(prev => [...prev, '[compiler] Сборка тестового окружения... OK', '']);
    }, 350);

    setTimeout(() => {
      setIsRunningTests(false);
      runActualValidation();
    }, 600);
  };

  const runActualValidation = () => {
    const valType = activeStep.validation?.type;
    const rules = activeStep.validation?.rules || [];
    const testSuite = activeStep.validation?.testCases || [];
    let tests = [];
    let passedCount = 0;

    if (valType === 'html') {
      const docStr = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>body { font-family: sans-serif; color: #fff; margin: 10px; }</style>
        </head>
        <body>
          ${code}
        </body>
        </html>
      `;
      
      if (iframeRef.current) {
        iframeRef.current.srcdoc = docStr;
      }

      setTimeout(() => {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(code, 'text/html');
          
          rules.forEach((rule, idx) => {
            const el = doc.querySelector(rule.selector);
            let passed = false;
            
            if (el) {
              if (rule.text) {
                passed = el.textContent.trim().toLowerCase().includes(rule.text.toLowerCase());
              } else {
                passed = true;
              }
            }

            tests.push({
              id: idx,
              name: rule.message,
              passed
            });
          });

          passedCount = tests.filter(t => t.passed).length;
          setTestResults(tests);
          setActiveTab('tests');

          if (passedCount === rules.length && rules.length > 0) {
            setConsoleLogs(prev => [...prev, '> Тесты пройдены успешно.', '> Рендеринг превью завершен.']);
            triggerSuccess();
          } else {
            setConsoleLogs(prev => [...prev, `❌ Ошибка: Пройдено ${passedCount} из ${rules.length} тестов.`]);
          }
        } catch (err) {
          setConsoleLogs(prev => [...prev, `❌ Критическая ошибка: ${err.message}`]);
        }
      }, 100);

    } else if (valType === 'python') {
      try {
        const funcName = activeStep.validation?.functionName;
        let jsLines = [];
        const pyLines = code.split('\n');
        let indentStack = [0];
        
        pyLines.forEach(line => {
          if (!line.trim() || line.trim().startsWith('#')) {
            jsLines.push(line);
            return;
          }

          const indent = line.search(/\S/);
          
          while (indent < indentStack[indentStack.length - 1]) {
            indentStack.pop();
            jsLines.push(' '.repeat(indentStack[indentStack.length - 1]) + '}');
          }

          let cleanLine = line.trim();
          
          if (cleanLine.startsWith('def ')) {
            const defMatch = cleanLine.match(/def\s+(\w+)\s*\((.*?)\)\s*:/);
            if (defMatch) {
              const name = defMatch[1];
              const args = defMatch[2];
              jsLines.push(' '.repeat(indent) + `function ${name}(${args}) {`);
              indentStack.push(indent + 4);
              return;
            }
          }
          
          if (cleanLine.startsWith('if ') && cleanLine.endsWith(':')) {
            const cond = cleanLine.slice(3, -1);
            jsLines.push(' '.repeat(indent) + `if (${cond}) {`);
            indentStack.push(indent + 4);
            return;
          }
          if (cleanLine.startsWith('elif ') && cleanLine.endsWith(':')) {
            const cond = cleanLine.slice(5, -1);
            jsLines.push(' '.repeat(indent) + `} else if (${cond}) {`);
            indentStack.push(indent + 4);
            return;
          }
          if (cleanLine === 'else:') {
            jsLines.push(' '.repeat(indent) + `} else {`);
            indentStack.push(indent + 4);
            return;
          }

          cleanLine = cleanLine
            .replace(/\bTrue\b/g, 'true')
            .replace(/\bFalse\b/g, 'false')
            .replace(/\bNone\b/g, 'null')
            .replace(/\band\b/g, '&&')
            .replace(/\bor\b/g, '||')
            .replace(/\bnot\b/g, '!')
            .replace(/\bpass\b/g, '');
            
          jsLines.push(' '.repeat(indent) + cleanLine);
        });

        while (indentStack.length > 1) {
          indentStack.pop();
          jsLines.push(' '.repeat(indentStack[indentStack.length - 1]) + '}');
        }

        const jsCode = jsLines.join('\n');
        const userFn = new Function(`
          ${jsCode}
          return typeof ${funcName} !== "undefined" ? ${funcName} : null;
        `)();

        if (!userFn) {
          throw new Error(`Python-функция "${funcName}" не найдена. Убедитесь, что вы объявили её правильно.`);
        }

        testSuite.forEach((tc, idx) => {
          const res = userFn(...tc.input);
          const passed = res === tc.expected;
          tests.push({
            id: idx,
            name: `Тест ${idx + 1}: вызов ${funcName}(${tc.input.join(', ')})`,
            passed,
            expected: tc.expected,
            actual: res
          });
        });

        passedCount = tests.filter(t => t.passed).length;
        setTestResults(tests);
        setActiveTab('tests');

        if (passedCount === testSuite.length && testSuite.length > 0) {
          setConsoleLogs(prev => [...prev, '⚡ Тесты пройдены! Результаты верны.', '> Выполнено успешно.']);
          triggerSuccess();
        } else {
          setConsoleLogs(prev => [...prev, `❌ Ошибка: Тесты провалены (${passedCount} из ${testSuite.length} пройдено)`]);
        }
      } catch (err) {
        setConsoleLogs(prev => [...prev, `❌ Ошибка интерпретатора:\n${err.message}`]);
        setTestResults([{ id: 0, name: 'Компиляция кода', passed: false, error: err.message }]);
        setActiveTab('tests');
      }

    } else if (valType === 'sql') {
      const result = executeVirtualSQL(code);
      if (result.error) {
        setConsoleLogs(prev => [...prev, result.error]);
        setTestResults([{ id: 0, name: 'Синтаксис SQL', passed: false, error: result.error }]);
        setActiveTab('tests');
      } else {
        setConsoleLogs(prev => [...prev, `> Выбрано строк: ${result.rows.length}`, JSON.stringify(result.rows, null, 2)]);
        
        const expected = executeVirtualSQL(activeStep.validation.expectedResultQuery);
        const passed = JSON.stringify(result.rows) === JSON.stringify(expected.rows);
        
        tests.push({
          id: 0,
          name: 'Полученные строки соответствуют заданию',
          passed,
          expected: expected.rows,
          actual: result.rows
        });
        
        setTestResults(tests);
        setActiveTab('tests');
        
        if (passed) {
          triggerSuccess();
        } else {
          setConsoleLogs(prev => [...prev, '❌ Результат выборки не совпадает с ожидаемым. Проверьте условия WHERE или ORDER BY.']);
        }
      }

    } else if (valType === 'cpp' || valType === 'java') {
      try {
        let hasError = false;
        rules.forEach((rule, idx) => {
          const pattern = new RegExp(rule.pattern);
          const passed = pattern.test(code);
          if (!passed) hasError = true;
          
          tests.push({
            id: idx,
            name: rule.message,
            passed
          });
        });

        setTestResults(tests);
        setActiveTab('tests');

        if (!hasError) {
          setConsoleLogs(prev => [
            ...prev,
            `[compiler] Компиляция target.src...`,
            `[compiler] Сборка и линковка исполняемого файла...`,
            `> Вывод программы: ${activeStep.validation.expectedOutput}`,
            `\nПроцесс завершен с кодом возврата 0`
          ]);
          triggerSuccess();
        } else {
          setConsoleLogs(prev => [
            ...prev,
            `❌ Ошибка сборки: код не удовлетворяет спецификации задачи.`
          ]);
        }
      } catch (err) {
        setConsoleLogs(prev => [...prev, `❌ Ошибка компилятора: ${err.message}`]);
      }
    }
  };

  const triggerSuccess = () => {
    confetti({
      particleCount: 60,
      spread: 45,
      origin: { y: 0.8 },
      colors: ['#6366f1', '#10b981', '#ffffff']
    });
    setIsValidated(true);
    completeStep(activeStep.id);
  };

  const getLineNumbers = () => {
    const lines = code.split('\n').length;
    return Array.from({ length: Math.max(lines, 1) }, (_, i) => i + 1).join('\n');
  };

  if (isMobile) {
    return (
      <div className="sandbox-mobile-container page-fade">
        {/* Mobile Tab Bar */}
        <div className="sandbox-mobile-tabs">
          <button 
            className={`sandbox-mobile-tab ${mobileTab === 'lesson' ? 'active' : ''}`}
            onClick={() => setMobileTab('lesson')}
          >
            📖 Урок
          </button>
          <button 
            className={`sandbox-mobile-tab ${mobileTab === 'editor' ? 'active' : ''}`}
            onClick={() => setMobileTab('editor')}
          >
            💻 Редактор
          </button>
          <button 
            className={`sandbox-mobile-tab ${mobileTab === 'result' ? 'active' : ''}`}
            onClick={() => setMobileTab('result')}
          >
            🚀 Результат
          </button>
          <button 
            className={`sandbox-mobile-tab ${mobileTab === 'chat' ? 'active' : ''}`}
            onClick={() => setMobileTab('chat')}
          >
            💬 Чат
          </button>
        </div>

        {/* Mobile Active Content Area */}
        <div className="sandbox-mobile-content">
          {mobileTab === 'lesson' && (
            <div className="sandbox-mobile-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', background: '#0c0c0e' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px', background: '#070709', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', fontFamily: 'var(--font-mono)' }}>
                  {activeStep.type === 'video' ? 'LECTURE' : 'PRACTICE'}
                </span>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#ffffff' }}>{activeStep.title}</h3>

              {/* Если это видеоурок */}
              {activeStep.type === 'video' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--glass-border)', position: 'relative', background: '#000' }}>
                    {playVideo ? (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${activeStep.youtubeId}?rel=0&modestbranding=1&autoplay=1`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        style={{ width: '100%', height: '100%', border: 'none' }}
                      />
                    ) : (
                      <div 
                        style={{ width: '100%', height: '100%', position: 'relative', cursor: 'pointer' }}
                        onClick={() => setPlayVideo(true)}
                      >
                        <img 
                          src={`https://img.youtube.com/vi/${activeStep.youtubeId}/hqdefault.jpg`} 
                          alt="Video preview" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
                        />
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(0,0,0,0.3)'
                        }}>
                          <div 
                            style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: '50%',
                              background: 'rgba(255, 255, 255, 0.1)',
                              backdropFilter: 'blur(8px)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                              transition: 'var(--transition-spring)'
                            }}
                          >
                            <Play size={20} fill="white" color="white" style={{ marginLeft: '3px' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <a 
                    href={`https://www.youtube.com/watch?v=${activeStep.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-glass"
                    style={{ textDecoration: 'none', justifyContent: 'center', gap: '8px', fontSize: '12px', padding: '8px' }}
                  >
                    <ExternalLink size={12} />
                    <span>Смотреть на YouTube</span>
                  </a>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5' }}>
                    {activeStep.description}
                  </p>
                  <button 
                    className="btn-neon"
                    onClick={() => {
                      completeStep(activeStep.id);
                      setIsValidated(true);
                    }}
                    style={{ marginTop: '6px', padding: '10px', fontSize: '13px' }}
                  >
                    <CheckCircle2 size={14} />
                    <span>Отметить как выполненный</span>
                  </button>
                </div>
              ) : (
                /* Вкладки для практической задачи */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                  
                  {/* Левый переключатель вкладок */}
                  <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', gap: '4px', marginBottom: '8px' }}>
                    {['task', 'theory', 'hints'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setLeftTab(tab)}
                        style={{
                          background: leftTab === tab ? 'rgba(255,255,255,0.03)' : 'transparent',
                          border: 'none',
                          borderBottom: leftTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
                          color: leftTab === tab ? '#ffffff' : 'var(--text-secondary)',
                          padding: '8px 12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'var(--transition-smooth)'
                        }}
                      >
                        {tab === 'task' ? 'Задание' : tab === 'theory' ? 'Теория' : 'Подсказки'}
                      </button>
                    ))}
                  </div>

                  {/* Вкладка: Задание */}
                  {leftTab === 'task' && (
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', color: '#ffffff' }}>
                        <Sparkles size={14} style={{ color: 'var(--color-secondary)' }} />
                        Задание:
                      </h4>
                      <p style={{ color: '#ffffff', fontSize: '13px', lineHeight: '1.5', background: 'rgba(99, 102, 241, 0.02)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
                        {activeStep.instructions}
                      </p>
                    </div>
                  )}

                  {/* Вкладка: Теория */}
                  {leftTab === 'theory' && (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5', background: '#121214', padding: '14px', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                      <h4 style={{ color: '#ffffff', marginBottom: '6px', fontWeight: 'bold', fontSize: '13px' }}>Теоретическая справка:</h4>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{activeStep.theory}</p>
                    </div>
                  )}

                  {/* Вкладка: Подсказки */}
                  {leftTab === 'hints' && (
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px', color: '#ffffff' }}>Подсказки к решению:</h4>
                      {activeStep.hints && activeStep.hints.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {activeStep.hints.map((hint, idx) => (
                            <div key={idx} style={{ padding: '10px', borderRadius: '6px', background: '#121214', border: '1px solid #1e1e22', fontSize: '12px', color: '#fbbf24' }}>
                              <strong>Подсказка {idx + 1}:</strong> {hint}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Для этого шага подсказок нет.</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Навигация по урокам */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
                <button className="btn-glass" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={prevStep} disabled={activeStepIndex === 0}>Назад</button>
                <button 
                  className="btn-neon" 
                  onClick={nextStep} 
                  disabled={!isValidated || activeStepIndex >= activeCourseDetail.steps.length - 1}
                  style={{ padding: '6px 16px', fontSize: '12px' }}
                >
                  <span>Далее</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {mobileTab === 'editor' && (
            <div className="code-editor-container" style={{ margin: '8px', height: 'calc(100% - 16px)', display: 'flex', flexDirection: 'column' }}>
              <div className="code-editor-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileCode size={14} style={{ color: 'var(--text-secondary)' }} />
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {activeStep.type === 'video' ? 'notes.txt' : `workspace.${activeStep.validation?.type || 'txt'}`}
                  </span>
                </div>
                {activeStep.type === 'task' && (
                  <button 
                    className="btn-neon" 
                    onClick={handleRunCode} 
                    disabled={isRunningTests}
                    style={{ padding: '5px 12px', fontSize: '11px', height: '28px' }}
                  >
                    <Play size={10} fill="white" />
                    <span>Запустить тесты</span>
                  </button>
                )}
              </div>
              <div className="editor-workspace" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <pre className="line-numbers">{getLineNumbers()}</pre>
                <textarea
                  className="editor-textarea"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="// Пишите код здесь..."
                  spellCheck="false"
                />
              </div>
            </div>
          )}

          {mobileTab === 'result' && (
            <div style={{ margin: '8px', height: 'calc(100% - 16px)', background: '#09090b', borderRadius: '8px', border: '1px solid var(--glass-border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div className="code-editor-header" style={{ height: '36px' }}>
                <div className="code-editor-tabs">
                  <button 
                    className={`code-editor-tab ${activeTab === 'preview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('preview')}
                  >
                    Консоль
                  </button>
                  <button 
                    className={`code-editor-tab ${activeTab === 'tests' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tests')}
                  >
                    Тесты ({testResults.filter(t => t.passed).length}/{testResults.length})
                  </button>
                </div>
              </div>

              <div style={{ flex: 1, position: 'relative', overflow: 'auto', background: '#060608' }}>
                {activeTab === 'preview' ? (
                  activeStep.validation?.type === 'html' ? (
                    <iframe 
                      ref={iframeRef}
                      title="html-preview"
                      style={{ width: '100%', height: '100%', background: '#fff', border: 'none' }}
                    />
                  ) : (
                    <pre style={{ padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#10b981', background: '#060608', height: '100%', margin: 0, overflow: 'auto' }}>
                      {consoleLogs.join('\n') || '> Консоль готова...'}
                    </pre>
                  )
                ) : (
                  /* ТЕСТ-КЕЙСЫ (LeetCode Style) */
                  <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {testResults.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', marginTop: '16px' }}>
                        Нажмите "Запустить тесты" для проверки решения.
                      </div>
                    ) : (
                      testResults.map(tr => (
                        <div 
                          key={tr.id}
                          style={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            padding: '10px 14px',
                            borderRadius: '6px',
                            background: '#0c0c0e',
                            border: `1px solid ${tr.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                            gap: '6px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {tr.passed ? (
                                <Check size={14} style={{ color: 'var(--color-success)' }} />
                              ) : (
                                <X size={14} style={{ color: 'var(--color-danger)' }} />
                              )}
                              <span style={{ fontSize: '12px', fontWeight: '500', color: tr.passed ? '#a7f3d0' : '#fca5a5', fontFamily: 'var(--font-mono)' }}>
                                {tr.name}
                              </span>
                            </div>
                            <span style={{ fontSize: '9px', fontWeight: 'bold', padding: '2px 5px', borderRadius: '3px', background: tr.passed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: tr.passed ? '#10b981' : '#ef4444' }}>
                              {tr.passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </div>
                          
                          {/* Сравнительная таблица ожидаемого/полученного */}
                          {(tr.expected !== undefined || tr.actual !== undefined) && (
                            <div style={{ 
                              display: 'grid', 
                              gridTemplateColumns: '1fr 1fr', 
                              gap: '12px', 
                              background: '#060608', 
                              padding: '8px', 
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontFamily: 'var(--font-mono)',
                              border: '1px solid var(--glass-border)'
                            }}>
                              <div>
                                <span style={{ color: 'var(--text-muted)' }}>Ожидалось:</span>
                                <pre style={{ margin: '2px 0 0 0', color: '#a1a1aa' }}>{JSON.stringify(tr.expected)}</pre>
                              </div>
                              <div>
                                <span style={{ color: 'var(--text-muted)' }}>Получено:</span>
                                <pre style={{ margin: '2px 0 0 0', color: tr.passed ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                  {tr.actual === undefined ? 'undefined' : JSON.stringify(tr.actual)}
                                </pre>
                              </div>
                            </div>
                          )}
                          {tr.error && (
                            <div style={{ padding: '6px', background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: '4px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#fca5a5' }}>
                              {tr.error}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {mobileTab === 'chat' && (
            <div className="ai-panel" style={{ margin: '8px', height: 'calc(100% - 16px)' }}>
              <div className="code-editor-header" style={{ background: '#0a0a0c', borderBottom: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={14} style={{ color: 'var(--text-secondary)' }} />
                  <span style={{ fontSize: '12px', fontWeight: '600' }}>Ассистент</span>
                </div>
              </div>

              <div className="ai-chat-messages">
                {aiChatHistory.map((msg, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      alignSelf: msg.sender === 'ai' ? 'flex-start' : 'flex-end', 
                      maxWidth: '85%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px', 
                      fontSize: '10px', 
                      color: 'var(--text-muted)',
                      justifyContent: msg.sender === 'ai' ? 'flex-start' : 'flex-end'
                    }}>
                      <span style={{ fontWeight: '600' }}>{msg.sender === 'ai' ? 'CODEX AI' : 'ВЫ'}</span>
                    </div>
                    <div className={`ai-message ${msg.sender}`} style={{ margin: 0 }}>
                      <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{msg.text}</p>
                    </div>
                  </div>
                ))}
                {aiThinking && (
                  <div style={{ alignSelf: 'flex-start', maxWidth: '85%', display: 'flex', flexDirection: 'column', gap: '4px', opacity: 0.7 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--text-muted)' }}>
                      <span style={{ fontWeight: '600' }}>CODEX AI</span>
                    </div>
                    <div className="ai-message ai" style={{ margin: 0 }}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', height: '16px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Анализ кода...</span>
                        <span style={{ display: 'inline-block', width: '3px', height: '3px', borderRadius: '50%', background: '#ffffff', animation: 'blink 1.4s infinite both' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              <form 
                className="ai-input-area"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!chatInput.trim()) return;
                  askAI(chatInput, code);
                  setChatInput('');
                }}
              >
                <input
                  type="text"
                  className="ai-input"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Спросить ассистента..."
                  disabled={aiThinking}
                />
                <button type="submit" className="btn-neon" style={{ padding: '8px 12px', height: '34px', boxShadow: 'none' }} disabled={aiThinking}>
                  <Send size={12} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="sandbox-layout page-fade">
      <Resizable
        left={
          /* ЛЕВАЯ ПАНЕЛЬ: Теория, Видео и Инструкции (Вкладки добавлены) */
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', background: '#0c0c0e', borderRight: '1px solid var(--glass-border)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px', background: '#070709', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', fontFamily: 'var(--font-mono)' }}>
                {activeStep.type === 'video' ? 'LECTURE' : 'PRACTICE'}
              </span>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#ffffff' }}>{activeStep.title}</h3>

            {/* Если это видеоурок */}
            {activeStep.type === 'video' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--glass-border)', position: 'relative', background: '#000' }}>
                  {playVideo ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${activeStep.youtubeId}?rel=0&modestbranding=1&autoplay=1`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      style={{ width: '100%', height: '100%', border: 'none' }}
                    />
                  ) : (
                    <div 
                      style={{ width: '100%', height: '100%', position: 'relative', cursor: 'pointer' }}
                      onClick={() => setPlayVideo(true)}
                    >
                      <img 
                        src={`https://img.youtube.com/vi/${activeStep.youtubeId}/hqdefault.jpg`} 
                        alt="Video preview" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.3)'
                      }}>
                        <div 
                          style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                            transition: 'var(--transition-spring)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                            e.currentTarget.style.background = 'var(--color-accent)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                          }}
                        >
                          <Play size={20} fill="white" color="white" style={{ marginLeft: '3px' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <a 
                  href={`https://www.youtube.com/watch?v=${activeStep.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-glass"
                  style={{ textDecoration: 'none', justifyContent: 'center', gap: '8px', fontSize: '12px', padding: '8px' }}
                >
                  <ExternalLink size={12} />
                  <span>Смотреть на YouTube</span>
                </a>

                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5' }}>
                  {activeStep.description}
                </p>
                <button 
                  className="btn-neon"
                  onClick={() => {
                    completeStep(activeStep.id);
                    setIsValidated(true);
                  }}
                  style={{ marginTop: '6px', padding: '10px', fontSize: '13px' }}
                >
                  <CheckCircle2 size={14} />
                  <span>Отметить как выполненный</span>
                </button>
              </div>
            ) : (
              /* Вкладки для практической задачи */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                
                {/* Левый переключатель вкладок */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', gap: '4px', marginBottom: '8px' }}>
                  {['task', 'theory', 'hints'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setLeftTab(tab)}
                      style={{
                        background: leftTab === tab ? 'rgba(255,255,255,0.03)' : 'transparent',
                        border: 'none',
                        borderBottom: leftTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
                        color: leftTab === tab ? '#ffffff' : 'var(--text-secondary)',
                        padding: '8px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      {tab === 'task' ? 'Задание' : tab === 'theory' ? 'Теория' : 'Подсказки'}
                    </button>
                  ))}
                </div>

                {/* Вкладка: Задание */}
                {leftTab === 'task' && (
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', color: '#ffffff' }}>
                      <Sparkles size={14} style={{ color: 'var(--color-secondary)' }} />
                      Задание:
                    </h4>
                    <p style={{ color: '#ffffff', fontSize: '13px', lineHeight: '1.5', background: 'rgba(99, 102, 241, 0.02)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
                      {activeStep.instructions}
                    </p>
                  </div>
                )}

                {/* Вкладка: Теория */}
                {leftTab === 'theory' && (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5', background: '#121214', padding: '14px', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                    <h4 style={{ color: '#ffffff', marginBottom: '6px', fontWeight: 'bold', fontSize: '13px' }}>Теоретическая справка:</h4>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{activeStep.theory}</p>
                  </div>
                )}

                {/* Вкладка: Подсказки */}
                {leftTab === 'hints' && (
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px', color: '#ffffff' }}>Подсказки к решению:</h4>
                    {activeStep.hints && activeStep.hints.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {activeStep.hints.map((hint, idx) => (
                          <div key={idx} style={{ padding: '10px', borderRadius: '6px', background: '#121214', border: '1px solid #1e1e22', fontSize: '12px', color: '#fbbf24' }}>
                            <strong>Подсказка {idx + 1}:</strong> {hint}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Для этого шага подсказок нет.</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Навигация по урокам */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
              <button className="btn-glass" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={prevStep} disabled={activeStepIndex === 0}>Назад</button>
              <button 
                className="btn-neon" 
                onClick={nextStep} 
                disabled={!isValidated || activeStepIndex >= activeCourseDetail.steps.length - 1}
                style={{ padding: '6px 16px', fontSize: '12px' }}
              >
                <span>Далее</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        }
        right={
          /* ЦЕНТРАЛЬНАЯ И ПРАВАЯ ПАНЕЛИ */
          <Resizable
            left={
              /* ЦЕНТРАЛЬНАЯ ПАНЕЛЬ: Редактор и Консоль */
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Resizable
                  direction="vertical"
                  initialSplit={65}
                  left={
                    /* РЕДАКТОР КОДА */
                    <div className="code-editor-container" style={{ margin: '8px', height: 'calc(100% - 16px)' }}>
                      <div className="code-editor-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileCode size={14} style={{ color: 'var(--text-secondary)' }} />
                          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                            {activeStep.type === 'video' ? 'notes.txt' : `workspace.${activeStep.validation?.type || 'txt'}`}
                          </span>
                        </div>
                        {activeStep.type === 'task' && (
                          <button 
                            className="btn-neon" 
                            onClick={handleRunCode} 
                            disabled={isRunningTests}
                            style={{ padding: '5px 12px', fontSize: '11px', height: '28px' }}
                          >
                            <Play size={10} fill="white" />
                            <span>Запустить тесты</span>
                          </button>
                        )}
                      </div>
                      <div className="editor-workspace">
                        <pre className="line-numbers">{getLineNumbers()}</pre>
                        <textarea
                          className="editor-textarea"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          placeholder="// Пишите код здесь..."
                          spellCheck="false"
                        />
                      </div>
                    </div>
                  }
                  right={
                    /* ПРЕВЬЮ И КОНСОЛЬ */
                    <div style={{ margin: '0 8px 8px 8px', height: 'calc(100% - 8px)', background: '#09090b', borderRadius: '8px', border: '1px solid var(--glass-border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      <div className="code-editor-header" style={{ height: '36px' }}>
                        <div className="code-editor-tabs">
                          <button 
                            className={`code-editor-tab ${activeTab === 'preview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('preview')}
                          >
                            Консоль
                          </button>
                          <button 
                            className={`code-editor-tab ${activeTab === 'tests' ? 'active' : ''}`}
                            onClick={() => setActiveTab('tests')}
                          >
                            Тесты ({testResults.filter(t => t.passed).length}/{testResults.length})
                          </button>
                        </div>
                      </div>

                      <div style={{ flex: 1, position: 'relative', overflow: 'auto', background: '#060608' }}>
                        {activeTab === 'preview' ? (
                          activeStep.validation?.type === 'html' ? (
                            <iframe 
                              ref={iframeRef}
                              title="html-preview"
                              style={{ width: '100%', height: '100%', background: '#fff', border: 'none' }}
                            />
                          ) : (
                            <pre style={{ padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#10b981', background: '#060608', height: '100%', margin: 0, overflow: 'auto' }}>
                              {consoleLogs.join('\n') || '> Консоль готова...'}
                            </pre>
                          )
                        ) : (
                          /* ТЕСТ-КЕЙСЫ (LeetCode Style) */
                          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {testResults.length === 0 ? (
                              <div style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', marginTop: '16px' }}>
                                Нажмите "Запустить тесты" для проверки решения.
                              </div>
                            ) : (
                              testResults.map(tr => (
                                <div 
                                  key={tr.id}
                                  style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    padding: '10px 14px',
                                    borderRadius: '6px',
                                    background: '#0c0c0e',
                                    border: `1px solid ${tr.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                                    gap: '6px'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      {tr.passed ? (
                                        <Check size={14} style={{ color: 'var(--color-success)' }} />
                                      ) : (
                                        <X size={14} style={{ color: 'var(--color-danger)' }} />
                                      )}
                                      <span style={{ fontSize: '12px', fontWeight: '500', color: tr.passed ? '#a7f3d0' : '#fca5a5', fontFamily: 'var(--font-mono)' }}>
                                        {tr.name}
                                      </span>
                                    </div>
                                    <span style={{ fontSize: '9px', fontWeight: 'bold', padding: '2px 5px', borderRadius: '3px', background: tr.passed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: tr.passed ? '#10b981' : '#ef4444' }}>
                                      {tr.passed ? 'PASSED' : 'FAILED'}
                                    </span>
                                  </div>
                                  
                                  {/* Сравнительная таблица ожидаемого/полученного */}
                                  {(tr.expected !== undefined || tr.actual !== undefined) && (
                                    <div style={{ 
                                      display: 'grid', 
                                      gridTemplateColumns: '1fr 1fr', 
                                      gap: '12px', 
                                      background: '#060608', 
                                      padding: '8px', 
                                      borderRadius: '4px',
                                      fontSize: '11px',
                                      fontFamily: 'var(--font-mono)',
                                      border: '1px solid var(--glass-border)'
                                    }}>
                                      <div>
                                        <span style={{ color: 'var(--text-muted)' }}>Ожидалось:</span>
                                        <pre style={{ margin: '2px 0 0 0', color: '#a1a1aa' }}>{JSON.stringify(tr.expected)}</pre>
                                      </div>
                                      <div>
                                        <span style={{ color: 'var(--text-muted)' }}>Получено:</span>
                                        <pre style={{ margin: '2px 0 0 0', color: tr.passed ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                          {tr.actual === undefined ? 'undefined' : JSON.stringify(tr.actual)}
                                        </pre>
                                      </div>
                                    </div>
                                  )}
                                  {tr.error && (
                                    <div style={{ padding: '6px', background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: '4px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#fca5a5' }}>
                                      {tr.error}
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  }
                />
              </div>
            }
            right={
              /* ПРАВАЯ ПАНЕЛИ: ИИ АССИСТЕНТ */
              <div className="ai-panel">
                <div className="code-editor-header" style={{ background: '#0a0a0c', borderBottom: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={14} style={{ color: 'var(--text-secondary)' }} />
                    <span style={{ fontSize: '12px', fontWeight: '600' }}>Ассистент</span>
                  </div>
                </div>

                <div className="ai-chat-messages">
                  {aiChatHistory.map((msg, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        alignSelf: msg.sender === 'ai' ? 'flex-start' : 'flex-end', 
                        maxWidth: '85%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        fontSize: '10px', 
                        color: 'var(--text-muted)',
                        justifyContent: msg.sender === 'ai' ? 'flex-start' : 'flex-end'
                      }}>
                        <span style={{ fontWeight: '600' }}>{msg.sender === 'ai' ? 'CODEX AI' : 'ВЫ'}</span>
                      </div>
                      <div className={`ai-message ${msg.sender}`} style={{ margin: 0 }}>
                        <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  {aiThinking && (
                    <div style={{ alignSelf: 'flex-start', maxWidth: '85%', display: 'flex', flexDirection: 'column', gap: '4px', opacity: 0.7 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--text-muted)' }}>
                        <span style={{ fontWeight: '600' }}>CODEX AI</span>
                      </div>
                      <div className="ai-message ai" style={{ margin: 0 }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', height: '16px' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Анализ кода...</span>
                          <span style={{ display: 'inline-block', width: '3px', height: '3px', borderRadius: '50%', background: '#ffffff', animation: 'blink 1.4s infinite both' }}></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                <form 
                  className="ai-input-area"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!chatInput.trim()) return;
                    askAI(chatInput, code);
                    setChatInput('');
                  }}
                >
                  <input
                    type="text"
                    className="ai-input"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Спросить ассистента..."
                    disabled={aiThinking}
                  />
                  <button type="submit" className="btn-neon" style={{ padding: '8px 12px', height: '34px', boxShadow: 'none' }} disabled={aiThinking}>
                    <Send size={12} />
                  </button>
                </form>
              </div>
            }
          />
        }
      />
    </div>
  );
};
