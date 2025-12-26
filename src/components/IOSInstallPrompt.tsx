import { useState, useEffect } from 'react';
import './IOSInstallPrompt.css';

export function IOSInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const hasSeenPrompt = localStorage.getItem('ios-install-prompt-seen');

    if (isIOS && !isStandalone && !hasSeenPrompt) {
      // Show prompt after 5 seconds
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('ios-install-prompt-seen', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="ios-install-prompt" onClick={handleDismiss}>
      <div className="ios-install-content" onClick={(e) => e.stopPropagation()}>
        <button className="ios-install-close" onClick={handleDismiss}>
          ✕
        </button>

        <div className="ios-install-header">
          <span className="ios-install-icon">📱</span>
          <h3>Install RustLens</h3>
        </div>

        <p className="ios-install-description">
          Add RustLens to your home screen for quick access and offline use!
        </p>

        <div className="ios-install-steps">
          <div className="ios-install-step">
            <span className="step-number">1</span>
            <div className="step-content">
              <p>Tap the <strong>Share</strong> button</p>
              <span className="share-icon">⎘</span>
              <p className="step-hint">(at the bottom of Safari)</p>
            </div>
          </div>

          <div className="ios-install-step">
            <span className="step-number">2</span>
            <div className="step-content">
              <p>Scroll down and tap <strong>"Add to Home Screen"</strong></p>
              <span className="add-icon">➕</span>
            </div>
          </div>

          <div className="ios-install-step">
            <span className="step-number">3</span>
            <div className="step-content">
              <p>Tap <strong>"Add"</strong> in the top right</p>
            </div>
          </div>
        </div>

        <button className="ios-install-dismiss" onClick={handleDismiss}>
          Got it!
        </button>
      </div>
    </div>
  );
}
