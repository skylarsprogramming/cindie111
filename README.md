## Firebase auth (email + phone) with protected Express API

### 1) Firebase setup
- Create a project in Firebase Console.
- Authentication → Sign-in method: enable Email/Password and Phone.
- Project settings → General → Your apps (Web) → Register app and copy config into `firebase-config.js`.
- Authentication → Settings → Authorized domains: ensure `localhost` is present. If you serve on another host/port, add that domain.

Phone sign-in requires reCAPTCHA. Opening HTML files directly with `file://` will fail reCAPTCHA. Use a local web server.

### 2) Run the frontend locally
- From this folder, run one of:
  - `npx serve -p 5173` (or)
  - `npx http-server -p 5173` (or any static server)
- Visit `http://localhost:5173/signup.html` to create an account, then try `login.html` and `dashboard.html`.

### 3) Run the backend API
- Get a Firebase Admin service account JSON:
  - Firebase Console → Project settings → Service accounts → Generate new private key
  - Save it as `server/serviceAccountKey.json` or set env var `GOOGLE_APPLICATION_CREDENTIALS` to its path.
- Install and start the server:
  - `cd server`
  - `npm install`
  - `npm run start` (starts on `http://localhost:4000`)

### 4) How it works
- Frontend uses Firebase JS SDK for signup/login.
- `signup.html` optionally links your phone via SMS code during registration.
- `dashboard.html` gets an ID token (`getIdToken`) and calls `http://localhost:4000/api/protected` with `Authorization: Bearer <token>`.
- Express verifies the token with Firebase Admin and returns user data.

### 5) Environment notes
- Node 18+ recommended.
- If SMS is not arriving, ensure the phone sign-in test numbers or proper reCAPTCHA domain settings, and avoid `file://`.

# Cindie — AI English Learning Website

Static site you can host on GitHub Pages. Includes:

- Landing page with 3D parallax and starfield
- 15-question placement quiz (grammar, reading, listening)
- AI-like personalized course generator (client-side mock)
- Games (Word Match, Sentence Builder)
- Pronunciation improver using Web Speech API

## Run locally

Open `index.html` in your browser, or serve the folder with any static server.

## Deploy to GitHub Pages

1. Create a new GitHub repository and push this project.
2. In GitHub, go to Settings → Pages.
3. Set "Deploy from a branch" and choose `main` (or your default) and `/ (root)`.
4. Save. Your site will be available at the Pages URL in ~1 minute.

If you deploy to a subpath (e.g. `username.github.io/repo`), ensure links are relative (they are in this project).

### Optional: Use a custom domain

1. In your repo, create a file named `Cindie` at the root with your domain name.
2. Configure your DNS to point `A` records to GitHub Pages and add a `Cindie` to your repo URL.
3. In GitHub Pages settings, set the custom domain and enforce HTTPS.

## Privacy

This is 100% client-side. No data leaves your browser. Quiz results are stored in `localStorage` to generate your course.

## Browser support

- Pronunciation uses the Web Speech API. For best results, use Chrome-based browsers.
- Listening items use text-to-speech so audio works offline.

# Cindie - Modern Language Learning Platform

A bold, edgy, and modern language learning website built with Next.js, React, and Tailwind CSS. Learn English and German through interactive courses, games, and AI-powered pronunciation practice.

## ✨ Features

### 🎯 Interactive Courses
- **Left Side**: Lesson content with vocabulary, grammar explanations, and short stories
- **Right Side**: Interactive multiple-choice questions based on the lesson
- **Vocabulary Highlighting**: New words with playful animations and "Mark as Learned" feature
- **Progress Tracking**: Track completion and mastery levels

### 🎮 Language Games
1. **Vocabulary Matching**: Match English words with German translations
2. **Grammar Builder**: Complete sentences with correct grammar
3. **Speed Quiz**: Answer questions as fast as possible in 60 seconds

### 🎤 Pronunciation Practice
- **Microphone Input**: Record yourself speaking
- **Speech Recognition**: Real-time transcription using Web Speech API
- **Instant Feedback**: Score and improvement suggestions
- **Progress History**: Track your pronunciation journey

### 📊 Study Dashboard
- **Progress Analytics**: Visual progress bars and charts
- **Achievement System**: Unlock badges and rewards
- **Learning Streaks**: Track daily study consistency
- **Performance Metrics**: Detailed statistics and insights

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React for consistent iconography
- **Speech Recognition**: Web Speech API for pronunciation analysis
- **Responsive Design**: Mobile-first approach with full responsiveness

## 🎨 Design Features

- **Bold & Edgy**: Black backgrounds with neon/gradient accents
- **Modern UI**: Large buttons with hover animations and click effects
- **Smooth Transitions**: Framer Motion animations throughout
- **Neon Glow Effects**: Eye-catching visual elements
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── courses/           # Interactive course lessons
│   ├── games/             # Language learning games
│   ├── pronunciation/     # Pronunciation practice
│   ├── dashboard/         # Progress tracking dashboard
│   ├── globals.css        # Global styles and Tailwind
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   └── Navigation.tsx     # Main navigation bar
└── hooks/                 # Custom React hooks
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### 1. Clone the repository
```bash
git clone <repository-url>
cd cindie-language-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```

### 4. Open your browser
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌟 Key Features Implementation

### Course Layout
The courses page implements the exact layout specified:
- **Left Side**: Lesson content with vocabulary highlighting
- **Right Side**: Interactive quiz questions
- **Vocabulary Management**: Click to mark words as learned
- **Progress Tracking**: Quiz results and scoring

### Interactive Games
Three fully functional language games:
- **Vocabulary Matching**: Memory card game with scoring
- **Grammar Builder**: Sentence completion with feedback
- **Speed Quiz**: Timed question answering

### Pronunciation Practice
- **Real-time Recording**: Uses MediaRecorder API
- **Speech Recognition**: Web Speech API integration
- **Instant Analysis**: Score calculation and feedback
- **Progress History**: Track improvement over time

### Dashboard Analytics
- **Visual Progress**: Progress bars for each language level
- **Activity Charts**: Weekly learning activity visualization
- **Achievement System**: Unlockable badges and points
- **Statistics Overview**: Comprehensive learning metrics

## 🎨 Customization

### Colors & Themes
The app uses a custom color palette defined in `tailwind.config.js`:
- **Neon Colors**: Pink, blue, green, purple
- **Dark Theme**: Multiple shades of dark backgrounds
- **Gradients**: Beautiful color transitions throughout

### Animations
- **Framer Motion**: Smooth page transitions and micro-interactions
- **Custom CSS**: Tailwind animations with custom keyframes
- **Hover Effects**: Interactive button and card animations

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Responsive grid layouts
- **Desktop Experience**: Full-featured desktop interface
- **Touch Friendly**: Optimized for touch interactions

## 🔧 Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Speech Recognition**: Requires HTTPS for microphone access
- **Progressive Enhancement**: Graceful fallbacks for older browsers

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Other Platforms
```bash
npm run build
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Framer Motion** for smooth animations
- **Lucide** for beautiful icons

## 📞 Support

For questions or support, please open an issue in the repository.

---

**Happy Learning! 🎓✨**

