import { useState } from 'react';
import { Header } from './components/Header';
import { QuizCard } from './components/QuizCard';
import { StatsPanel } from './components/StatsPanel';
import { useApp } from './contexts/AppContext';
import './App.css';

function App() {
  const [showStats, setShowStats] = useState(false);
  const { isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="app loading">
        <div className="loader">Loading RustLens...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <div className="view-toggle">
          <button
            className={!showStats ? 'active' : ''}
            onClick={() => setShowStats(false)}
          >
            Quiz
          </button>
          <button
            className={showStats ? 'active' : ''}
            onClick={() => setShowStats(true)}
          >
            Stats
          </button>
        </div>

        {showStats ? <StatsPanel /> : <QuizCard />}
      </main>

      <footer className="app-footer">
        <p>
          Master Rust syntax through spaced repetition •{' '}
          <a
            href="https://github.com/yourusername/rustlens"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Source
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
