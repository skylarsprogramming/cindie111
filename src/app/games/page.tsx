'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Gamepad2, Clock, Target, Zap, RotateCcw, CheckCircle, XCircle } from 'lucide-react'

// Game data
const vocabularyData = [
  { word: 'Hello', translation: 'Hallo', category: 'Greetings' },
  { word: 'Goodbye', translation: 'Auf Wiedersehen', category: 'Greetings' },
  { word: 'Thank you', translation: 'Danke', category: 'Politeness' },
  { word: 'Please', translation: 'Bitte', category: 'Politeness' },
  { word: 'Water', translation: 'Wasser', category: 'Basic Items' },
  { word: 'Bread', translation: 'Brot', category: 'Food' },
  { word: 'House', translation: 'Haus', category: 'Places' },
  { word: 'Car', translation: 'Auto', category: 'Transport' }
]

const grammarData = [
  {
    sentence: 'I ___ to school every day.',
    options: ['go', 'goes', 'going', 'went'],
    correct: 'go',
    explanation: 'Use the base form of the verb for present simple with "I"'
  },
  {
    sentence: 'She ___ a beautiful dress yesterday.',
    options: ['wears', 'wore', 'wearing', 'wear'],
    correct: 'wore',
    explanation: 'Use past simple for actions completed in the past'
  },
  {
    sentence: 'They ___ studying for the exam.',
    options: ['is', 'are', 'am', 'be'],
    correct: 'are',
    explanation: 'Use "are" with plural subjects (they)'
  }
]

const speedQuizData = [
  { question: 'What is the German word for "Hello"?', answer: 'Hallo', options: ['Hallo', 'Tschüss', 'Danke', 'Bitte'] },
  { question: 'How do you say "Thank you" in German?', answer: 'Danke', options: ['Bitte', 'Danke', 'Hallo', 'Tschüss'] },
  { question: 'What does "Bitte" mean in English?', answer: 'Please', options: ['Thank you', 'Hello', 'Please', 'Goodbye'] },
  { question: 'How do you say "Goodbye" in German?', answer: 'Tschüss', options: ['Hallo', 'Danke', 'Bitte', 'Tschüss'] },
  { question: 'What is the German word for "Water"?', answer: 'Wasser', options: ['Brot', 'Wasser', 'Haus', 'Auto'] }
]

export default function GamesPage() {
  const [activeGame, setActiveGame] = useState<'vocabulary' | 'grammar' | 'speed'>('vocabulary')
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'results'>('menu')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [currentQuestion, setCurrentQuestion] = useState(0)

  // Vocabulary Game State
  const [vocabCards, setVocabCards] = useState<Array<{ id: number; word: string; translation: string; isFlipped: boolean; isMatched: boolean }>>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])

  // Grammar Game State
  const [grammarAnswers, setGrammarAnswers] = useState<string[]>([])
  const [grammarCurrent, setGrammarCurrent] = useState(0)

  // Speed Quiz State
  const [speedAnswers, setSpeedAnswers] = useState<string[]>([])
  const [speedCurrent, setSpeedCurrent] = useState(0)

  useEffect(() => {
    if (gameState === 'playing' && activeGame === 'speed') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endSpeedQuiz()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [gameState, activeGame])

  const startGame = (game: 'vocabulary' | 'grammar' | 'speed') => {
    setActiveGame(game)
    setGameState('playing')
    setScore(0)
    setCurrentQuestion(0)
    setTimeLeft(60)
    
    if (game === 'vocabulary') {
      initializeVocabGame()
    } else if (game === 'grammar') {
      setGrammarCurrent(0)
      setGrammarAnswers([])
    } else if (game === 'speed') {
      setSpeedCurrent(0)
      setSpeedAnswers([])
    }
  }

  const initializeVocabGame = () => {
    const shuffled = [...vocabularyData, ...vocabularyData]
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({
        id: index,
        word: item.word,
        translation: item.translation,
        isFlipped: false,
        isMatched: false
      }))
    setVocabCards(shuffled)
    setFlippedCards([])
  }

  const handleVocabCardClick = (cardId: number) => {
    if (flippedCards.length === 2 || vocabCards[cardId].isMatched) return

    const newCards = [...vocabCards]
    newCards[cardId].isFlipped = true
    setVocabCards(newCards)

    const newFlipped = [...flippedCards, cardId]
    setFlippedCards(newFlipped)

    if (newFlipped.length === 2) {
      setTimeout(() => {
        checkVocabMatch(newFlipped)
      }, 1000)
    }
  }

  const checkVocabMatch = (flipped: number[]) => {
    const [first, second] = flipped
    const card1 = vocabCards[first]
    const card2 = vocabCards[second]

    if (card1.word === card2.word || card1.translation === card2.translation) {
      // Match found
      const newCards = [...vocabCards]
      newCards[first].isMatched = true
      newCards[second].isMatched = true
      setVocabCards(newCards)
      setScore(score + 10)
    }

    // Reset flipped cards
    setFlippedCards([])
    setTimeout(() => {
      const newCards = [...vocabCards]
      newCards[first].isFlipped = false
      newCards[second].isFlipped = false
      setVocabCards(newCards)
    }, 500)

    // Check if game is complete
    if (vocabCards.every(card => card.isMatched)) {
      setTimeout(() => {
        setGameState('results')
      }, 1000)
    }
  }

  const handleGrammarAnswer = (answer: string) => {
    const newAnswers = [...grammarAnswers, answer]
    setGrammarAnswers(newAnswers)
    
    if (answer === grammarData[grammarCurrent].correct) {
      setScore(score + 10)
    }

    if (grammarCurrent < grammarData.length - 1) {
      setGrammarCurrent(grammarCurrent + 1)
    } else {
      setTimeout(() => {
        setGameState('results')
      }, 1000)
    }
  }

  const handleSpeedAnswer = (answer: string) => {
    const newAnswers = [...speedAnswers, answer]
    setSpeedAnswers(newAnswers)
    
    if (answer === speedQuizData[speedCurrent].answer) {
      setScore(score + 10)
    }

    if (speedCurrent < speedQuizData.length - 1) {
      setSpeedCurrent(speedCurrent + 1)
    } else {
      endSpeedQuiz()
    }
  }

  const endSpeedQuiz = () => {
    setGameState('results')
  }

  const resetGame = () => {
    setGameState('menu')
    setScore(0)
    setCurrentQuestion(0)
    setTimeLeft(60)
  }

  const renderGameMenu = () => (
    <div className="text-center">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-gradient mb-8"
      >
        Language Games
      </motion.h1>
      <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
        Practice your language skills with these interactive games. Choose a game to get started!
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {[
          {
            id: 'vocabulary',
            title: 'Vocabulary Matching',
            description: 'Match English words with their German translations',
            icon: Target,
            color: 'from-neon-pink to-neon-purple'
          },
          {
            id: 'grammar',
            title: 'Grammar Builder',
            description: 'Complete sentences with the correct grammar',
            icon: Zap,
            color: 'from-neon-blue to-neon-green'
          },
          {
            id: 'speed',
            title: 'Speed Quiz',
            description: 'Answer questions as fast as you can in 60 seconds',
            icon: Clock,
            color: 'from-neon-green to-neon-pink'
          }
        ].map((game) => {
          const Icon = game.icon
          return (
            <motion.div
              key={game.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="card cursor-pointer hover:shadow-lg hover:shadow-neon-pink/20 transition-all duration-300"
              onClick={() => startGame(game.id as any)}
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${game.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{game.title}</h3>
              <p className="text-gray-400">{game.description}</p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )

  const renderVocabularyGame = () => (
    <div className="text-center">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">Vocabulary Matching</h2>
        <div className="text-2xl font-bold text-neon-green">Score: {score}</div>
      </div>
      
      <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto">
        {vocabCards.map((card) => (
          <motion.div
            key={card.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`aspect-square cursor-pointer rounded-lg border-2 transition-all duration-300 ${
              card.isMatched
                ? 'border-neon-green bg-neon-green/20'
                : card.isFlipped
                ? 'border-neon-pink bg-neon-pink/20'
                : 'border-gray-600 bg-dark-200 hover:border-neon-blue'
            }`}
            onClick={() => handleVocabCardClick(card.id)}
          >
            <div className="h-full flex items-center justify-center p-4">
              {card.isFlipped || card.isMatched ? (
                <span className="text-white font-bold text-sm text-center">
                  {card.id % 2 === 0 ? card.word : card.translation}
                </span>
              ) : (
                <span className="text-gray-400 text-2xl">?</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const renderGrammarGame = () => (
    <div className="text-center max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">Grammar Builder</h2>
        <div className="text-2xl font-bold text-neon-green">Score: {score}</div>
      </div>
      
      <div className="card mb-8">
        <h3 className="text-xl font-bold text-white mb-6">
          Question {grammarCurrent + 1} of {grammarData.length}
        </h3>
        <p className="text-lg text-gray-300 mb-6">
          {grammarData[grammarCurrent].sentence}
        </p>
        <div className="grid grid-cols-2 gap-4">
          {grammarData[grammarCurrent].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleGrammarAnswer(option)}
              className="btn-secondary text-lg py-4"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSpeedQuiz = () => (
    <div className="text-center max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">Speed Quiz</h2>
        <div className="text-2xl font-bold text-neon-green">Score: {score}</div>
      </div>
      
      <div className="text-4xl font-bold text-neon-pink mb-8">
        Time: {timeLeft}s
      </div>
      
      <div className="card mb-8">
        <h3 className="text-xl font-bold text-white mb-6">
          Question {speedCurrent + 1} of {speedQuizData.length}
        </h3>
        <p className="text-lg text-gray-300 mb-6">
          {speedQuizData[speedCurrent].question}
        </p>
        <div className="grid grid-cols-2 gap-4">
          {speedQuizData[speedCurrent].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSpeedAnswer(option)}
              className="btn-secondary text-lg py-4"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderResults = () => (
    <div className="text-center max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card"
      >
        <h2 className="text-4xl font-bold text-white mb-4">Game Complete!</h2>
        <div className="text-6xl font-bold text-gradient mb-6">{score}</div>
        <div className="text-xl text-gray-300 mb-8">Points Earned</div>
        
        <div className="flex space-x-4 justify-center">
          <button onClick={resetGame} className="btn-secondary">
            <RotateCcw className="w-5 h-5 mr-2 inline" />
            Play Again
          </button>
          <button onClick={() => setGameState('menu')} className="btn-primary">
            Back to Menu
          </button>
        </div>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {gameState === 'menu' && renderGameMenu()}
        {gameState === 'playing' && activeGame === 'vocabulary' && renderVocabularyGame()}
        {gameState === 'playing' && activeGame === 'grammar' && renderGrammarGame()}
        {gameState === 'playing' && activeGame === 'speed' && renderSpeedQuiz()}
        {gameState === 'results' && renderResults()}
      </div>
    </div>
  )
}
