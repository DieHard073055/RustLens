export type QuestionType =
  | 'spot_error'
  | 'fill_blank'
  | 'will_compile'
  | 'fix_code'
  | 'predict_output'
  | 'idiomatic';

export type Category =
  | 'ownership'
  | 'lifetimes'
  | 'pattern_matching'
  | 'error_handling'
  | 'traits_generics'
  | 'iterators_closures'
  | 'async_await'
  | 'macros'
  | 'unsafe'
  | 'std_library';

export interface Question {
  id: string;
  category: Category;
  difficulty: 1 | 2 | 3 | 4 | 5; // 1 = beginner, 5 = expert
  type: QuestionType;
  code: string;
  question: string;
  options: string[];
  correct: number; // index of correct answer
  explanation: string;
  error_line?: number; // optional line number to highlight
  rust_book_link?: string;
  tags?: string[];
}

export interface UserProgress {
  questionId: string;
  attempts: number;
  correctAttempts: number;
  lastAttempted: number; // timestamp
  nextReview: number; // timestamp for spaced repetition
  easeFactor: number; // for spaced repetition algorithm
  interval: number; // days until next review
}

export interface UserStats {
  totalQuestions: number;
  correctAnswers: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string; // ISO date
  categoryScores: Record<Category, {
    attempted: number;
    correct: number;
  }>;
}

export interface AppSettings {
  darkMode: boolean;
  timedMode: boolean;
  timePerQuestion: number; // seconds
  explanationsEnabled: boolean;
  soundEnabled: boolean;
}
