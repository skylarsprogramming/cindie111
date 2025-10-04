'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Trophy, Target, Calendar, Clock, TrendingUp, Star, Award, BookOpen, Gamepad2, Mic, Zap } from 'lucide-react'

// Mock user data
const userData = {
  name: 'Alex Johnson',
  level: 'Intermediate',
  streak: 12,
  totalPoints: 2840,
  lessonsCompleted: 24,
  gamesPlayed: 18,
  pronunciationSessions: 15,
  currentLanguage: 'English',
  targetLanguage: 'German'
}

// Mock progress data
const progressData = {
  english: {
    a1: { completed: 8, total: 10, percentage: 80 },
    a2: { completed: 6, total: 12, percentage: 50 },
    b1: { completed: 3, total: 15, percentage: 20 },
    b2: { completed: 0, total: 18, percentage: 0 },
    c1: { completed: 0, total: 20, percentage: 0 }
  },
  german: {
    a1: { completed: 2, total: 10, percentage: 20 },
    a2: { completed: 0, total: 12, percentage: 0 },
    b1: { completed: 0, total: 15, percentage: 0 },
    b2: { completed: 0, total: 18, percentage: 0 },
    c1: { completed: 0, total: 20, percentage: 0 }
  }
}

// Mock achievements
const achievements = [
  {
    id: 1,
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: BookOpen,
    unlocked: true,
    unlockedAt: '2024-01-15',
    points: 100
  },
  {
    id: 2,
    name: 'Game Master',
    description: 'Play 10 language games',
    icon: Gamepad2,
    unlocked: true,
    unlockedAt: '2024-01-20',
    points: 200
  },
  {
    id: 3,
    name: 'Pronunciation Pro',
    description: 'Complete 5 pronunciation sessions',
    icon: Mic,
    unlocked: true,
    unlockedAt: '2024-01-25',
    points: 150
  },
  {
    id: 4,
    name: 'Streak Master',
    description: 'Maintain a 7-day learning streak',
    icon: Zap,
    unlocked: true,
    unlockedAt: '2024-01-30',
    points: 300
  },
  {
    id: 5,
    name: 'Grammar Guru',
    description: 'Score 90%+ on 5 grammar exercises',
    icon: Target,
    unlocked: false,
    points: 250
  },
  {
    id: 6,
    name: 'Vocabulary Champion',
    description: 'Learn 100 new words',
    icon: Star,
    unlocked: false,
    points: 400
  }
]

// Mock weekly activity
const weeklyActivity = [
  { day: 'Mon', lessons: 2, games: 1, pronunciation: 1 },
  { day: 'Tue', lessons: 1, games: 2, pronunciation: 0 },
  { day: 'Wed', lessons: 3, games: 1, pronunciation: 1 },
  { day: 'Thu', lessons: 2, games: 0, pronunciation: 1 },
  { day: 'Fri', lessons: 1, games: 2, pronunciation: 0 },
  { day: 'Sat', lessons: 0, games: 3, pronunciation: 1 },
  { day: 'Sun', lessons: 2, games: 1, pronunciation: 1 }
]

export default function DashboardPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'german'>('english')
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('week')

  const totalAchievements = achievements.length
  const unlockedAchievements = achievements.filter(a => a.unlocked).length
  const totalPointsEarned = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0)

  const getLevelColor = (percentage: number) => {
    if (percentage >= 80) return 'text-neon-green'
    if (percentage >= 60) return 'text-neon-blue'
    if (percentage >= 40) return 'text-yellow-400'
    return 'text-neon-pink'
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'from-neon-green to-green-400'
    if (percentage >= 60) return 'from-neon-blue to-blue-400'
    if (percentage >= 40) return 'from-yellow-400 to-orange-400'
    return 'from-neon-pink to-red-400'
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-end mb-4">
          <button
            onClick={async () => {
              try {
                await fetch('/api/logout', { method: 'POST' })
                window.location.href = '/login'
              } catch (_) {}
            }}
            className="px-4 py-2 rounded-lg font-medium bg-dark-200 text-gray-300 border border-gray-700 hover:text-white hover:bg-dark-100 transition-all"
          >
            Logout
          </button>
        </div>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {userData.name}! 👋</h1>
          <p className="text-xl text-gray-300">Track your progress and celebrate your achievements</p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            { label: 'Learning Streak', value: userData.streak, icon: Calendar, color: 'from-neon-pink to-neon-purple' },
            { label: 'Total Points', value: userData.totalPoints, icon: Trophy, color: 'from-neon-blue to-neon-green' },
            { label: 'Lessons Completed', value: userData.lessonsCompleted, icon: BookOpen, color: 'from-neon-green to-neon-pink' },
            { label: 'Games Played', value: userData.gamesPlayed, icon: Gamepad2, color: 'from-neon-purple to-neon-blue' }
          ].map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="card">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            )
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Tracking */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Learning Progress</h2>
                <div className="flex space-x-2">
                  {(['english', 'german'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        selectedLanguage === lang
                          ? 'bg-neon-pink text-white'
                          : 'bg-dark-200 text-gray-400 hover:text-white'
                      }`}
                    >
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(progressData[selectedLanguage]).map(([level, data]) => (
                  <div key={level} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{level.toUpperCase()}</span>
                      <span className={`font-bold ${getLevelColor(data.percentage)}`}>
                        {data.completed}/{data.total} ({data.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-dark-200 rounded-full h-3">
                      <div
                        className={`h-3 bg-gradient-to-r ${getProgressColor(data.percentage)} rounded-full transition-all duration-500`}
                        style={{ width: `${data.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Weekly Activity Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Weekly Activity</h2>
                <div className="flex space-x-2">
                  {(['week', 'month', 'year'] as const).map((timeframe) => (
                    <button
                      key={timeframe}
                      onClick={() => setSelectedTimeframe(timeframe)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
                        selectedTimeframe === timeframe
                          ? 'bg-neon-blue text-white'
                          : 'bg-dark-200 text-gray-400 hover:text-white'
                      }`}
                    >
                      {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {weeklyActivity.map((day, index) => (
                  <div key={index} className="text-center">
                    <div className="text-gray-400 text-sm mb-2">{day.day}</div>
                    <div className="space-y-1">
                      <div className="h-2 bg-neon-pink rounded" style={{ height: `${day.lessons * 8}px` }} />
                      <div className="h-2 bg-neon-blue rounded" style={{ height: `${day.games * 8}px` }} />
                      <div className="h-2 bg-neon-green rounded" style={{ height: `${day.pronunciation * 8}px` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-neon-pink rounded" />
                  <span>Lessons</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-neon-blue rounded" />
                  <span>Games</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-neon-green rounded" />
                  <span>Pronunciation</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Achievements & Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Achievements</h3>
                <div className="text-sm text-gray-400">
                  {unlockedAchievements}/{totalAchievements}
                </div>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {achievements.map((achievement) => {
                  const Icon = achievement.icon
                  return (
                    <div
                      key={achievement.id}
                      className={`p-3 rounded-lg border transition-all duration-300 ${
                        achievement.unlocked
                          ? 'border-neon-green bg-neon-green/10'
                          : 'border-gray-700 bg-dark-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          achievement.unlocked
                            ? 'bg-neon-green text-white'
                            : 'bg-gray-600 text-gray-400'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{achievement.name}</div>
                          <div className="text-gray-400 text-sm">{achievement.description}</div>
                          {achievement.unlocked && (
                            <div className="text-neon-green text-xs mt-1">
                              +{achievement.points} points • {achievement.unlockedAt}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="card"
            >
              <h3 className="text-xl font-bold text-white mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Points Earned</span>
                  <span className="text-white font-bold">{totalPointsEarned}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Current Level</span>
                  <span className="text-neon-green font-bold">{userData.level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Study Time</span>
                  <span className="text-white font-bold">~45 min/day</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Next Goal</span>
                  <span className="text-neon-blue font-bold">B1 Level</span>
                </div>
              </div>
            </motion.div>

            {/* Motivation */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="card bg-gradient-to-r from-neon-pink/20 to-neon-purple/20 border border-neon-pink/30"
            >
              <div className="text-center">
                <Trophy className="w-12 h-12 text-neon-pink mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Keep Going!</h3>
                <p className="text-gray-300 text-sm">
                  You're on a {userData.streak}-day streak! Consistency is key to language mastery.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
