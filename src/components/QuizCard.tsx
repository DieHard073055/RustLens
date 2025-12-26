import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './QuizCard.css';

export function QuizCard() {
  const { currentQuestion, submitAnswer, nextQuestion, settings } = useApp();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  if (!currentQuestion) {
    return (
      <div className="quiz-card">
        <p>Loading questions...</p>
      </div>
    );
  }

  const handleAnswerSelect = (index: number) => {
    if (showExplanation) return; // Don't allow changing after submission
    setSelectedAnswer(index);
  };

  const handleSubmit = async () => {
    if (selectedAnswer === null) return;

    const correct = await submitAnswer(selectedAnswer);
    setIsCorrect(correct);

    if (settings?.explanationsEnabled) {
      setShowExplanation(true);
    } else {
      handleNext();
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    setIsCorrect(null);
    nextQuestion();
  };

  const getCategoryLabel = (category: string) => {
    return category.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getDifficultyStars = (difficulty: number) => {
    return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
  };

  return (
    <div className="quiz-card">
      <div className="quiz-header">
        <span className="category-badge">{getCategoryLabel(currentQuestion.category)}</span>
        <span className="difficulty">{getDifficultyStars(currentQuestion.difficulty)}</span>
      </div>

      <div className="code-block">
        <SyntaxHighlighter
          language="rust"
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1.5rem',
            background: 'var(--bg-primary)',
            borderRadius: '12px',
            fontSize: '0.95rem',
          }}
          showLineNumbers={true}
          lineNumberStyle={{
            minWidth: '3em',
            paddingRight: '1em',
            color: 'var(--text-secondary)',
            opacity: 0.5,
          }}
        >
          {currentQuestion.code}
        </SyntaxHighlighter>
      </div>

      <div className="question">
        <h3>{currentQuestion.question}</h3>
      </div>

      <div className="options">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrectAnswer = index === currentQuestion.correct;
          const showCorrect = showExplanation && isCorrectAnswer;
          const showIncorrect = showExplanation && isSelected && !isCorrect;

          return (
            <button
              key={index}
              className={`option ${isSelected ? 'selected' : ''} ${
                showCorrect ? 'correct' : ''
              } ${showIncorrect ? 'incorrect' : ''}`}
              onClick={() => handleAnswerSelect(index)}
              disabled={showExplanation}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
            </button>
          );
        })}
      </div>

      {showExplanation && (
        <div className={`explanation ${isCorrect ? 'correct-explanation' : 'incorrect-explanation'}`}>
          <h4>{isCorrect ? '✓ Correct!' : '✗ Incorrect'}</h4>
          <p>{currentQuestion.explanation}</p>
          {currentQuestion.rust_book_link && (
            <a
              href={currentQuestion.rust_book_link}
              target="_blank"
              rel="noopener noreferrer"
              className="rust-book-link"
            >
              📖 Read more in the Rust Book
            </a>
          )}
        </div>
      )}

      <div className="quiz-actions">
        {!showExplanation ? (
          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
          >
            Submit Answer
          </button>
        ) : (
          <button className="next-button" onClick={handleNext}>
            Next Question →
          </button>
        )}
      </div>
    </div>
  );
}
