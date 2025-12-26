import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { Question, UserProgress, UserStats, AppSettings, Category } from '../types/question';

interface RustLensDB extends DBSchema {
  questions: {
    key: string;
    value: Question;
    indexes: {
      'by-category': Category;
      'by-difficulty': number;
    };
  };
  progress: {
    key: string;
    value: UserProgress;
    indexes: {
      'by-next-review': number;
    };
  };
  stats: {
    key: string;
    value: UserStats;
  };
  settings: {
    key: string;
    value: AppSettings;
  };
  metadata: {
    key: string;
    value: {
      questionBundleVersion: number;
      lastSync: number;
    };
  };
}

const DB_NAME = 'rustlens-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<RustLensDB> | null = null;

export async function initDB(): Promise<IDBPDatabase<RustLensDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<RustLensDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Questions store
      if (!db.objectStoreNames.contains('questions')) {
        const questionStore = db.createObjectStore('questions', { keyPath: 'id' });
        questionStore.createIndex('by-category', 'category');
        questionStore.createIndex('by-difficulty', 'difficulty');
      }

      // Progress store
      if (!db.objectStoreNames.contains('progress')) {
        const progressStore = db.createObjectStore('progress', { keyPath: 'questionId' });
        progressStore.createIndex('by-next-review', 'nextReview');
      }

      // Stats store
      if (!db.objectStoreNames.contains('stats')) {
        db.createObjectStore('stats', { keyPath: 'id' });
      }

      // Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }

      // Metadata store
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' });
      }
    },
  });

  return dbInstance;
}

// Question operations
export async function getAllQuestions(): Promise<Question[]> {
  const db = await initDB();
  return db.getAll('questions');
}

export async function getQuestionsByCategory(category: Category): Promise<Question[]> {
  const db = await initDB();
  return db.getAllFromIndex('questions', 'by-category', category);
}

export async function getQuestionById(id: string): Promise<Question | undefined> {
  const db = await initDB();
  return db.get('questions', id);
}

export async function bulkAddQuestions(questions: Question[]): Promise<void> {
  const db = await initDB();
  const tx = db.transaction('questions', 'readwrite');
  await Promise.all([
    ...questions.map(q => tx.store.put(q)),
    tx.done
  ]);
}

// Progress operations
export async function getProgress(questionId: string): Promise<UserProgress | undefined> {
  const db = await initDB();
  return db.get('progress', questionId);
}

export async function updateProgress(progress: UserProgress): Promise<void> {
  const db = await initDB();
  await db.put('progress', progress);
}

export async function getQuestionsForReview(): Promise<string[]> {
  const db = await initDB();
  const now = Date.now();
  const allProgress = await db.getAll('progress');
  return allProgress
    .filter(p => p.nextReview <= now)
    .map(p => p.questionId);
}

export async function getAllProgress(): Promise<UserProgress[]> {
  const db = await initDB();
  return db.getAll('progress');
}

// Stats operations
export async function getStats(): Promise<UserStats> {
  const db = await initDB();
  const stats = await db.get('stats', 'user-stats');

  if (!stats) {
    const defaultStats: UserStats = {
      totalQuestions: 0,
      correctAnswers: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: new Date().toISOString().split('T')[0],
      categoryScores: {
        ownership: { attempted: 0, correct: 0 },
        lifetimes: { attempted: 0, correct: 0 },
        pattern_matching: { attempted: 0, correct: 0 },
        error_handling: { attempted: 0, correct: 0 },
        traits_generics: { attempted: 0, correct: 0 },
        iterators_closures: { attempted: 0, correct: 0 },
        async_await: { attempted: 0, correct: 0 },
        macros: { attempted: 0, correct: 0 },
        unsafe: { attempted: 0, correct: 0 },
        std_library: { attempted: 0, correct: 0 },
      },
    };
    await updateStats(defaultStats);
    return defaultStats;
  }

  return stats;
}

export async function updateStats(stats: UserStats): Promise<void> {
  const db = await initDB();
  await db.put('stats', { ...stats, id: 'user-stats' } as any);
}

// Settings operations
export async function getSettings(): Promise<AppSettings> {
  const db = await initDB();
  const settings = await db.get('settings', 'app-settings');

  if (!settings) {
    const defaultSettings: AppSettings = {
      darkMode: true,
      timedMode: false,
      timePerQuestion: 60,
      explanationsEnabled: true,
      soundEnabled: false,
    };
    await updateSettings(defaultSettings);
    return defaultSettings;
  }

  return settings;
}

export async function updateSettings(settings: AppSettings): Promise<void> {
  const db = await initDB();
  await db.put('settings', { ...settings, id: 'app-settings' } as any);
}

// Metadata operations
export async function getMetadata() {
  const db = await initDB();
  return db.get('metadata', 'sync-metadata');
}

export async function updateMetadata(data: { questionBundleVersion: number; lastSync: number }) {
  const db = await initDB();
  await db.put('metadata', { ...data, key: 'sync-metadata' } as any);
}
