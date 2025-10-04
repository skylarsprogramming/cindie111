'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff, Play, Volume2, RotateCcw, CheckCircle, XCircle, Star } from 'lucide-react'

// Mock pronunciation data
const pronunciationData = [
  {
    id: 1,
    text: 'Hello, how are you today?',
    language: 'English',
    difficulty: 'Easy',
    audioUrl: '/api/pronunciation/hello',
    phonetic: 'həˈloʊ haʊ ɑr ju təˈdeɪ'
  },
  {
    id: 2,
    text: 'Guten Tag, wie geht es Ihnen?',
    language: 'German',
    difficulty: 'Medium',
    audioUrl: '/api/pronunciation/guten-tag',
    phonetic: 'ˈɡuːtən taːk viː ɡeːt əs ˈiːnən'
  },
  {
    id: 3,
    text: 'The quick brown fox jumps over the lazy dog.',
    language: 'English',
    difficulty: 'Hard',
    audioUrl: '/api/pronunciation/quick-brown-fox',
    phonetic: 'ðə kwɪk braʊn fɑks dʒʌmps ˈoʊvər ðə ˈleɪzi dɔɡ'
  },
  {
    id: 4,
    text: 'Ich lerne Deutsch und es macht mir Spaß.',
    language: 'German',
    difficulty: 'Hard',
    audioUrl: '/api/pronunciation/ich-lerne',
    phonetic: 'ɪç ˈlɛrnə dɔɪtʃ ʊnt ɛs maxt miːr ʃpaːs'
  }
]

export default function PronunciationPage() {
  const [currentPhrase, setCurrentPhrase] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [recordingHistory, setRecordingHistory] = useState<Array<{
    phrase: string;
    transcript: string;
    score: number;
    timestamp: Date;
  }>>([])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setTranscript(transcript)
        analyzePronunciation(transcript)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setFeedback('Speech recognition error. Please try again.')
        setShowFeedback(true)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        // Here you would typically send the audio to your backend for analysis
        console.log('Audio recorded:', audioBlob)
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start()
      }
    } catch (error) {
      console.error('Error accessing microphone:', error)
      setFeedback('Error accessing microphone. Please check permissions.')
      setShowFeedback(true)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  const playAudio = () => {
    setIsPlaying(true)
    // Simulate audio playback
    setTimeout(() => {
      setIsPlaying(false)
    }, 2000)
  }

  const analyzePronunciation = (userTranscript: string) => {
    const phrase = pronunciationData[currentPhrase].text.toLowerCase()
    const userText = userTranscript.toLowerCase()
    
    // Simple similarity calculation (in a real app, you'd use more sophisticated algorithms)
    const words = phrase.split(' ')
    const userWords = userText.split(' ')
    
    let correctWords = 0
    words.forEach(word => {
      if (userWords.includes(word)) {
        correctWords++
      }
    })
    
    const accuracy = Math.round((correctWords / words.length) * 100)
    const newScore = Math.max(0, accuracy - 20) // Penalty for mispronunciation
    
    setScore(newScore)
    
    // Generate feedback
    let feedbackText = ''
    if (newScore >= 80) {
      feedbackText = 'Excellent pronunciation! You\'re doing great!'
    } else if (newScore >= 60) {
      feedbackText = 'Good effort! Try to focus on clear articulation.'
    } else {
      feedbackText = 'Keep practicing! Listen to the audio and try to match the pronunciation.'
    }
    
    setFeedback(feedbackText)
    setShowFeedback(true)
    
    // Save to history
    setRecordingHistory(prev => [...prev, {
      phrase: pronunciationData[currentPhrase].text,
      transcript: userTranscript,
      score: newScore,
      timestamp: new Date()
    }])
  }

  const nextPhrase = () => {
    if (currentPhrase < pronunciationData.length - 1) {
      setCurrentPhrase(currentPhrase + 1)
      setTranscript('')
      setScore(0)
      setFeedback('')
      setShowFeedback(false)
    }
  }

  const previousPhrase = () => {
    if (currentPhrase > 0) {
      setCurrentPhrase(currentPhrase - 1)
      setTranscript('')
      setScore(0)
      setFeedback('')
      setShowFeedback(false)
    }
  }

  const resetCurrent = () => {
    setTranscript('')
    setScore(0)
    setFeedback('')
    setShowFeedback(false)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-neon-green'
      case 'Medium': return 'text-neon-blue'
      case 'Hard': return 'text-neon-pink'
      default: return 'text-gray-400'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-neon-green'
    if (score >= 60) return 'text-neon-blue'
    return 'text-neon-pink'
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">Pronunciation Practice</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Practice your pronunciation with AI-powered feedback. Record yourself speaking and get instant analysis.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Practice Area */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              {/* Current Phrase */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">Practice Phrase</h2>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(pronunciationData[currentPhrase].difficulty)} bg-dark-200`}>
                      {pronunciationData[currentPhrase].difficulty}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {currentPhrase + 1} of {pronunciationData.length}
                    </span>
                  </div>
                </div>

                <div className="bg-dark-200 p-6 rounded-lg mb-4">
                  <div className="text-2xl font-bold text-white mb-2">
                    {pronunciationData[currentPhrase].text}
                  </div>
                  <div className="text-gray-400 text-sm">
                    Phonetic: {pronunciationData[currentPhrase].phonetic}
                  </div>
                </div>

                {/* Audio Controls */}
                <div className="flex items-center space-x-4 mb-6">
                  <button
                    onClick={playAudio}
                    disabled={isPlaying}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      isPlaying
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'btn-secondary'
                    }`}
                  >
                    <Play className="w-4 h-4" />
                    <span>Listen</span>
                  </button>
                  <button
                    onClick={resetCurrent}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-gray-400 hover:text-white hover:bg-dark-200 transition-all duration-300"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Recording Controls */}
                <div className="text-center mb-6">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isRecording
                        ? 'bg-neon-pink shadow-lg shadow-neon-pink/50 animate-pulse'
                        : 'bg-gradient-to-r from-neon-blue to-neon-green hover:scale-110'
                    }`}
                  >
                    {isRecording ? (
                      <MicOff className="w-8 h-8 text-white" />
                    ) : (
                      <Mic className="w-8 h-8 text-white" />
                    )}
                  </button>
                  <p className="text-gray-400 mt-2">
                    {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
                  </p>
                </div>

                {/* Transcript Display */}
                {transcript && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-dark-200 p-4 rounded-lg"
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">Your Recording:</h3>
                    <p className="text-gray-300">{transcript}</p>
                  </motion.div>
                )}

                {/* Feedback */}
                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 p-4 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white">Feedback</h3>
                      <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
                        {score}%
                      </div>
                    </div>
                    <p className="text-gray-300">{feedback}</p>
                  </motion.div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={previousPhrase}
                  disabled={currentPhrase === 0}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    currentPhrase === 0
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'btn-secondary'
                  }`}
                >
                  <span>Previous</span>
                </button>
                <button
                  onClick={nextPhrase}
                  disabled={currentPhrase === pronunciationData.length - 1}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    currentPhrase === pronunciationData.length - 1
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'btn-primary'
                  }`}
                >
                  <span>Next</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Progress & History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Progress Stats */}
            <div className="card">
              <h3 className="text-xl font-bold text-white mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Average Score</span>
                  <span className="text-white font-bold">
                    {recordingHistory.length > 0
                      ? Math.round(recordingHistory.reduce((acc, curr) => acc + curr.score, 0) / recordingHistory.length)
                      : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Phrases Practiced</span>
                  <span className="text-white font-bold">{recordingHistory.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Best Score</span>
                  <span className="text-white font-bold">
                    {recordingHistory.length > 0
                      ? Math.max(...recordingHistory.map(r => r.score))
                      : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Recordings */}
            <div className="card">
              <h3 className="text-xl font-bold text-white mb-4">Recent Recordings</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recordingHistory.slice(-5).reverse().map((recording, index) => (
                  <div key={index} className="p-3 bg-dark-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">
                        {recording.timestamp.toLocaleTimeString()}
                      </span>
                      <span className={`text-sm font-bold ${getScoreColor(recording.score)}`}>
                        {recording.score}%
                      </span>
                    </div>
                    <p className="text-white text-sm mb-1 truncate">
                      {recording.phrase}
                    </p>
                    <p className="text-gray-400 text-xs truncate">
                      You said: {recording.transcript}
                    </p>
                  </div>
                ))}
                {recordingHistory.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-4">
                    No recordings yet. Start practicing!
                  </p>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="card">
              <h3 className="text-xl font-bold text-white mb-4">Pronunciation Tips</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start space-x-2">
                  <Star className="w-4 h-4 text-neon-yellow mt-0.5 flex-shrink-0" />
                  <span>Speak clearly and at a moderate pace</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Star className="w-4 h-4 text-neon-yellow mt-0.5 flex-shrink-0" />
                  <span>Listen to the audio multiple times before recording</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Star className="w-4 h-4 text-neon-yellow mt-0.5 flex-shrink-0" />
                  <span>Focus on individual sounds and word stress</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Star className="w-4 h-4 text-neon-yellow mt-0.5 flex-shrink-0" />
                  <span>Practice regularly for best results</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
