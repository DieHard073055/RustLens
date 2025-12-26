import type { UserProgress } from '../types/question';

/**
 * SM-2 (SuperMemo 2) spaced repetition algorithm
 * https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 */

interface ReviewResult {
  nextReview: number; // timestamp
  interval: number; // days
  easeFactor: number;
}

export function calculateNextReview(
  progress: UserProgress | undefined,
  wasCorrect: boolean
): ReviewResult {
  // First attempt at this question
  if (!progress) {
    if (wasCorrect) {
      return {
        nextReview: Date.now() + 1 * 24 * 60 * 60 * 1000, // 1 day
        interval: 1,
        easeFactor: 2.5,
      };
    } else {
      return {
        nextReview: Date.now() + 10 * 60 * 1000, // 10 minutes
        interval: 0,
        easeFactor: 2.5,
      };
    }
  }

  const { easeFactor: oldEF, interval: oldInterval } = progress;

  // Quality of response (0-5 scale)
  // 5 = perfect response, 0 = complete blackout
  const quality = wasCorrect ? 5 : 2;

  // Calculate new ease factor
  let newEF = oldEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Ease factor should never be less than 1.3
  if (newEF < 1.3) {
    newEF = 1.3;
  }

  let newInterval: number;
  let nextReview: number;

  if (quality < 3) {
    // If answer was wrong, reset interval to start
    newInterval = 0;
    nextReview = Date.now() + 10 * 60 * 1000; // Review again in 10 minutes
  } else {
    // If answer was correct, increase interval
    if (oldInterval === 0) {
      newInterval = 1;
    } else if (oldInterval === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(oldInterval * newEF);
    }

    nextReview = Date.now() + newInterval * 24 * 60 * 60 * 1000;
  }

  return {
    nextReview,
    interval: newInterval,
    easeFactor: newEF,
  };
}

/**
 * Update user progress after answering a question
 */
export function updateProgressAfterAnswer(
  progress: UserProgress | undefined,
  questionId: string,
  wasCorrect: boolean
): UserProgress {
  const { nextReview, interval, easeFactor } = calculateNextReview(progress, wasCorrect);

  return {
    questionId,
    attempts: (progress?.attempts || 0) + 1,
    correctAttempts: (progress?.correctAttempts || 0) + (wasCorrect ? 1 : 0),
    lastAttempted: Date.now(),
    nextReview,
    interval,
    easeFactor,
  };
}

/**
 * Get a weighted random question prioritizing:
 * 1. Questions due for review
 * 2. Questions never attempted
 * 3. Questions with lower accuracy
 */
export function selectNextQuestion(
  allQuestionIds: string[],
  progressMap: Map<string, UserProgress>
): string | null {
  if (allQuestionIds.length === 0) return null;

  const now = Date.now();
  const dueQuestions: string[] = [];
  const newQuestions: string[] = [];
  const reviewQuestions: string[] = [];

  for (const id of allQuestionIds) {
    const progress = progressMap.get(id);

    if (!progress) {
      newQuestions.push(id);
    } else if (progress.nextReview <= now) {
      dueQuestions.push(id);
    } else {
      reviewQuestions.push(id);
    }
  }

  // Priority: due questions > new questions > review questions
  if (dueQuestions.length > 0) {
    return dueQuestions[Math.floor(Math.random() * dueQuestions.length)];
  }

  if (newQuestions.length > 0) {
    return newQuestions[Math.floor(Math.random() * newQuestions.length)];
  }

  if (reviewQuestions.length > 0) {
    // Sort by accuracy (ascending) to prioritize weaker questions
    const sortedReview = reviewQuestions.sort((a, b) => {
      const progressA = progressMap.get(a)!;
      const progressB = progressMap.get(b)!;
      const accuracyA = progressA.correctAttempts / progressA.attempts;
      const accuracyB = progressB.correctAttempts / progressB.attempts;
      return accuracyA - accuracyB;
    });

    // Weighted selection favoring lower accuracy
    const weights = sortedReview.map((_, i) => sortedReview.length - i);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < sortedReview.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return sortedReview[i];
      }
    }

    return sortedReview[0];
  }

  return null;
}
