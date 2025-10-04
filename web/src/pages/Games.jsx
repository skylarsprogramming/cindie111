import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LoadingSpinner from '../components/LoadingSpinner'

const Games = () => {
  const [currentGame, setCurrentGame] = useState('word-match')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameData, setGameData] = useState(null)
  const [selectedTiles, setSelectedTiles] = useState([])
  const [matchedPairs, setMatchedPairs] = useState([])
  const [gameComplete, setGameComplete] = useState(false)
  const [showFeedback, setShowFeedback] = useState(null)
  const [loading, setLoading] = useState(false)

  // Word Match Game Data
  const wordMatchData = [
    { word: 'rapid', meaning: 'very fast', id: 1 },
    { word: 'assist', meaning: 'to help', id: 2 },
    { word: 'purchase', meaning: 'to buy', id: 3 },
    { word: 'depart', meaning: 'to leave', id: 4 },
    { word: 'examine', meaning: 'to look at carefully', id: 5 },
    { word: 'generate', meaning: 'to create', id: 6 },
  ]

  // Sentence Builder Game Data
  const sentenceBuilderData = [
    { sentence: 'I am reading a book', words: ['I', 'am', 'reading', 'a', 'book'] },
    { sentence: 'She goes to school', words: ['She', 'goes', 'to', 'school'] },
    { sentence: 'They are playing football', words: ['They', 'are', 'playing', 'football'] },
    { sentence: 'We have finished our homework', words: ['We', 'have', 'finished', 'our', 'homework'] },
  ]

  useEffect(() => {
    loadHighScore()
    initializeGame()
  }, [currentGame])

  const loadHighScore = () => {
    const saved = localStorage.getItem(`cindie-highscore-${currentGame}`)
    if (saved) {
      setHighScore(parseInt(saved))
    }
  }

  const saveHighScore = (newScore) => {
    if (newScore > highScore) {
      setHighScore(newScore)
      localStorage.setItem(`cindie-highscore-${currentGame}`, newScore.toString())
    }
  }

  const playSound = (type) => {
    // Create audio context for sound effects
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    if (type === 'correct') {
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1)
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
    } else if (type === 'incorrect') {
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1)
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
    }
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.2)
  }

  const initializeGame = () => {
    setScore(0)
    setSelectedTiles([])
    setMatchedPairs([])
    setGameComplete(false)
    setShowFeedback(null)

    if (currentGame === 'word-match') {
      const shuffled = [...wordMatchData, ...wordMatchData].sort(() => Math.random() - 0.5)
      setGameData(shuffled.map((item, index) => ({ ...item, index, revealed: false })))
    } else if (currentGame === 'sentence-builder') {
      const randomSentence = sentenceBuilderData[Math.floor(Math.random() * sentenceBuilderData.length)]
      const shuffledWords = [...randomSentence.words].sort(() => Math.random() - 0.5)
      setGameData({ ...randomSentence, shuffledWords, userWords: [] })
    }
  }

  const handleWordMatchClick = (tile) => {
    if (tile.revealed || selectedTiles.length >= 2) return

    const newSelectedTiles = [...selectedTiles, tile]
    setSelectedTiles(newSelectedTiles)

    // Reveal the tile
    setGameData(prev => prev.map(t => 
      t.index === tile.index ? { ...t, revealed: true } : t
    ))

    if (newSelectedTiles.length === 2) {
      setTimeout(() => {
        checkWordMatch(newSelectedTiles)
      }, 500)
    }
  }

  const checkWordMatch = (tiles) => {
    const [tile1, tile2] = tiles
    const isMatch = tile1.word === tile2.word && tile1.id === tile2.id

    if (isMatch) {
      setMatchedPairs(prev => [...prev, tile1.id])
      setScore(prev => prev + 10)
      playSound('correct')
      setShowFeedback({ type: 'correct', message: 'Great match!' })
      
      // Check if game is complete
      if (matchedPairs.length + 1 === wordMatchData.length) {
        setGameComplete(true)
        saveHighScore(score + 10)
      }
    } else {
      // Hide tiles
      setGameData(prev => prev.map(t => 
        tiles.some(selected => selected.index === t.index) ? { ...t, revealed: false } : t
      ))
      playSound('incorrect')
      setShowFeedback({ type: 'incorrect', message: 'Try again!' })
    }

    setSelectedTiles([])
    setTimeout(() => setShowFeedback(null), 1000)
  }

  const handleSentenceBuilderClick = (word, source) => {
    if (source === 'pool') {
      setGameData(prev => ({
        ...prev,
        shuffledWords: prev.shuffledWords.filter(w => w !== word),
        userWords: [...prev.userWords, word]
      }))
    } else {
      setGameData(prev => ({
        ...prev,
        userWords: prev.userWords.filter(w => w !== word),
        shuffledWords: [...prev.shuffledWords, word]
      }))
    }
  }

  const checkSentence = () => {
    const userSentence = gameData.userWords.join(' ')
    const isCorrect = userSentence === gameData.sentence

    if (isCorrect) {
      setScore(prev => prev + 50)
      playSound('correct')
      setShowFeedback({ type: 'correct', message: 'Perfect sentence!' })
      setGameComplete(true)
      saveHighScore(score + 50)
    } else {
      playSound('incorrect')
      setShowFeedback({ type: 'incorrect', message: `Try again! Answer: ${gameData.sentence}` })
    }
    setTimeout(() => setShowFeedback(null), 2000)
  }

  const resetGame = () => {
    initializeGame()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Language Games
          </h1>
          
          {/* Game Selector */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setCurrentGame('word-match')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentGame === 'word-match'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Word Match
            </button>
            <button
              onClick={() => setCurrentGame('sentence-builder')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentGame === 'sentence-builder'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Sentence Builder
            </button>
          </div>

          {/* Score Display */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Score</p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{score}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">High Score</p>
                <p className="text-2xl font-bold text-accent-600 dark:text-accent-400">{highScore}</p>
              </div>
            </div>
            <button
              onClick={resetGame}
              className="btn btn-secondary"
            >
              Reset Game
            </button>
          </div>
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg font-medium ${
                showFeedback.type === 'correct'
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}
            >
              {showFeedback.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Area */}
        <div className="card p-8">
          {currentGame === 'word-match' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                Match words with their meanings
              </h2>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {gameData?.map((tile) => (
                  <motion.div
                    key={`${tile.id}-${tile.index}`}
                    className={`game-tile card p-4 text-center cursor-pointer min-h-[80px] flex items-center justify-center ${
                      tile.revealed ? 'bg-primary-50 dark:bg-primary-900' : 'bg-gray-100 dark:bg-gray-700'
                    } ${
                      matchedPairs.includes(tile.id) ? 'opacity-50 pointer-events-none' : ''
                    }`}
                    onClick={() => handleWordMatchClick(tile)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={tile.revealed ? { rotateY: 180 } : { rotateY: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {tile.revealed ? (tile.word || tile.meaning) : '?'}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {currentGame === 'sentence-builder' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                Build the correct sentence
              </h2>
              
              {/* Word Pool */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Available Words:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {gameData?.shuffledWords.map((word, index) => (
                    <motion.button
                      key={index}
                      className="btn btn-secondary"
                      onClick={() => handleSentenceBuilderClick(word, 'pool')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {word}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* User Sentence */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Your Sentence:
                </h3>
                <div className="min-h-[60px] p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <div className="flex flex-wrap gap-2">
                    {gameData?.userWords.map((word, index) => (
                      <motion.button
                        key={index}
                        className="btn btn-primary"
                        onClick={() => handleSentenceBuilderClick(word, 'sentence')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {word}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={checkSentence}
                  className="btn btn-accent px-8 py-3"
                  disabled={!gameData?.userWords.length}
                >
                  Check Sentence
                </button>
              </div>
            </div>
          )}

          {/* Game Complete Modal */}
          <AnimatePresence>
            {gameComplete && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="card p-8 max-w-md mx-4 text-center"
                >
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Game Complete!
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                    Final Score: <span className="font-bold text-primary-600 dark:text-primary-400">{score}</span>
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={resetGame}
                      className="btn btn-primary w-full"
                    >
                      Play Again
                    </button>
                    <button
                      onClick={() => setCurrentGame(currentGame === 'word-match' ? 'sentence-builder' : 'word-match')}
                      className="btn btn-secondary w-full"
                    >
                      Switch Game
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default Games
