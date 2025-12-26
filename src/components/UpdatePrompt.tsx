import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import './UpdatePrompt.css';

export function UpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      console.log('Service Worker registered:', swUrl);

      // Check for updates every 60 seconds
      if (registration) {
        setInterval(() => {
          console.log('Checking for updates...');
          registration.update();
        }, 60000);
      }
    },
    onRegisterError(error) {
      console.error('SW registration error:', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      setShowPrompt(true);
    }
  }, [needRefresh]);

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!showPrompt && !offlineReady && !needRefresh) return null;

  return (
    <div className="update-prompt">
      {offlineReady && !needRefresh && (
        <div className="update-message offline-ready">
          <span>✅ App ready for offline use!</span>
          <button onClick={handleDismiss}>Dismiss</button>
        </div>
      )}

      {needRefresh && (
        <div className="update-message new-version">
          <div className="update-content">
            <span className="update-icon">🚀</span>
            <div className="update-text">
              <strong>New version available!</strong>
              <p>Click reload to update to the latest version with new questions and features.</p>
            </div>
          </div>
          <div className="update-actions">
            <button className="update-btn-primary" onClick={handleUpdate}>
              Reload & Update
            </button>
            <button className="update-btn-secondary" onClick={handleDismiss}>
              Later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
