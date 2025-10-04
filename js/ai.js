(function () {
  function seededRandom(seed) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  function pickRandom(array, seed) {
    const idx = Math.floor(seededRandom(seed) * array.length);
    return array[idx];
  }

  function analyzeScores(result) {
    const totals = {
      grammar: 0,
      reading: 0,
      listening: 0,
      max: 0
    };
    for (const k of ['grammar', 'reading', 'listening']) {
      totals[k] = result.sectionScores?.[k] ?? 0;
      totals.max += result.sectionMax?.[k] ?? 0;
    }
    const percent = Math.round((result.total / (result.max || totals.max || 1)) * 100);
    let level = 'A1';
    if (percent >= 85) level = 'C1';
    else if (percent >= 70) level = 'B2';
    else if (percent >= 55) level = 'B1';
    else if (percent >= 40) level = 'A2';
    return { percent, level, totals };
  }

  function generateCoursePlan(result) {
    const { level, totals } = analyzeScores(result);
    const focus = Object.entries(totals)
      .filter(([k]) => k !== 'max')
      .sort((a, b) => a[1] - b[1])
      .slice(0, 2)
      .map(([k]) => k);

    const seed = Math.round(result.total * 13 + (result.sectionScores?.grammar || 0) * 7);

    const topics = {
      grammar: [
        'Present Simple vs Continuous',
        'Past Simple and Irregular Verbs',
        'Articles: a/an/the',
        'Countable vs Uncountable Nouns',
        'Modal Verbs for Ability and Advice'
      ],
      reading: [
        'Short News Articles',
        'Emails and Messages',
        'Travel Blogs',
        'Product Reviews',
        'Biographies of Innovators'
      ],
      listening: [
        'Daily Conversations',
        'Customer Service Calls',
        'Podcast Intros',
        'Short Presentations',
        'Weather Reports'
      ]
    };

    const modules = [
      {
        id: 'm1',
        title: `${level} Core Grammar`,
        area: 'grammar',
        topic: pickRandom(topics.grammar, seed + 1),
        activities: [
          { type: 'explain', title: 'Concept Overview' },
          { type: 'drill', title: '10 Quick Checks' },
          { type: 'apply', title: 'Fill-in-the-Blank Practice' },
        ]
      },
      {
        id: 'm2',
        title: `${level} Reading Skills`,
        area: 'reading',
        topic: pickRandom(topics.reading, seed + 2),
        activities: [
          { type: 'read', title: 'Guided Passage' },
          { type: 'quiz', title: 'Comprehension Questions' },
        ]
      },
      {
        id: 'm3',
        title: `${level} Listening Lab`,
        area: 'listening',
        topic: pickRandom(topics.listening, seed + 3),
        activities: [
          { type: 'listen', title: 'Audio Prompt' },
          { type: 'type', title: 'Dictation Practice' },
        ]
      },
      {
        id: 'm4',
        title: 'Speaking & Pronunciation',
        area: 'speaking',
        topic: 'Intonation and Stress',
        activities: [
          { type: 'shadow', title: 'Shadow the Phrase' },
          { type: 'record', title: 'Say It Yourself' },
        ]
      }
    ];

    // Move weak areas first
    modules.sort((a, b) => {
      const pa = focus.includes(a.area) ? -1 : 1;
      const pb = focus.includes(b.area) ? -1 : 1;
      return pa - pb;
    });

    return { level, focus, modules };
  }

  function ttsSpeak(text) {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.98;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch (_) {}
  }

  window.AI = {
    analyzeScores,
    generateCoursePlan,
    ttsSpeak,
  };
})();

