import React, { createContext, useState, useEffect, useContext } from 'react';

const CodexContext = createContext();

const API_BASE = window.location.origin.includes('localhost') 
  ? 'http://localhost:5000/api' 
  : '/api';

export const useCodex = () => useContext(CodexContext);

export const CodexProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeCourseDetail, setActiveCourseDetail] = useState(null);
  const [activeStep, setActiveStep] = useState(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Состояние авторизации пользователя (Google Auth)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('codex-user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email, name) => {
    const userData = { email, name, avatar: name.charAt(0).toUpperCase() };
    setUser(userData);
    localStorage.setItem('codex-user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('codex-user');
  };

  // Пользовательское состояние обучения
  const [userState, setUserState] = useState(() => {
    const saved = localStorage.getItem('codex-user-state');
    return saved ? JSON.parse(saved) : {
      xp: 0,
      level: 1,
      streak: 1,
      lastActive: new Date().toDateString(),
      completedSteps: {}, // { courseId: [stepId1, stepId2] }
      unlockedAchievements: []
    };
  });

  // История чата ИИ для текущего урока
  const [aiChatHistory, setAiChatHistory] = useState([]);
  const [aiThinking, setAiThinking] = useState(false);

  // Синхронизация состояния пользователя с localStorage
  useEffect(() => {
    localStorage.setItem('codex-user-state', JSON.stringify(userState));
  }, [userState]);

  // Загрузка метаданных всех курсов при запуске
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${API_BASE}/courses`);
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error('Ошибка загрузки курсов с бэкенда:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Выбор курса и загрузка его очертания
  const selectCourse = async (courseId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/courses/${courseId}`);
      const data = await res.json();
      setActiveCourse(data);
      setActiveCourseDetail(data);

      // Определяем, на каком шаге остановился пользователь
      const completed = userState.completedSteps[courseId] || [];
      let nextStepIdx = 0;
      
      // Находим первый незавершенный шаг
      for (let i = 0; i < data.steps.length; i++) {
        if (!completed.includes(data.steps[i].id)) {
          nextStepIdx = i;
          break;
        }
      }
      
      // Если все завершены, открываем последний
      if (completed.length === data.steps.length) {
        nextStepIdx = data.steps.length - 1;
      }

      await loadStep(courseId, data.steps[nextStepIdx].id, nextStepIdx);
    } catch (err) {
      console.error('Ошибка загрузки деталей курса:', err);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка деталей конкретного шага (ленивая загрузка)
  const loadStep = async (courseId, stepId, index) => {
    try {
      const res = await fetch(`${API_BASE}/courses/${courseId}/steps/${stepId}`);
      const stepData = await res.json();
      setActiveStep(stepData);
      setActiveStepIndex(index);
      setAiChatHistory([
        {
          sender: 'ai',
          text: `Привет! Я твой ИИ-наставник по курсу "${activeCourseDetail?.title || ''}". Сейчас мы разбираем: "${stepData.title}". Если возникнут сложности или вопросы — просто напиши мне!`
        }
      ]);
    } catch (err) {
      console.error('Ошибка загрузки шага:', err);
    }
  };

  // Переход на следующий шаг
  const nextStep = async () => {
    if (!activeCourseDetail || activeStepIndex >= activeCourseDetail.steps.length - 1) return;
    const nextIdx = activeStepIndex + 1;
    const nextStepInfo = activeCourseDetail.steps[nextIdx];
    await loadStep(activeCourseDetail.id, nextStepInfo.id, nextIdx);
  };

  // Переход на предыдущий шаг
  const prevStep = async () => {
    if (activeStepIndex <= 0) return;
    const prevIdx = activeStepIndex - 1;
    const prevStepInfo = activeCourseDetail.steps[prevIdx];
    await loadStep(activeCourseDetail.id, prevStepInfo.id, prevIdx);
  };

  // Завершение текущего шага
  const completeStep = (stepId) => {
    const courseId = activeCourseDetail.id;
    const currentCompleted = userState.completedSteps[courseId] || [];
    
    if (currentCompleted.includes(stepId)) return; // Уже пройден

    const updatedCompleted = [...currentCompleted, stepId];
    
    // Начисление XP (+50 за видео, +100 за задачу)
    const xpEarned = activeStep.type === 'video' ? 50 : 100;
    let newXp = userState.xp + xpEarned;
    let newLevel = userState.level;
    
    // Формула уровней: каждый уровень требует level * 1000 XP
    const xpNeeded = newLevel * 1000;
    if (newXp >= xpNeeded) {
      newXp -= xpNeeded;
      newLevel += 1;
      // Добавляем ачивку за уровень
      triggerAchievement(`level-${newLevel}`, `Достигнут уровень ${newLevel}`);
    }

    // Проверка streak (серии дней)
    let newStreak = userState.streak;
    const today = new Date().toDateString();
    if (userState.lastActive !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (userState.lastActive === yesterday.toDateString()) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }

    // Триггер базовых ачивок
    if (updatedCompleted.length === 1 && !userState.unlockedAchievements.includes('first-lesson')) {
      triggerAchievement('first-lesson', 'Первый шаг в ИТ');
    }

    setUserState(prev => ({
      ...prev,
      xp: newXp,
      level: newLevel,
      streak: newStreak,
      lastActive: today,
      completedSteps: {
        ...prev.completedSteps,
        [courseId]: updatedCompleted
      }
    }));
  };

  // Разблокировать ачивку
  const triggerAchievement = (id, title) => {
    setUserState(prev => {
      if (prev.unlockedAchievements.some(a => a.id === id)) return prev;
      return {
        ...prev,
        unlockedAchievements: [...prev.unlockedAchievements, { id, title, date: new Date().toLocaleDateString() }]
      };
    });
  };

  // Задать вопрос ИИ-тьютору
  const askAI = async (userMessage, currentCode = '') => {
    if (!userMessage.trim()) return;
    
    // Добавляем сообщение пользователя в чат
    const newUserHistory = [...aiChatHistory, { sender: 'user', text: userMessage }];
    setAiChatHistory(newUserHistory);
    setAiThinking(true);

    // Симулируем интеллектуальный ответ ИИ с таймаутом
    setTimeout(() => {
      let aiResponse = '';
      const stepType = activeStep?.type;
      const stepTitle = activeStep?.title;
      
      // Генерация реалистичного ответа на основе контекста
      if (currentCode) {
        if (activeCourseDetail.id.includes('html')) {
          if (!currentCode.includes('h2') && activeStep.validation?.rules?.[1]) {
            aiResponse = `В твоем коде я не вижу тега <h2>. В задании требуется поместить заголовок h2 с текстом "Раздел ${activeStep.id.split('-').pop()}". Попробуй добавить \`<h2>Раздел ...</h2>\` внутрь твоего блока \`div\`.`;
          } else {
            aiResponse = `Твой HTML/CSS код выглядит неплохо. Убедись, что все теги закрыты и классы написаны без опечаток. Нажми кнопку "Запустить и Проверить", чтобы посмотреть тесты!`;
          }
        } else if (activeCourseDetail.id.includes('python')) {
          if (!currentCode.includes('def calculate_') && stepType === 'task') {
            aiResponse = `Для решения этой задачи тебе нужно объявить функцию с именем \`calculate_${activeStep.id.split('-').pop()}(a, b)\` с помощью ключевого слова \`def\`. Не забудь про двоеточие в конце строки и отступы!`;
          } else if (currentCode.includes('pass')) {
            aiResponse = `Вижу, что функция объявлена, но внутри нее всё еще написано \`pass\`. Замени \`pass\` на возврат результата с помощью \`return a + b\` (или умножения \`a * b\` в зависимости от задания).`;
          } else {
            aiResponse = `Отличная попытка! Попробуй запустить тесты. Если они упадут, проверь правильность возвращаемого значения. Я готов помочь доработать код!`;
          }
        } else if (activeCourseDetail.id.includes('sql')) {
          if (!currentCode.toLowerCase().includes('select')) {
            aiResponse = `В SQL выборка данных всегда начинается с оператора \`SELECT\`. Тебе нужно выбрать столбцы \`name\` и \`age\`. Попробуй написать \`SELECT name, age FROM users\`.`;
          } else if (!currentCode.toLowerCase().includes('where')) {
            aiResponse = `Ты выбрал столбцы, но забыл отфильтровать пользователей по возрасту. Добавь условие \`WHERE age > ...\`, чтобы отсечь пользователей моложе нужного возраста.`;
          } else {
            aiResponse = `Запрос почти готов. Проверь синтаксис оператора \`WHERE\` и названия столбцов. Запусти тесты, чтобы увидеть результат выполнения SELECT на базе данных!`;
          }
        } else {
          aiResponse = `Для языков C++ и Java обрати внимание на правильное объявление типов переменных и завершение строк точкой с запятой \`;\`. Проверь, выводится ли результат в консоль с помощью std::cout или System.out.println.`;
        }
      } else {
        aiResponse = `Лекция на тему "${stepTitle}" очень важна. Мы разбираем базовые принципы. Рассказать подробнее про ключевые моменты или у тебя есть конкретный вопрос по теории?`;
      }

      setAiChatHistory(prev => [...prev, { sender: 'ai', text: aiResponse }]);
      setAiThinking(false);
    }, 1500);
  };

  return (
    <CodexContext.Provider value={{
      courses,
      activeCourse,
      activeCourseDetail,
      activeStep,
      activeStepIndex,
      loading,
      userState,
      aiChatHistory,
      aiThinking,
      user,
      login,
      logout,
      selectCourse,
      loadStep,
      nextStep,
      prevStep,
      completeStep,
      askAI,
      resetProgress: () => {
        setUserState({
          xp: 0,
          level: 1,
          streak: 1,
          lastActive: new Date().toDateString(),
          completedSteps: {},
          unlockedAchievements: []
        });
      }
    }}>
      {children}
    </CodexContext.Provider>
  );
};
