import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  initDB,
  getAllQuestions,
  bulkAddQuestions,
  getStats,
  updateStats,
  getSettings,
  updateSettings,
  updateProgress,
  getAllProgress,
} from '../lib/db';
import { updateProgressAfterAnswer, selectNextQuestion } from '../lib/spacedRepetition';
import { generatePerformanceReport, type PerformanceReport } from '../lib/reportGenerator';
import type { Question, UserStats, AppSettings, UserProgress } from '../types/question';
import questionsData from '../data/questions.json';

interface AppContextType {
  questions: Question[];
  currentQuestion: Question | null;
  stats: UserStats | null;
  settings: AppSettings | null;
  isLoading: boolean;
  submitAnswer: (answerIndex: number) => Promise<boolean>;
  nextQuestion: () => void;
  updateUserSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  generateReport: () => Promise<PerformanceReport>;
  refreshQuestions: () => Promise<void>;
  questionCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progressMap, setProgressMap] = useState<Map<string, UserProgress>>(new Map());

  useEffect(() => {
    initializeApp();
  }, []);

  async function initializeApp() {
    try {
      await initDB();

      // Load questions
      let loadedQuestions = await getAllQuestions();

      // If no questions in DB, load from JSON
      if (loadedQuestions.length === 0) {
        await bulkAddQuestions(questionsData as Question[]);
        loadedQuestions = questionsData as Question[];
      }

      setQuestions(loadedQuestions);

      // Load stats and settings
      const loadedStats = await getStats();
      const loadedSettings = await getSettings();
      setStats(loadedStats);
      setSettings(loadedSettings);

      // Load all progress
      const allProgress = await getAllProgress();
      const progressMap = new Map(allProgress.map(p => [p.questionId, p]));
      setProgressMap(progressMap);

      // Select first question
      if (loadedQuestions.length > 0) {
        const questionIds = loadedQuestions.map(q => q.id);
        const nextId = selectNextQuestion(questionIds, progressMap);
        if (nextId) {
          const question = loadedQuestions.find(q => q.id === nextId);
          setCurrentQuestion(question || loadedQuestions[0]);
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setIsLoading(false);
    }
  }

  async function submitAnswer(answerIndex: number): Promise<boolean> {
    if (!currentQuestion || !stats) return false;

    const isCorrect = answerIndex === currentQuestion.correct;

    // Update progress with spaced repetition
    const existingProgress = progressMap.get(currentQuestion.id);
    const newProgress = updateProgressAfterAnswer(existingProgress, currentQuestion.id, isCorrect);
    await updateProgress(newProgress);

    // Update progress map
    const newProgressMap = new Map(progressMap);
    newProgressMap.set(currentQuestion.id, newProgress);
    setProgressMap(newProgressMap);

    // Update stats
    const today = new Date().toISOString().split('T')[0];
    const lastPracticeDate = stats.lastPracticeDate;
    const isNewDay = today !== lastPracticeDate;

    const newStats: UserStats = {
      ...stats,
      totalQuestions: stats.totalQuestions + 1,
      correctAnswers: stats.correctAnswers + (isCorrect ? 1 : 0),
      currentStreak: isNewDay
        ? lastPracticeDate === new Date(Date.now() - 86400000).toISOString().split('T')[0]
          ? stats.currentStreak + 1
          : 1
        : stats.currentStreak,
      longestStreak: Math.max(
        stats.longestStreak,
        isNewDay
          ? lastPracticeDate === new Date(Date.now() - 86400000).toISOString().split('T')[0]
            ? stats.currentStreak + 1
            : 1
          : stats.currentStreak
      ),
      lastPracticeDate: today,
      categoryScores: {
        ...stats.categoryScores,
        [currentQuestion.category]: {
          attempted: stats.categoryScores[currentQuestion.category].attempted + 1,
          correct: stats.categoryScores[currentQuestion.category].correct + (isCorrect ? 1 : 0),
        },
      },
    };

    await updateStats(newStats);
    setStats(newStats);

    return isCorrect;
  }

  function nextQuestion() {
    if (questions.length === 0) return;

    const questionIds = questions.map(q => q.id);
    const nextId = selectNextQuestion(questionIds, progressMap);

    if (nextId) {
      const question = questions.find(q => q.id === nextId);
      setCurrentQuestion(question || questions[0]);
    } else {
      // Fallback to random
      setCurrentQuestion(questions[Math.floor(Math.random() * questions.length)]);
    }
  }

  async function updateUserSettings(newSettings: Partial<AppSettings>) {
    if (!settings) return;

    const updated = { ...settings, ...newSettings };
    await updateSettings(updated);
    setSettings(updated);
  }

  async function generateReport(): Promise<PerformanceReport> {
    if (!stats) {
      throw new Error('Stats not loaded');
    }

    const allProgress = await getAllProgress();
    return generatePerformanceReport(stats, allProgress, questions);
  }

  async function refreshQuestions() {
    try {
      setIsLoading(true);

      // Force reload questions from JSON file
      await bulkAddQuestions(questionsData as Question[]);
      const loadedQuestions = await getAllQuestions();
      setQuestions(loadedQuestions);

      // Reload progress
      const allProgress = await getAllProgress();
      const newProgressMap = new Map(allProgress.map(p => [p.questionId, p]));
      setProgressMap(newProgressMap);

      // Select next question
      if (loadedQuestions.length > 0) {
        const questionIds = loadedQuestions.map(q => q.id);
        const nextId = selectNextQuestion(questionIds, newProgressMap);
        if (nextId) {
          const question = loadedQuestions.find(q => q.id === nextId);
          setCurrentQuestion(question || loadedQuestions[0]);
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to refresh questions:', error);
      setIsLoading(false);
    }
  }

  return (
    <AppContext.Provider
      value={{
        questions,
        currentQuestion,
        stats,
        settings,
        isLoading,
        submitAnswer,
        nextQuestion,
        updateUserSettings,
        generateReport,
        refreshQuestions,
        questionCount: questions.length,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
