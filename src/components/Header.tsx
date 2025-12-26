import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import './Header.css';

export function Header() {
  const { settings, updateUserSettings, questionCount, refreshQuestions } = useApp();
  const [showSettings, setShowSettings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!settings) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshQuestions();
    setIsRefreshing(false);
  };

  return (
    <>
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">🦀</span>
          <h1>RustLens</h1>
        </div>

        <div className="header-actions">
          <div className="question-counter" title="Total questions in bank">
            📚 {questionCount}
          </div>

          <button
            className="refresh-button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label="Refresh questions"
            title="Reload questions from server"
          >
            {isRefreshing ? '⏳' : '🔄'}
          </button>

          <button
            className="settings-button"
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Settings"
          >
            ⚙️
          </button>
        </div>
      </header>

      {showSettings && (
        <div className="settings-modal" onClick={() => setShowSettings(false)}>
          <div className="settings-content" onClick={(e) => e.stopPropagation()}>
            <h2>Settings</h2>

            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={(e) => updateUserSettings({ darkMode: e.target.checked })}
                />
                <span>Dark Mode</span>
              </label>
            </div>

            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.explanationsEnabled}
                  onChange={(e) => updateUserSettings({ explanationsEnabled: e.target.checked })}
                />
                <span>Show Explanations</span>
              </label>
            </div>

            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.timedMode}
                  onChange={(e) => updateUserSettings({ timedMode: e.target.checked })}
                />
                <span>Timed Mode</span>
              </label>
            </div>

            {settings.timedMode && (
              <div className="setting-item">
                <label>
                  <span>Time per question (seconds)</span>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={settings.timePerQuestion}
                    onChange={(e) =>
                      updateUserSettings({ timePerQuestion: parseInt(e.target.value) || 60 })
                    }
                  />
                </label>
              </div>
            )}

            <button className="close-settings" onClick={() => setShowSettings(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
