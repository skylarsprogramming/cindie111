import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutes in seconds
  const [answers, setAnswers] = useState([])
  const [difficulty, setDifficulty] = useState({ grammar: 2, reading: 2, listening: 2 })
  const [sectionScores, setSectionScores] = useState({ grammar: 0, reading: 0, listening: 0 })
  const [sectionAttempts, setSectionAttempts] = useState({ grammar: 0, reading: 0, listening: 0 })
  const [usedQuestions, setUsedQuestions] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [preferredVoice, setPreferredVoice] = useState(null)
  const navigate = useNavigate()
  const timerRef = useRef(null)

  // Question banks per difficulty (1-easy .. 5-hard)
  const questionBank = {
    grammar: {
      1: [
        { id: 'g1', q: 'Choose the correct form: She ____ to school every day.', options: ['go', 'goes', 'is go'], a: 1 },
        { id: 'g2', q: 'Select the correct article: I bought ____ umbrella.', options: ['a', 'an', 'the'], a: 1 },
        { id: 'g3', q: 'Pick the correct form: They ____ happy.', options: ['is', 'are', 'am'], a: 1 },
        { id: 'g4', q: 'Choose the correct verb: I ____ a book yesterday.', options: ['read', 'reads', 'reading'], a: 0 },
      ],
      2: [
        { id: 'g5', q: 'Pick the correct tense: They ____ dinner when I called.', options: ['were having', 'are having', 'have'], a: 0 },
        { id: 'g6', q: 'Which is correct?', options: ["He don't like tea.", "He doesn't like tea.", 'He not like tea.'], a: 1 },
        { id: 'g7', q: 'Choose the correct form: She has ____ to Paris.', options: ['go', 'went', 'gone'], a: 2 },
        { id: 'g8', q: 'Select the right option: I wish I ____ taller.', options: ['am', 'was', 'were'], a: 2 },
      ],
      3: [
        { id: 'g9', q: 'Choose the modal: You ____ see a doctor.', options: ['should', 'can to', 'must to'], a: 0 },
        { id: 'g10', q: 'Identify the error: He suggested to go.', options: ['Correct', 'Use: going', 'Use: go'], a: 1 },
        { id: 'g11', q: 'Pick the correct form: If I ____ you, I would help.', options: ['am', 'was', 'were'], a: 2 },
        { id: 'g12', q: 'Choose the best option: The book ____ by many people.', options: ['is reading', 'is read', 'is being read'], a: 2 },
      ],
      4: [
        { id: 'g13', q: 'Choose the best option: If I ____ more time, I would travel.', options: ['have', 'had', 'would have'], a: 1 },
        { id: 'g14', q: 'Pick the correct sentence.', options: ['Hardly I had arrived when it started to rain.', 'Hardly had I arrived when it started to rain.', 'I had hardly arrived when it starts to rain.'], a: 1 },
        { id: 'g15', q: 'Select the correct form: I would rather you ____ here.', options: ['stay', 'stayed', 'staying'], a: 1 },
        { id: 'g16', q: 'Choose the best option: Not only ____ late, but he also forgot his keys.', options: ['he was', 'was he', 'he is'], a: 1 },
      ],
      5: [
        { id: 'g17', q: 'Select the correct form: It\'s high time we ____.', options: ['go', 'went', 'had gone'], a: 1 },
        { id: 'g18', q: 'Find the best option: No sooner ____ the bus than it started raining.', options: ['I got on', 'had I got on', 'I had got on'], a: 1 },
        { id: 'g19', q: 'Choose the correct form: Were I you, I ____ differently.', options: ['act', 'acted', 'would act'], a: 2 },
        { id: 'g20', q: 'Select the best option: Little ____ he know what was coming.', options: ['did', 'does', 'do'], a: 0 },
      ],
    },
    reading: {
      1: [
        {
          id: 'r1',
          paragraph: 'Tom works from 9 to 5 at a small shop near his house. He usually has lunch at 12:30. After work, he goes home and watches TV.',
          q: 'When does Tom finish work?', options: ['At 9', 'At 5', 'At 12:30'], a: 1
        },
        {
          id: 'r2',
          paragraph: 'Sarah loves reading books. She reads every evening before bed. Her favorite books are mystery novels. She has read over 100 books this year.',
          q: 'What type of books does Sarah prefer?', options: ['Romance', 'Mystery', 'Science fiction'], a: 1
        },
      ],
      2: [
        {
          id: 'r3',
          paragraph: 'The Digital Divide. The term "digital divide" refers to the gap between individuals and communities who have access to information technology and those who do not. This disparity affects education, employment, and social participation. Bridging the divide requires affordable internet access and digital literacy programs.',
          q: 'Which of the following is NOT mentioned as a consequence of the digital divide?', options: ['Limited educational opportunities', 'Reduced employment chances', 'Social exclusion', 'Physical health problems'], a: 3
        },
        {
          id: 'r4',
          paragraph: 'Climate Change Impact. Rising global temperatures are causing significant changes in weather patterns worldwide. These changes include more frequent extreme weather events, rising sea levels, and shifts in precipitation patterns. Scientists predict that without immediate action, these effects will become more severe.',
          q: 'According to the passage, what is NOT mentioned as a weather-related change?', options: ['More extreme weather', 'Rising sea levels', 'Shifting precipitation', 'Increased earthquakes'], a: 3
        },
      ],
      3: [
        {
          id: 'r5',
          paragraph: 'Ancient Architecture. The construction of ancient monuments, such as the Pyramids of Giza, required not only remarkable engineering skills but also a sophisticated understanding of mathematics and astronomy. These structures were aligned with celestial bodies, suggesting that ancient civilizations had complex observational knowledge.',
          q: 'The passage implies that:', options: ['Ancient civilizations had little knowledge of astronomy', 'Monument construction was purely decorative', 'Advanced mathematics and astronomy were used in monument constructions', 'Modern engineers cannot replicate ancient monuments'], a: 2
        },
        {
          id: 'r6',
          paragraph: 'Economic Globalization. The process of economic globalization has accelerated dramatically over the past three decades. This phenomenon involves the increasing integration of national economies through trade, investment, and technology transfer. While globalization has created opportunities for economic growth, it has also raised concerns about income inequality and cultural homogenization.',
          q: 'What does the passage suggest about globalization?', options: ['It has only positive effects', 'It creates both opportunities and challenges', 'It mainly affects technology', 'It reduces cultural diversity'], a: 1
        },
      ],
      4: [
        {
          id: 'r7',
          paragraph: 'Sleep and Memory. Studies have indicated that adequate sleep is crucial for memory consolidation. During certain stages of sleep, the brain processes information learned during the day, strengthening neural connections and facilitating long-term retention. Lack of sleep can significantly impair cognitive performance.',
          q: 'Which statement best summarizes the passage?', options: ['Memory is not affected by sleep', 'Sleep helps the brain store and strengthen information', 'Only short naps are effective for learning', 'Sleep is only important for physical health'], a: 1
        },
        {
          id: 'r8',
          paragraph: 'Artificial Intelligence Ethics. As artificial intelligence systems become more sophisticated, questions about their ethical implications have gained prominence. These concerns include issues of bias in AI algorithms, privacy protection, and the potential displacement of human workers. Addressing these challenges requires collaboration between technologists, ethicists, and policymakers.',
          q: 'The passage suggests that AI ethics requires:', options: ['Only technological solutions', 'Collaboration across multiple fields', 'Government regulation only', 'Individual responsibility'], a: 1
        },
      ],
      5: [
        {
          id: 'r9',
          paragraph: 'Renewable Energy Development. Renewable energy technologies have advanced rapidly in the past decade. Wind and solar power are now more cost-effective than fossil fuels in many regions. However, challenges remain, including the intermittency of supply and the need for large-scale energy storage solutions.',
          q: 'The passage suggests that:', options: ['Renewable energy is cheaper than fossil fuels everywhere', 'There are still technical challenges to fully replacing fossil fuels', 'Storage of fossil fuels is more problematic than renewable energy', 'Wind power is less efficient than solar energy'], a: 1
        },
        {
          id: 'r10',
          paragraph: 'Quantum Computing Revolution. Quantum computing represents a paradigm shift in computational capabilities, leveraging quantum mechanical phenomena to process information in ways that classical computers cannot. While still in its infancy, quantum computing promises to revolutionize fields such as cryptography, drug discovery, and optimization problems.',
          q: 'According to the passage, quantum computing is:', options: ['Already widely used', 'Still in early development', 'Only useful for cryptography', 'A replacement for all classical computers'], a: 1
        },
      ],
    },
    listening: {
      1: [
        { id: 'l1', tts: 'On Monday morning, a small meeting room will be booked for a team discussion. It will accommodate eight people. A projector will be available, and water bottles will be provided. Attendees should arrive on time. The discussion will cover project updates and planning for next month.',
           q: 'What day is the meeting scheduled?', options: ['Sunday', 'Monday', 'Tuesday', 'Wednesday'], a: 1 },
        { id: 'l2', tts: 'The library is open from 9 AM to 8 PM on weekdays. On weekends, it opens at 10 AM and closes at 6 PM. Students can borrow up to 10 books for two weeks. Late returns will result in a small fine.',
           q: 'How many books can students borrow?', options: ['5', '10', '15', '20'], a: 1 },
      ],
      2: [
        { id: 'l3', tts: 'Next Wednesday, the library will host a workshop on digital marketing. The session starts at 2 p.m. and will last two hours. Participants will learn about social media campaigns and content creation strategies. Handouts will be given at the beginning. Please register online to reserve seats.',
           q: 'How can participants reserve seats?', options: ['By calling the library', 'By registering online', 'By attending without registration', 'By emailing the instructor'], a: 1 },
        { id: 'l4', tts: 'The train to Manchester departs from platform 3 at 14:30. Passengers are advised to arrive 10 minutes early. The journey takes approximately 2 hours and 15 minutes. Refreshments are available on board.',
           q: 'What time does the train depart?', options: ['14:20', '14:30', '14:40', '15:00'], a: 1 },
      ],
      3: [
        { id: 'l5', tts: 'Tomorrow, a bakery will run a one-hour sourdough bread demonstration. Ingredients and tools will be provided. Participants should bring their own aprons and arrive 15 minutes early for setup.',
           q: 'What are attendees expected to wear?', options: ['Casual clothes', 'Aprons', 'Gloves', 'Hats'], a: 1 },
        { id: 'l6', tts: 'The conference center has three main halls. Hall A seats 200 people, Hall B seats 150, and Hall C seats 100. All halls are equipped with projectors and sound systems. Parking is available in the underground garage.',
           q: 'Which hall has the largest capacity?', options: ['Hall A', 'Hall B', 'Hall C', 'All are equal'], a: 0 },
      ],
      4: [
        { id: 'l7', tts: 'On Tuesday morning, a local community center will host a yoga session for beginners. Mats and water bottles will be provided. The instructor has 15 years of experience teaching various yoga styles.',
           q: 'Who is the yoga session intended for?', options: ['Beginners', 'Children only', 'Seniors', 'Advanced practitioners'], a: 0 },
        { id: 'l8', tts: 'The museum exhibition on ancient civilizations runs until the end of the month. Admission is free for students with valid ID. Guided tours are available every hour from 10 AM to 4 PM. Photography is permitted in most areas.',
           q: 'What is required for free admission?', options: ['Booking in advance', 'Student ID', 'Group membership', 'Senior citizen status'], a: 1 },
      ],
      5: [
        { id: 'l9', tts: 'The train to Oxford is delayed by fifteen minutes due to signal problems. Passengers are advised to check the departure board for updates. Alternative transport options are available at the information desk.',
           q: 'What happened?', options: ['Arrived early', 'On time', 'Delayed', 'Cancelled'], a: 2 },
        { id: 'l10', tts: 'The annual technology conference will feature keynote speakers from major tech companies. Registration closes next Friday. Early bird discounts are available until the end of this week. Networking sessions are scheduled throughout the three-day event.',
           q: 'When does registration close?', options: ['This Friday', 'Next Friday', 'End of this week', 'During the event'], a: 1 },
      ],
    }
  }

  const skills = ['grammar', 'reading', 'listening']
  const maxQuestions = 15

  useEffect(() => {
    // Initialize voice
    const initializeVoice = () => {
      const voices = window.speechSynthesis?.getVoices?.() || []
      // Updated voice preferences - prioritizing Microsoft voices
      const preferredVoices = [
        'Microsoft Mark - English (United States)',
        'Microsoft David - English (United States)', 
        'Microsoft Zira - English (United States)',
        'Google UK English Female',
        'Google US English',
        'en-US',
        'en-GB'
      ]
      
      for (const voiceName of preferredVoices) {
        const voice = voices.find(v => 
          v.name.includes(voiceName) || 
          v.name === voiceName || 
          v.lang === voiceName
        )
        if (voice) {
          setPreferredVoice(voice)
          break
        }
      }
      
      if (!preferredVoice && voices.length > 0) {
        setPreferredVoice(voices[0])
      }
    }

    initializeVoice()
    
    // Listen for voices loaded
    if (window.speechSynthesis) {
      window.speechSynthesis.addEventListener('voiceschanged', initializeVoice)
    }

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          finishQuiz()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const speak = (text) => {
    try {
      if (!preferredVoice) return
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.voice = preferredVoice
      utterance.rate = 0.9 // Slightly slower for better comprehension
      utterance.pitch = 1.0
      utterance.lang = preferredVoice.lang || 'en-US'
      
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
    } catch (error) {
      console.error('Speech synthesis error:', error)
    }
  }

  const getCurrentSkill = () => {
    return skills[currentQuestion % skills.length]
  }

  const getQuestion = (skill) => {
    const level = difficulty[skill]
    const bank = questionBank[skill][level]
    const available = bank.filter(q => !usedQuestions.has(q.id))
    
    if (available.length === 0) {
      // Fallback to nearby difficulty levels
      for (let delta = 1; delta <= 4; delta++) {
        const up = Math.min(5, level + delta)
        const down = Math.max(1, level - delta)
        
        const upBank = questionBank[skill][up]?.find(q => !usedQuestions.has(q.id))
        if (upBank) return { ...upBank, type: skill, level: up }
        
        const downBank = questionBank[skill][down]?.find(q => !usedQuestions.has(q.id))
        if (downBank) return { ...downBank, type: skill, level: down }
      }
    }
    
    const question = available[Math.floor(Math.random() * available.length)]
    return { ...question, type: skill, level }
  }

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex)
  }

  const handleNext = () => {
    if (selectedAnswer === null) {
      toast.error('Please select an answer before continuing.')
      return
    }

    const skill = getCurrentSkill()
    const question = getQuestion(skill)
    const isCorrect = selectedAnswer === question.a

    // Update scores and attempts
    setSectionAttempts(prev => ({
      ...prev,
      [skill]: prev[skill] + 1
    }))

    if (isCorrect) {
      setSectionScores(prev => ({
        ...prev,
        [skill]: prev[skill] + 1
      }))
    }

    // Adaptive difficulty adjustment
    setDifficulty(prev => ({
      ...prev,
      [skill]: isCorrect 
        ? Math.min(5, prev[skill] + 1)
        : Math.max(1, prev[skill] - 1)
    }))

    // Add to used questions
    setUsedQuestions(prev => new Set([...prev, question.id]))

    // Store answer
    setAnswers(prev => [...prev, {
      questionId: question.id,
      skill,
      level: question.level,
      selectedAnswer,
      correctAnswer: question.a,
      isCorrect,
      timeSpent: 15 * 60 - timeLeft
    }])

    // Check if quiz is complete
    if (currentQuestion + 1 >= maxQuestions) {
      finishQuiz()
      return
    }

    // Move to next question
    setCurrentQuestion(prev => prev + 1)
    setSelectedAnswer(null)
  }

  const finishQuiz = async () => {
    setLoading(true)
    
    const result = {
      sectionScores,
      sectionMax: sectionAttempts,
      total: Object.values(sectionScores).reduce((sum, score) => sum + score, 0),
      max: Object.values(sectionAttempts).reduce((sum, attempts) => sum + attempts, 0),
      answers,
      difficulty,
      durationMs: (15 * 60 - timeLeft) * 1000,
      completedAt: Date.now()
    }

    try {
      // Save to localStorage
      localStorage.setItem('cindie_quiz_result', JSON.stringify(result))
      localStorage.setItem('cindie_quiz_completed', '1')

      // Generate recommendations based on performance
      const strengths = Object.entries(sectionScores)
        .sort((a, b) => (b[1] || 0) - (a[1] || 0))
        .map(([skill]) => skill)

      const recommendations = [
        { title: 'English Fundamentals', id: 'course_fundamentals', focus: 'grammar' },
        { title: `${strengths[0]?.[0]?.toUpperCase() || 'G'}${(strengths[0] || 'grammar').slice(1)} Mastery`, id: 'course_focus_1', focus: strengths[0] || 'grammar' },
        { title: `${strengths[1]?.[0]?.toUpperCase() || 'R'}${(strengths[1] || 'reading').slice(1)} Practice`, id: 'course_focus_2', focus: strengths[1] || 'reading' },
      ]

      localStorage.setItem('cindie_recommendations', JSON.stringify(recommendations))

      // Initialize dashboard data
      localStorage.setItem('cindie_dashboard', JSON.stringify({
        totalXP: result.total * 10,
        weeklyTarget: 100,
        weeklyProgress: 0,
        streak: 1,
        coursesCompleted: 0,
        gamesPlayed: 0,
        highScore: 0
      }))

      // Send to backend if available
      try {
        await fetch('/api/placement/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ result, recommendations })
        })
      } catch (error) {
        console.log('Backend not available, using localStorage only')
      }

      toast.success('Quiz completed! Redirecting to dashboard...')
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)

    } catch (error) {
      toast.error('Error saving quiz results')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const currentSkill = getCurrentSkill()
  const question = getQuestion(currentSkill)
  const progress = ((currentQuestion + 1) / maxQuestions) * 100

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" text="Processing your results..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Placement Quiz
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            15 questions across grammar, reading, and listening. Takes ~5 minutes.
          </p>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Question {currentQuestion + 1} of {maxQuestions}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatTime(timeLeft)}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Info */}
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm font-medium">
              {currentSkill.charAt(0).toUpperCase() + currentSkill.slice(1)} • Level {question.level}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatTime(timeLeft)} remaining
            </span>
          </div>
        </div>

        {/* Question Card */}
        <motion.div 
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="card p-8"
        >
          {/* Reading Passage */}
          {currentSkill === 'reading' && question.paragraph && (
            <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <p className="text-lg leading-relaxed text-gray-900 dark:text-white">
                {question.paragraph}
              </p>
            </div>
          )}

          {/* Listening Audio */}
          {currentSkill === 'listening' && question.tts && (
            <div className="mb-6">
              <button
                onClick={() => speak(question.tts)}
                className="btn btn-accent flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                <span>Play Audio</span>
              </button>
            </div>
          )}

          {/* Question */}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {question.q}
          </h2>

          {/* Answer Options */}
          <div className="space-y-3 mb-8">
            {question.options.map((option, index) => (
              <motion.label
                key={index}
                className={`block p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedAnswer === index
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
                onClick={() => handleAnswerSelect(index)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedAnswer === index
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {selectedAnswer === index && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                  <span className="text-gray-900 dark:text-white">{option}</span>
                </div>
              </motion.label>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
              className="btn btn-secondary"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              className="btn btn-primary"
            >
              {currentQuestion + 1 === maxQuestions ? 'Finish Quiz' : 'Next Question'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Quiz
