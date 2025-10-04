(function () {
  const PHRASES = [
    'Good morning, how are you today?',
    'Could you please repeat that?',
    'The weather is beautiful this afternoon.',
    'I would like a cup of coffee, please.',
    'What time does the train arrive at the station?',
    'I have been studying English for three years.',
    'Could you show me the way to the museum?',
    'She has already finished her homework.',
    'They are going to travel abroad next month.',
    'Please speak more slowly so I can understand.',
    'I would appreciate your help with this problem.',
    'He hasn\'t decided whether to accept the offer.',
    'Let\'s practice pronunciation every morning.',
    'My favorite subject at school is mathematics.',
    'Reading books helps me learn new vocabulary.',
    'Listening to podcasts improves comprehension.',
    'I\'m trying to reduce my accent and speak clearly.',
    'The presentation begins at nine o\'clock sharp.',
    'Remember to bring your ID to the examination.',
    'I\'d like to make a reservation for two people.',
    'It\'s important to stay focused during practice.',
    'Practicing aloud builds confidence and fluency.',
    'Could you explain the difference between these?',
    'She spoke with clarity and excellent rhythm.',
    'I will review the lesson materials this evening.',
    'This exercise trains stress and intonation.',
    'Please correct my mistakes and give me tips.',
    'I want to improve my spoken English quickly.',
    'He was invited to give a short introduction.',
    'We should check the schedule before leaving.',
    'The library closes early on public holidays.',
    'Pronounce the \"th\" sound with your tongue forward.',
    'Practice minimal pairs like \"ship\" and \"sheep\".',
    'Try to link words for more natural flow.',
    'Open your mouth more to improve vowel clarity.',
    'Use rising intonation for yes–no questions.',
    'Lower your pitch at the end of statements.',
    'Stress content words and reduce function words.',
    'Record yourself and compare with the model.',
    'Shadow the speaker to mimic rhythm and timing.',
    'Focus on consonant endings like \"t\" and \"d\".',
    'Avoid dropping sounds in connected speech.',
    'Keep a steady pace; don\'t rush your sentences.',
    'Articulate each syllable in longer words.',
    'Warm up your voice before difficult passages.',
    'Practice tongue twisters to build agility.',
    'Pay attention to word stress in compounds.',
    'Use a mirror to monitor mouth positions.',
    'Breathe from your diaphragm for better control.',
    'Smile slightly to brighten your vowel sounds.'
  ];

  const phraseSel = document.getElementById('phrase');
  const playBtn = document.getElementById('play');
  const recBtn = document.getElementById('record');
  const live = document.getElementById('live');
  const feedback = document.getElementById('feedback');
  const aiEnabled = document.getElementById('ai-enabled');
  const leonUrl = document.getElementById('leon-url');
  const saveLeon = document.getElementById('save-leon');
  // fixed voice: Microsoft Mark

  PHRASES.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p; opt.textContent = p; phraseSel.appendChild(opt);
  });

  // restore Leon config
  try {
    const stored = localStorage.getItem('LEON_API_URL');
    if (stored && leonUrl) leonUrl.value = stored;
    const enabled = localStorage.getItem('LEON_AI_ENABLED') === '1';
    if (aiEnabled) aiEnabled.checked = enabled;
  } catch (_) {}

  saveLeon?.addEventListener('click', () => {
    try {
      if (leonUrl) localStorage.setItem('LEON_API_URL', leonUrl.value.trim());
      if (aiEnabled) localStorage.setItem('LEON_AI_ENABLED', aiEnabled.checked ? '1' : '0');
      feedback.textContent = 'Saved AI settings. Ready.';
    } catch (_) {}
  });

  function selectMicrosoftMark() {
    try {
      const vs = window.speechSynthesis?.getVoices?.() || [];
      const prefer = [
        'Microsoft Mark - English (United States)',
        'Microsoft Mark Online (Natural) - English (United States)',
        'Microsoft Mark',
        'en-US'
      ];
      for (const name of prefer) {
        const v = vs.find(x => x.name === name || x.lang === name);
        if (v) return v;
      }
      return vs[0] || null;
    } catch (_) { return null; }
  }

  playBtn.addEventListener('click', () => {
    const utter = new SpeechSynthesisUtterance(phraseSel.value);
    const v = selectMicrosoftMark();
    if (v) {
      utter.voice = v;
      utter.lang = v.lang;
    } else {
      utter.lang = 'en-US';
    }
    utter.rate = 1.0;
    utter.pitch = 1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  });

  let recognizing = false;
  let recognition = null;
  function ensureRecognizer() {
    if (recognition) return recognition;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      feedback.textContent = 'Speech Recognition is not supported in this browser.';
      recBtn.disabled = true;
      return null;
    }
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      live.textContent = transcript;
    };
    recognition.onerror = (e) => {
      feedback.textContent = 'Recognition error: ' + e.error;
    };
    recognition.onend = () => {
      recognizing = false;
      recBtn.textContent = 'Start Recording';
      evaluate(live.textContent, phraseSel.value);
    };
    return recognition;
  }

  function evaluate(said, target) {
    const clean = (s) => s.toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim();
    const a = clean(said).split(' ');
    const b = clean(target).split(' ');
    const common = a.filter(x => b.includes(x)).length;
    const score = b.length ? Math.round((common / b.length) * 100) : 0;
    feedback.textContent = `Similarity: ${score}%`;
    if (aiEnabled?.checked) {
      tryLeonFeedback(said, target, score);
    }
    // Track pronunciation session
    try {
      const actRaw = localStorage.getItem('cindie_activity');
      const act = actRaw ? JSON.parse(actRaw) : { totals: { questions: 0, correct: 0, mcqSessions: 0, pronunciationSessions: 0, minutes: 0 }, recent: [] };
      act.totals.pronunciationSessions = (act.totals.pronunciationSessions || 0) + 1;
      act.recent = [{ type: 'pron', score, detail: target, ts: Date.now() }, ...(act.recent || [])].slice(0,20);
      localStorage.setItem('cindie_activity', JSON.stringify(act));
    } catch (_) {}
  }

  async function tryLeonFeedback(userSaid, target, baseScore) {
    const url = (localStorage.getItem('LEON_API_URL') || '').trim() || 'http://localhost:1337/api/voiceover';
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `Evaluate pronunciation. Target: "${target}". User said: "${userSaid}". Give brief tips.` })
      });
      if (!res.ok) throw new Error('LLM not available');
      const data = await res.json().catch(() => ({}));
      const text = data.text || data.message || data.output || '';
      if (text) {
        const div = document.createElement('div');
        div.className = 'muted';
        div.style.marginTop = '6px';
        div.textContent = `AI tips: ${text}`;
        feedback.appendChild(div);
      }
    } catch (_) {
      // Silent fallback
    }
  }

  recBtn.addEventListener('click', () => {
    const r = ensureRecognizer();
    if (!r) return;
    if (recognizing) {
      r.stop();
    } else {
      live.textContent = '';
      feedback.textContent = 'Listening...';
      recognizing = true;
      recBtn.textContent = 'Stop Recording';
      r.start();
    }
  });
})();

