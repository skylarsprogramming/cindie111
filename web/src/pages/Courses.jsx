import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'

const Courses = () => {
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState([])
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const levels = ['all', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const categories = ['all', 'General', 'Business', 'Academic', 'Conversation', 'Grammar']

  const courseData = [
    {
      id: 1,
      title: 'English A2',
      description: 'Beginner English fundamentals with basic grammar and vocabulary',
      level: 'A2',
      category: 'General',
      duration: '4 weeks',
      lessons: 20,
      progress: 0,
      image: '📚'
    },
    {
      id: 2,
      title: 'IELTS Preparation',
      description: 'Comprehensive IELTS test preparation with practice tests',
      level: 'B2',
      category: 'Academic',
      duration: '8 weeks',
      lessons: 40,
      progress: 0,
      image: '🎯'
    },
    {
      id: 3,
      title: 'Business English',
      description: 'Professional communication skills for the workplace',
      level: 'B1',
      category: 'Business',
      duration: '6 weeks',
      lessons: 30,
      progress: 0,
      image: '💼'
    },
    {
      id: 4,
      title: 'Effective Reading',
      description: 'Advanced reading comprehension and analysis skills',
      level: 'B1',
      category: 'Academic',
      duration: '5 weeks',
      lessons: 25,
      progress: 0,
      image: '📖'
    },
    {
      id: 5,
      title: 'Grammar Mastery',
      description: 'Advanced grammar structures and usage patterns',
      level: 'B2',
      category: 'Grammar',
      duration: '6 weeks',
      lessons: 35,
      progress: 0,
      image: '✏️'
    },
    {
      id: 6,
      title: 'Conversation Practice',
      description: 'Improve speaking skills through interactive conversations',
      level: 'A2',
      category: 'Conversation',
      duration: '4 weeks',
      lessons: 20,
      progress: 0,
      image: '💬'
    },
    {
      id: 7,
      title: 'Pronunciation Pro',
      description: 'Perfect your accent and pronunciation',
      level: 'All',
      category: 'General',
      duration: '3 weeks',
      lessons: 15,
      progress: 0,
      image: '🎤'
    },
    {
      id: 8,
      title: 'Writing Skills',
      description: 'Develop professional writing abilities',
      level: 'B1',
      category: 'Academic',
      duration: '5 weeks',
      lessons: 25,
      progress: 0,
      image: '✍️'
    }
  ]

  useEffect(() => {
    // Simulate loading courses
    setTimeout(() => {
      setCourses(courseData)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredCourses = courses.filter(course => {
    const levelMatch = selectedLevel === 'all' || course.level === selectedLevel
    const categoryMatch = selectedCategory === 'all' || course.category === selectedCategory
    return levelMatch && categoryMatch
  })

  const getLevelColor = (level) => {
    const colors = {
      'A1': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'A2': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'B1': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'B2': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'C1': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'C2': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'All': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
    return colors[level] || colors['All']
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading courses..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Course Catalog
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Choose from our comprehensive selection of English courses
          </p>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="input w-auto"
              >
                {levels.map(level => (
                  <option key={level} value={level}>
                    {level === 'all' ? 'All Levels' : level}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input w-auto"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="card p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{course.image}</div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                  {course.level}
                </span>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {course.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                {course.description}
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Duration:</span>
                  <span>{course.duration}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Lessons:</span>
                  <span>{course.lessons}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Category:</span>
                  <span>{course.category}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {course.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  to={`/course/${course.id}`}
                  className="btn btn-primary w-full"
                >
                  {course.progress > 0 ? 'Continue Course' : 'Start Course'}
                </Link>
                <button className="btn btn-secondary w-full">
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No courses found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters to see more courses
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Courses
