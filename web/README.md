# CINDIE - Premium Language Learning Platform

A modern React-based language learning platform with dark/light theme support, secure authentication, interactive games, and comprehensive progress tracking.

## Features

### 🎨 Theme Support
- Light/Dark mode toggle with localStorage persistence
- TailwindCSS dark mode classes throughout
- Smooth theme transitions

### 🔐 Secure Authentication
- Email/password registration with strong password validation
- Google OAuth integration
- Email verification flow
- Forgot password functionality
- Protected routes for authenticated users

### 🏠 Homepage
- Responsive video player for tutorials
- Course catalog preview
- Modern gradient backgrounds
- Feature highlights

### 🎮 Enhanced Games
- Word Match game with animations and sound effects
- Sentence Builder with drag-and-drop functionality
- Real-time scoring system
- High score tracking with localStorage
- Smooth transitions and feedback

### 📊 Dashboard
- Progress visualization with Recharts
- Weekly progress tracking
- Course completion stats
- Skill distribution charts
- Recent activity feed

### 📚 Course Management
- Comprehensive course catalog
- Level and category filtering
- Progress tracking
- Course preview functionality

## Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS
- **Routing**: React Router DOM
- **Authentication**: Firebase Auth
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast
- **Icons**: Custom SVG icons

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd web
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Update `src/firebase/config.js` with your Firebase configuration
   - Enable Authentication providers in Firebase Console

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
web/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Navbar.jsx       # Navigation with theme toggle
│   │   ├── ProtectedRoute.jsx
│   │   └── LoadingSpinner.jsx
│   ├── contexts/            # React contexts
│   │   ├── ThemeContext.jsx # Theme management
│   │   └── AuthContext.jsx  # Authentication state
│   ├── firebase/            # Firebase configuration
│   │   └── config.js
│   ├── pages/               # Page components
│   │   ├── Home.jsx         # Landing page with video
│   │   ├── Login.jsx        # Authentication pages
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx    # Progress tracking
│   │   ├── Courses.jsx      # Course catalog
│   │   └── Games.jsx        # Interactive games
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # App entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── package.json
├── tailwind.config.js       # Tailwind configuration
├── vite.config.js          # Vite configuration
└── README.md
```

## Key Features Implementation

### Theme System
- Context-based theme management
- localStorage persistence
- CSS custom properties for smooth transitions
- Dark mode classes throughout components

### Authentication
- Form validation with regex patterns
- Strong password requirements
- Firebase integration
- Protected route wrapper
- Loading states and error handling

### Games Enhancement
- Web Audio API for sound effects
- Framer Motion for animations
- Local storage for high scores
- Real-time feedback and scoring

### Dashboard Analytics
- Multiple chart types (Line, Bar, Pie)
- Responsive design
- Real-time data updates
- Progress visualization

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
