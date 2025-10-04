'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, CheckCircle, Play, Star, ArrowLeft, ArrowRight } from 'lucide-react'

// Mock lesson data based on the JSON format
const lessonData = {
  trackId: "track_english",
  title: "English Language Track",
  levels: [
    {
      levelId: "en_a1",
      title: "English A1 – Beginner",
      modules: [
        {
          moduleId: "en_a1_greetings",
          title: "Greetings & Introductions",
          lessons: [
            {
              lessonId: "en_a1_greetings_1",
              title: "Hello and Goodbye",
              content: `Welcome to your first English lesson! Today we'll learn basic greetings.

Key Vocabulary:
• Hello / Hi - A friendly way to say "hello"
• Goodbye / Bye - A way to say "farewell"
• Good morning - Used from sunrise until noon
• Good afternoon - Used from noon until 6 PM
• Good evening - Used from 6 PM until bedtime
• Good night - Used when going to bed

Common Phrases:
• "Hello, how are you?" - A polite way to ask about someone's well-being
• "I'm fine, thank you" - A common response meaning you're doing well
• "Nice to meet you" - Said when meeting someone for the first time

Practice these greetings with different people throughout your day!`,
              vocabulary: [
                { word: "Hello", meaning: "A friendly greeting", learned: false },
                { word: "Goodbye", meaning: "A way to say farewell", learned: false },
                { word: "Good morning", meaning: "Greeting used in the morning", learned: false },
                { word: "Good afternoon", meaning: "Greeting used in the afternoon", learned: false },
                { word: "Good evening", meaning: "Greeting used in the evening", learned: false }
              ],
              questions: [
                {
                  question: "What do you say when you meet someone in the morning?",
                  options: ["Good night", "Good morning", "Good evening", "Goodbye"],
                  correct: 1
                },
                {
                  question: "Which word means the same as 'farewell'?",
                  options: ["Hello", "Goodbye", "Good morning", "Nice to meet you"],
                  correct: 1
                },
                {
                  question: "What should you say when meeting someone for the first time?",
                  options: ["Goodbye", "Good night", "Nice to meet you", "How are you?"],
                  correct: 2
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

export default function CoursesPage() {
  const [currentLesson, setCurrentLesson] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set())

  const lesson = lessonData.levels[0].modules[0].lessons[currentLesson]

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[questionIndex] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const handleSubmitQuiz = () => {
    setShowResults(true)
  }

  const handleMarkAsLearned = (word: string) => {
    const newLearnedWords = new Set(learnedWords)
    newLearnedWords.add(word)
    setLearnedWords(newLearnedWords)
  }

  const calculateScore = () => {
    let correct = 0
    lesson.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct) {
        correct++
      }
    })
    return Math.round((correct / lesson.questions.length) * 100)
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">English A1 – Beginner</h1>
          <p className="text-xl text-gray-300">Greetings & Introductions</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Lesson Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{lesson.title}</h2>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-gray-300">Beginner</span>
              </div>
            </div>

            {/* Lesson Content */}
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-line text-gray-300 leading-relaxed mb-6">
                {lesson.content}
              </div>
            </div>

            {/* Vocabulary Section */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-white mb-4">Key Vocabulary</h3>
              <div className="space-y-3">
                {lesson.vocabulary.map((vocab, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`p-3 rounded-lg border transition-all duration-300 ${
                      learnedWords.has(vocab.word)
                        ? 'border-neon-green bg-neon-green/10'
                        : 'border-gray-700 bg-dark-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white">{vocab.word}</span>
                        <span className="text-gray-400 ml-3">- {vocab.meaning}</span>
                      </div>
                      <button
                        onClick={() => handleMarkAsLearned(vocab.word)}
                        className={`p-2 rounded-full transition-all duration-300 ${
                          learnedWords.has(vocab.word)
                            ? 'text-neon-green bg-neon-green/20'
                            : 'text-gray-400 hover:text-neon-green hover:bg-neon-green/20'
                        }`}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Side - Interactive Questions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Practice Quiz</h3>
              <div className="flex items-center space-x-2">
                <Play className="w-5 h-5 text-neon-blue" />
                <span className="text-gray-300">Interactive</span>
              </div>
            </div>

            {!showResults ? (
              <>
                {/* Questions */}
                <div className="space-y-6 mb-6">
                  {lesson.questions.map((question, questionIndex) => (
                    <motion.div
                      key={questionIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * questionIndex }}
                      className="p-4 border border-gray-700 rounded-lg"
                    >
                      <h4 className="text-lg font-semibold text-white mb-4">
                        {questionIndex + 1}. {question.question}
                      </h4>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <button
                            key={optionIndex}
                            onClick={() => handleAnswerSelect(questionIndex, optionIndex)}
                            className={`w-full p-3 text-left rounded-lg border transition-all duration-200 ${
                              selectedAnswers[questionIndex] === optionIndex
                                ? 'border-neon-pink bg-neon-pink/20 text-white'
                                : 'border-gray-600 hover:border-neon-blue hover:bg-neon-blue/10 text-gray-300'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitQuiz}
                  disabled={selectedAnswers.length !== lesson.questions.length}
                  className={`w-full py-3 px-6 rounded-lg font-bold transition-all duration-300 ${
                    selectedAnswers.length === lesson.questions.length
                      ? 'btn-primary'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Submit Quiz
                </button>
              </>
            ) : (
              /* Results */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="mb-6">
                  <div className="text-6xl font-bold text-gradient mb-2">
                    {calculateScore()}%
                  </div>
                  <div className="text-xl text-gray-300">
                    {calculateScore() >= 80 ? 'Excellent!' : calculateScore() >= 60 ? 'Good job!' : 'Keep practicing!'}
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  {lesson.questions.map((question, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        selectedAnswers[index] === question.correct
                          ? 'bg-neon-green/20 border border-neon-green'
                          : 'bg-neon-pink/20 border border-neon-pink'
                      }`}
                    >
                      <div className="text-sm text-gray-300 mb-1">
                        Question {index + 1}
                      </div>
                      <div className="text-white">
                        {selectedAnswers[index] === question.correct ? '✓ Correct' : '✗ Incorrect'}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setShowResults(false)
                      setSelectedAnswers([])
                    }}
                    className="btn-secondary"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => {
                      // Navigate to next lesson
                      setShowResults(false)
                      setSelectedAnswers([])
                    }}
                    className="btn-primary"
                  >
                    Next Lesson
                    <ArrowRight className="ml-2 w-4 h-4 inline" />
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
