import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children, requireQuiz = false }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check if quiz completion is required for this route
  if (requireQuiz) {
    const quizCompleted = localStorage.getItem('cindie_quiz_completed')
    if (quizCompleted !== '1') {
      return <Navigate to="/quiz" replace />
    }
  }

  return children
}

export default ProtectedRoute
