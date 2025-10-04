import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Master English with{' '}
            <span className="text-primary-600 dark:text-primary-400">CINDIE</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Premium language learning platform with AI-powered courses, interactive games, 
            and personalized progress tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="btn btn-primary text-lg px-8 py-3">
              Start Learning Free
            </Link>
            <Link to="/quiz" className="btn btn-accent text-lg px-8 py-3">
              Take Placement Test
            </Link>
            <Link to="/login" className="btn btn-secondary text-lg px-8 py-3">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            How to use this website – quick walkthrough
          </h2>
          <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="CINDIE Tutorial"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Why Choose CINDIE?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-8 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Personalized Learning
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                AI-powered courses adapt to your learning style and pace for optimal results.
              </p>
            </div>
            <div className="card p-8 text-center">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Interactive Games
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Learn through fun, engaging games with scoring and progress tracking.
              </p>
            </div>
            <div className="card p-8 text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Progress Tracking
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Detailed analytics and visualizations to track your learning journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Course Catalog Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Popular Courses
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'English A2', description: 'Beginner English fundamentals', level: 'A2' },
              { title: 'IELTS Preparation', description: 'Comprehensive IELTS test prep', level: 'B2-C1' },
              { title: 'Effective Reading', description: 'Advanced reading comprehension', level: 'B1-B2' },
              { title: 'Business English', description: 'Professional communication skills', level: 'B2-C1' },
              { title: 'Grammar Mastery', description: 'Advanced grammar structures', level: 'B1-C1' },
              { title: 'Pronunciation Pro', description: 'Perfect your accent', level: 'All Levels' },
            ].map((course, index) => (
              <div key={index} className="card p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {course.title}
                  </h3>
                  <span className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-2 py-1 rounded">
                    {course.level}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {course.description}
                </p>
                <Link 
                  to="/courses" 
                  className="btn btn-accent w-full text-sm"
                >
                  Start Course
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
