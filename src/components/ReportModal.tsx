import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { formatReportAsText, formatReportAsJSON, type PerformanceReport } from '../lib/reportGenerator';
import './ReportModal.css';

interface ReportModalProps {
  onClose: () => void;
}

export function ReportModal({ onClose }: ReportModalProps) {
  const { generateReport } = useApp();
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [format, setFormat] = useState<'text' | 'json'>('text');
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const reportData = await generateReport();
      setReport(reportData);
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!report) return;

    const text = format === 'text' ? formatReportAsText(report) : formatReportAsJSON(report);

    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const downloadReport = () => {
    if (!report) return;

    const text = format === 'text' ? formatReportAsText(report) : formatReportAsJSON(report);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rustlens-report-${new Date().toISOString().split('T')[0]}.${format === 'text' ? 'txt' : 'json'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!report) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content report-modal" onClick={(e) => e.stopPropagation()}>
          <button className="close-button" onClick={onClose}>×</button>
          <h2>Generate Performance Report</h2>
          <p className="report-description">
            Get a detailed analysis of your learning progress. This report includes:
          </p>
          <ul className="report-features">
            <li>📊 Overall performance metrics</li>
            <li>📚 Category-by-category breakdown</li>
            <li>⚠️ Identified weak areas needing improvement</li>
            <li>🎯 Difficulty level analysis</li>
            <li>💡 Personalized recommendations</li>
          </ul>
          <p className="report-hint">
            Share this report with Claude to get personalized question recommendations!
          </p>
          <button
            className="generate-button"
            onClick={loadReport}
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>
    );
  }

  const formattedReport = format === 'text' ? formatReportAsText(report) : formatReportAsJSON(report);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content report-modal large" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Performance Report</h2>

        <div className="report-summary">
          <div className="summary-stat">
            <span className="stat-value">{report.summary.accuracy}%</span>
            <span className="stat-label">Accuracy</span>
          </div>
          <div className="summary-stat">
            <span className="stat-value">{report.summary.totalQuestions}</span>
            <span className="stat-label">Questions</span>
          </div>
          <div className="summary-stat">
            <span className="stat-value">{report.summary.currentStreak}</span>
            <span className="stat-label">Streak</span>
          </div>
        </div>

        {report.weakAreas.length > 0 && (
          <div className="weak-areas-highlight">
            <h3>🎯 Focus Areas</h3>
            <div className="weak-areas-list">
              {report.weakAreas.slice(0, 3).map((area) => (
                <div key={area.category} className="weak-area-chip">
                  {area.category.replace(/_/g, ' ')} ({area.accuracy}%)
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="format-toggle">
          <button
            className={format === 'text' ? 'active' : ''}
            onClick={() => setFormat('text')}
          >
            Text Format
          </button>
          <button
            className={format === 'json' ? 'active' : ''}
            onClick={() => setFormat('json')}
          >
            JSON Format
          </button>
        </div>

        <div className="report-content">
          <pre>{formattedReport}</pre>
        </div>

        <div className="report-actions">
          <button onClick={copyToClipboard} className="copy-button">
            {copySuccess ? '✓ Copied!' : '📋 Copy to Clipboard'}
          </button>
          <button onClick={downloadReport} className="download-button">
            💾 Download Report
          </button>
        </div>

        <p className="share-hint">
          💡 Copy this report and share it with Claude to get personalized questions for your weak areas!
        </p>
      </div>
    </div>
  );
}
