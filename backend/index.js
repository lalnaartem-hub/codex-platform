import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Путь к файлу базы данных
const DB_PATH = path.join(__dirname, 'data', 'courses.json');

// Вспомогательная функция для чтения БД
const readDatabase = () => {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return [];
    }
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Ошибка чтения базы данных:', error);
    return [];
  }
};

// 1. Получить список всех курсов (только метаданные для быстрого рендеринга карточек)
app.get('/api/courses', (req, res) => {
  const db = readDatabase();
  const coursesMetadata = db.map(course => ({
    id: course.id,
    title: course.title,
    description: course.description,
    difficulty: course.difficulty,
    category: course.category,
    icon: course.icon,
    lessonsCount: course.steps.length,
    xpReward: course.xpReward
  }));
  res.json(coursesMetadata);
});

// 2. Получить структуру конкретного курса (список шагов без тяжелых деталей)
app.get('/api/courses/:courseId', (req, res) => {
  const db = readDatabase();
  const course = db.find(c => c.id === req.params.courseId);
  
  if (!course) {
    return res.status(404).json({ error: 'Курс не найден' });
  }

  // Возвращаем курс со списком шагов (вырезая тяжелую теорию/тесты для оптимизации сетевого трафика)
  const courseOutline = {
    ...course,
    steps: course.steps.map((step, idx) => ({
      id: step.id,
      type: step.type,
      title: step.title,
      index: idx
    }))
  };

  res.json(courseOutline);
});

// 3. Получить детали конкретного шага (ленивая загрузка теории/видео/валидации)
app.get('/api/courses/:courseId/steps/:stepId', (req, res) => {
  const db = readDatabase();
  const course = db.find(c => c.id === req.params.courseId);
  
  if (!course) {
    return res.status(404).json({ error: 'Курс не найден' });
  }

  const step = course.steps.find(s => s.id === req.params.stepId);
  if (!step) {
    return res.status(404).json({ error: 'Шаг не найден' });
  }

  res.json(step);
});

// Раздача статических файлов фронтенда в продакшене (после API-роутов)
const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер Codex успешно запущен на порту ${PORT}`);
});
