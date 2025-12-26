import type { UserStats, UserProgress, Question } from '../types/question';

export interface PerformanceReport {
  summary: {
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    currentStreak: number;
    longestStreak: number;
  };
  categoryBreakdown: Array<{
    category: string;
    attempted: number;
    correct: number;
    accuracy: number;
    status: 'strong' | 'average' | 'weak' | 'not-attempted';
  }>;
  weakAreas: Array<{
    category: string;
    accuracy: number;
    questionsAttempted: number;
  }>;
  difficultyBreakdown: Array<{
    difficulty: number;
    attempted: number;
    correct: number;
    accuracy: number;
  }>;
  recentMistakes: Array<{
    questionId: string;
    category: string;
    attempts: number;
    correctAttempts: number;
  }>;
  recommendations: string[];
}

export function generatePerformanceReport(
  stats: UserStats,
  allProgress: UserProgress[],
  allQuestions: Question[]
): PerformanceReport {
  // Overall summary
  const accuracy = stats.totalQuestions > 0
    ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100)
    : 0;

  // Category breakdown
  const categoryBreakdown = Object.entries(stats.categoryScores).map(([category, score]) => {
    const categoryAccuracy = score.attempted > 0
      ? Math.round((score.correct / score.attempted) * 100)
      : 0;

    let status: 'strong' | 'average' | 'weak' | 'not-attempted';
    if (score.attempted === 0) {
      status = 'not-attempted';
    } else if (categoryAccuracy >= 80) {
      status = 'strong';
    } else if (categoryAccuracy >= 60) {
      status = 'average';
    } else {
      status = 'weak';
    }

    return {
      category,
      attempted: score.attempted,
      correct: score.correct,
      accuracy: categoryAccuracy,
      status,
    };
  });

  // Identify weak areas (accuracy < 70% and attempted > 2)
  const weakAreas = categoryBreakdown
    .filter(cat => cat.accuracy < 70 && cat.attempted > 2)
    .sort((a, b) => a.accuracy - b.accuracy)
    .map(cat => ({
      category: cat.category,
      accuracy: cat.accuracy,
      questionsAttempted: cat.attempted,
    }));

  // Difficulty breakdown
  const difficultyMap = new Map<number, { attempted: number; correct: number }>();

  allProgress.forEach(progress => {
    const question = allQuestions.find(q => q.id === progress.questionId);
    if (!question) return;

    const current = difficultyMap.get(question.difficulty) || { attempted: 0, correct: 0 };
    difficultyMap.set(question.difficulty, {
      attempted: current.attempted + progress.attempts,
      correct: current.correct + progress.correctAttempts,
    });
  });

  const difficultyBreakdown = Array.from(difficultyMap.entries())
    .map(([difficulty, data]) => ({
      difficulty,
      attempted: data.attempted,
      correct: data.correct,
      accuracy: data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0,
    }))
    .sort((a, b) => a.difficulty - b.difficulty);

  // Recent mistakes (attempted multiple times, low accuracy)
  const recentMistakes = allProgress
    .filter(p => {
      const accuracy = p.attempts > 0 ? p.correctAttempts / p.attempts : 0;
      return accuracy < 0.5 && p.attempts >= 2;
    })
    .sort((a, b) => {
      const accA = a.correctAttempts / a.attempts;
      const accB = b.correctAttempts / b.attempts;
      return accA - accB;
    })
    .slice(0, 10)
    .map(p => {
      const question = allQuestions.find(q => q.id === p.questionId);
      return {
        questionId: p.questionId,
        category: question?.category || 'unknown',
        attempts: p.attempts,
        correctAttempts: p.correctAttempts,
      };
    });

  // Generate recommendations
  const recommendations: string[] = [];

  if (weakAreas.length > 0) {
    recommendations.push(
      `Focus on: ${weakAreas.map(w => w.category.replace(/_/g, ' ')).join(', ')}`
    );
  }

  if (difficultyBreakdown.length > 0) {
    const hardestDifficulty = difficultyBreakdown
      .filter(d => d.attempted > 0)
      .sort((a, b) => a.accuracy - b.accuracy)[0];

    if (hardestDifficulty && hardestDifficulty.accuracy < 60) {
      recommendations.push(
        `Difficulty ${hardestDifficulty.difficulty} questions need more practice (${hardestDifficulty.accuracy}% accuracy)`
      );
    }
  }

  const notAttempted = categoryBreakdown.filter(c => c.status === 'not-attempted');
  if (notAttempted.length > 0) {
    recommendations.push(
      `Try questions in: ${notAttempted.map(c => c.category.replace(/_/g, ' ')).join(', ')}`
    );
  }

  if (stats.currentStreak === 0) {
    recommendations.push('Start a daily practice streak to improve retention');
  }

  if (accuracy < 70 && stats.totalQuestions > 10) {
    recommendations.push('Review explanations carefully to understand concepts better');
  }

  return {
    summary: {
      totalQuestions: stats.totalQuestions,
      correctAnswers: stats.correctAnswers,
      accuracy,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
    },
    categoryBreakdown,
    weakAreas,
    difficultyBreakdown,
    recentMistakes,
    recommendations,
  };
}

export function formatReportAsText(report: PerformanceReport): string {
  const lines: string[] = [];

  lines.push('='.repeat(60));
  lines.push('RUSTLENS PERFORMANCE REPORT');
  lines.push('='.repeat(60));
  lines.push('');

  // Summary
  lines.push('📊 OVERALL PERFORMANCE');
  lines.push('-'.repeat(60));
  lines.push(`Total Questions Answered: ${report.summary.totalQuestions}`);
  lines.push(`Correct Answers: ${report.summary.correctAnswers}`);
  lines.push(`Overall Accuracy: ${report.summary.accuracy}%`);
  lines.push(`Current Streak: ${report.summary.currentStreak} days`);
  lines.push(`Longest Streak: ${report.summary.longestStreak} days`);
  lines.push('');

  // Category breakdown
  lines.push('📚 CATEGORY BREAKDOWN');
  lines.push('-'.repeat(60));
  lines.push('Category                    Attempted  Correct  Accuracy  Status');
  lines.push('-'.repeat(60));

  report.categoryBreakdown
    .sort((a, b) => b.attempted - a.attempted)
    .forEach(cat => {
      const categoryName = cat.category.replace(/_/g, ' ').padEnd(26);
      const attempted = cat.attempted.toString().padStart(8);
      const correct = cat.correct.toString().padStart(8);
      const accuracy = `${cat.accuracy}%`.padStart(8);
      const status = cat.status.toUpperCase().padStart(12);
      lines.push(`${categoryName} ${attempted} ${correct} ${accuracy} ${status}`);
    });
  lines.push('');

  // Weak areas
  if (report.weakAreas.length > 0) {
    lines.push('⚠️  WEAK AREAS (Need Improvement)');
    lines.push('-'.repeat(60));
    report.weakAreas.forEach((area, i) => {
      const categoryName = area.category.replace(/_/g, ' ');
      lines.push(`${i + 1}. ${categoryName}: ${area.accuracy}% accuracy (${area.questionsAttempted} questions)`);
    });
    lines.push('');
  }

  // Difficulty breakdown
  if (report.difficultyBreakdown.length > 0) {
    lines.push('🎯 DIFFICULTY BREAKDOWN');
    lines.push('-'.repeat(60));
    lines.push('Difficulty  Attempted  Correct  Accuracy');
    lines.push('-'.repeat(60));
    report.difficultyBreakdown.forEach(diff => {
      const stars = '★'.repeat(diff.difficulty) + '☆'.repeat(5 - diff.difficulty);
      const attempted = diff.attempted.toString().padStart(9);
      const correct = diff.correct.toString().padStart(8);
      const accuracy = `${diff.accuracy}%`.padStart(8);
      lines.push(`${stars.padEnd(11)} ${attempted} ${correct} ${accuracy}`);
    });
    lines.push('');
  }

  // Recent mistakes
  if (report.recentMistakes.length > 0) {
    lines.push('❌ RECENT STRUGGLES');
    lines.push('-'.repeat(60));
    const mistakesByCategory = report.recentMistakes.reduce((acc, mistake) => {
      if (!acc[mistake.category]) {
        acc[mistake.category] = 0;
      }
      acc[mistake.category]++;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(mistakesByCategory)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        lines.push(`- ${category.replace(/_/g, ' ')}: ${count} question(s) with low accuracy`);
      });
    lines.push('');
  }

  // Recommendations
  if (report.recommendations.length > 0) {
    lines.push('💡 RECOMMENDATIONS');
    lines.push('-'.repeat(60));
    report.recommendations.forEach((rec, i) => {
      lines.push(`${i + 1}. ${rec}`);
    });
    lines.push('');
  }

  lines.push('='.repeat(60));
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push('='.repeat(60));

  return lines.join('\n');
}

export function formatReportAsJSON(report: PerformanceReport): string {
  return JSON.stringify(report, null, 2);
}
