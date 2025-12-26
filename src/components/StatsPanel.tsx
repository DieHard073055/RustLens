import { useApp } from '../contexts/AppContext';
import './StatsPanel.css';

export function StatsPanel() {
  const { stats } = useApp();

  if (!stats) return null;

  const accuracy = stats.totalQuestions > 0
    ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100)
    : 0;

  const topCategories = Object.entries(stats.categoryScores)
    .filter(([_, score]) => score.attempted > 0)
    .map(([category, score]) => ({
      category,
      accuracy: Math.round((score.correct / score.attempted) * 100),
      attempted: score.attempted,
    }))
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 3);

  const getCategoryLabel = (category: string) => {
    return category.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="stats-panel">
      <h2>Your Progress</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalQuestions}</div>
          <div className="stat-label">Questions Answered</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{accuracy}%</div>
          <div className="stat-label">Accuracy</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.currentStreak}</div>
          <div className="stat-label">Day Streak</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.longestStreak}</div>
          <div className="stat-label">Longest Streak</div>
        </div>
      </div>

      {topCategories.length > 0 && (
        <div className="category-stats">
          <h3>Top Categories</h3>
          {topCategories.map(({ category, accuracy, attempted }) => (
            <div key={category} className="category-item">
              <div className="category-name">{getCategoryLabel(category)}</div>
              <div className="category-bar">
                <div
                  className="category-fill"
                  style={{ width: `${accuracy}%` }}
                />
              </div>
              <div className="category-stats-text">
                {accuracy}% ({attempted} questions)
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
