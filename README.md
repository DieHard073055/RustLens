# 🦀 RustLens - Rust Syntax Mastery

Master Rust syntax through interactive quizzes and spaced repetition. A Progressive Web App (PWA) that works offline and helps you level up your Rust skills.

## ✨ Features

- **50+ High-Quality Questions** covering all major Rust concepts
- **Spaced Repetition** algorithm (SM-2) for optimal learning
- **Offline-First** - Works without internet connection
- **Progress Tracking** - Track accuracy, streaks, and category performance
- **Instant Feedback** - Detailed explanations with links to Rust documentation
- **Responsive Design** - Works on desktop, tablet, and mobile
- **PWA Support** - Install on your device for native-like experience

## 📚 Topics Covered

- Ownership & Borrowing
- Lifetimes
- Pattern Matching
- Error Handling (`Result`, `Option`, `?` operator)
- Traits & Generics
- Iterators & Closures
- Async/Await
- Macros
- Unsafe Rust
- Standard Library

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/RustLens.git
cd RustLens

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app in action.

### Building for Production

```bash
# Build the app
npm run build

# Preview the production build
npm run preview
```

## 📦 Deploying to GitHub Pages

1. **Update the base path** in `vite.config.ts`:
   ```typescript
   export default defineConfig({
     base: '/your-repo-name/', // Change this to match your repo name
     // ... rest of config
   })
   ```

2. **Enable GitHub Pages** in your repository:
   - Go to Settings > Pages
   - Source: GitHub Actions

3. **Push to main branch**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

The GitHub Actions workflow will automatically build and deploy your app.

## 🏗️ Project Structure

```
RustLens/
├── src/
│   ├── components/       # React components
│   │   ├── Header.tsx
│   │   ├── QuizCard.tsx
│   │   └── StatsPanel.tsx
│   ├── contexts/         # React context providers
│   │   └── AppContext.tsx
│   ├── data/             # Question bank
│   │   └── questions.json
│   ├── lib/              # Core utilities
│   │   ├── db.ts         # IndexedDB wrapper
│   │   └── spacedRepetition.ts
│   ├── types/            # TypeScript definitions
│   │   └── question.ts
│   ├── App.tsx
│   └── main.tsx
├── public/               # Static assets
└── package.json
```

## 🎯 Usage

### Quiz Mode

1. Answer questions by selecting an option
2. Submit your answer to see if you're correct
3. Read the explanation to understand the concept
4. Click "Next Question" to continue

### Stats Mode

- View your overall accuracy and progress
- Track your daily streak
- See performance by category
- Identify weak areas that need more practice

## 🧪 Adding New Questions

Questions are stored in `src/data/questions.json`. To add a new question:

```json
{
  "id": "unique-id",
  "category": "ownership",
  "difficulty": 3,
  "type": "spot_error",
  "code": "fn main() {\n    // Your code here\n}",
  "question": "What's wrong with this code?",
  "options": [
    "Option A",
    "Option B",
    "Option C",
    "Option D"
  ],
  "correct": 0,
  "explanation": "Detailed explanation of the answer",
  "error_line": 2,
  "rust_book_link": "https://doc.rust-lang.org/book/..."
}
```

### Question Types

- `spot_error` - Identify the bug in code
- `fill_blank` - Complete missing syntax
- `will_compile` - Predict compilation success
- `fix_code` - Choose the correct fix
- `predict_output` - Predict runtime behavior
- `idiomatic` - Identify idiomatic Rust

### Categories

- `ownership`
- `lifetimes`
- `pattern_matching`
- `error_handling`
- `traits_generics`
- `iterators_closures`
- `async_await`
- `macros`
- `unsafe`
- `std_library`

## 🔧 Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: CSS with CSS Variables
- **Offline Storage**: IndexedDB (via `idb`)
- **PWA**: Vite PWA Plugin + Workbox
- **Deployment**: GitHub Pages + GitHub Actions

## 🎨 Customization

### Changing Theme Colors

Edit CSS variables in `src/index.css`:

```css
:root {
  --rust-orange: #CE422B;
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  /* ... more colors */
}
```

### Adjusting Spaced Repetition

Modify the algorithm in `src/lib/spacedRepetition.ts`:

- Interval calculations
- Ease factor adjustments
- Question selection weights

## 📱 PWA Installation

Users can install RustLens as a standalone app:

1. Visit the deployed site
2. Look for "Install" prompt in browser
3. Click "Install" to add to home screen

Works on Chrome, Edge, Safari (iOS 16.4+), and Firefox.

## 🤝 Contributing

Contributions are welcome! Here are some ways to contribute:

- Add more questions
- Improve explanations
- Fix bugs
- Enhance UI/UX
- Add new features

## 📄 License

MIT License - feel free to use this project for learning or building your own quiz apps.

## 🙏 Acknowledgments

- Rust logo and branding - [Rust Foundation](https://foundation.rust-lang.org/)
- Spaced repetition algorithm - [SuperMemo SM-2](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)
- Questions inspired by common Rust interview patterns and [The Rust Book](https://doc.rust-lang.org/book/)

## 📞 Support

If you find this helpful, please star the repository and share it with others learning Rust!

---

Built with ❤️ for the Rust community
