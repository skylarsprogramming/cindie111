(function () {
  // Adaptive, AI-assisted placement test with 15-minute cap
  const MAX_TIME_MS = 15 * 60 * 1000;
  const MAX_QUESTIONS = 20; // safety cap
  const SKILLS = ['grammar', 'reading', 'listening'];

  // Question banks per difficulty (1-easy .. 5-hard)
  const BANK = {
    grammar: {
      1: [
        { id: 'g1', q: 'Choose the correct form: She ____ to school every day.', options: ['go', 'goes', 'is go'], a: 1 },
        { id: 'g2', q: 'Select the correct article: I bought ____ umbrella.', options: ['a', 'an', 'the'], a: 1 },
      ],
      2: [
        { id: 'g3', q: 'Pick the correct tense: They ____ dinner when I called.', options: ['were having', 'are having', 'have'], a: 0 },
        { id: 'g4', q: 'Which is correct?', options: ["He don't like tea.", "He doesn't like tea.", 'He not like tea.'], a: 1 },
      ],
      3: [
        { id: 'g5', q: 'Choose the modal: You ____ see a doctor.', options: ['should', 'can to', 'must to'], a: 0 },
        { id: 'g6', q: 'Identify the error: He suggested to go.', options: ['Correct', 'Use: going', 'Use: go'], a: 1 },
      ],
      4: [
        { id: 'g7', q: 'Choose the best option: If I ____ more time, I would travel.', options: ['have', 'had', 'would have'], a: 1 },
        { id: 'g8', q: 'Pick the correct sentence.', options: ['Hardly I had arrived when it started to rain.', 'Hardly had I arrived when it started to rain.', 'I had hardly arrived when it starts to rain.'], a: 1 },
      ],
      5: [
        { id: 'g9', q: 'Select the correct form: It\'s high time we ____.', options: ['go', 'went', 'had gone'], a: 1 },
        { id: 'g10', q: 'Find the best option: No sooner ____ the bus than it started raining.', options: ['I got on', 'had I got on', 'I had got on'], a: 1 },
      ],
    },
    reading: {
      1: [
        {
          id: 'r1',
          paragraph: 'Tom works from 9 to 5 at a small shop near his house. He usually has lunch at 12:30.',
          q: 'When does Tom finish work?', options: ['At 9', 'At 5', 'At 12:30'], a: 1
        },
      ],
      2: [
        {
          id: 'r2',
          paragraph: 'The Digital Divide. The term “digital divide” refers to the gap between individuals and communities who have access to information technology and those who do not. This disparity affects education, employment, and social participation. Bridging the divide requires affordable internet access and digital literacy programs.',
          q: 'Which of the following is NOT mentioned as a consequence of the digital divide?', options: ['Limited educational opportunities', 'Reduced employment chances', 'Social exclusion', 'Physical health problems'], a: 3
        },
      ],
      3: [
        {
          id: 'r3',
          paragraph: 'Ancient Architecture. The construction of ancient monuments, such as the Pyramids of Giza, required not only remarkable engineering skills but also a sophisticated understanding of mathematics and astronomy. These structures were aligned with celestial bodies, suggesting that ancient civilizations had complex observational knowledge.',
          q: 'The passage implies that:', options: ['Ancient civilizations had little knowledge of astronomy', 'Monument construction was purely decorative', 'AlwaAdvanced mathematics and astronomy were used in monument constructions', 'Modern engineers cannot replicate ancient monuments'], a: 2
        },
      ],
      4: [
        {
          id: 'r4',
          paragraph: 'Sleep and Memory. Studies have indicated that adequate sleep is crucial for memory consolidation. During certain stages of sleep, the brain processes information learned during the day, strengthening neural connections and facilitating long-term retention. Lack of sleep can significantly impair cognitive performance. ',
          q: 'Which statement best summarizes the passage?', options: ['Memory is not affected by sleep', 'Sleep helps the brain store and strengthen information', 'Only short naps are effective for learning', 'Sleep is only important for physical health'], a: 1
        },
      ],
      5: [
        {
          id: 'r5',
          paragraph: 'Renewable Energy Development. Renewable energy technologies have advanced rapidly in the past decade. Wind and solar power are now more cost-effective than fossil fuels in many regions. However, challenges remain, including the intermittency of supply and the need for large-scale energy storage solutions. ',
          q: 'The passage suggests that:', options: ['Renewable energy is cheaper than fossil fuels everywhere', 'There are still technical challenges to fully replacing fossil fuels', 'Storage of fossil fuels is more problematic than renewable energy', 'Wind power is less efficient than solar energy'], a: 1
        },
      ],
    },
    listening: {
      1: [
        { id: 'l1', tts: 'On Monday morning, a small meeting room will be booked for a team discussion. It will accommodate eight people. A projector will be available, and water bottles will be provided. Attendees should arrive on time. The discussion will cover project updates and planning for next month.',
           q: 'What day is the meeting scheduled?', options: ['Sunday', 'Monday','Tuesday', 'Wednesday'], a: 1 },
      ],
      2: [
        { id: 'l2', tts: 'Next Wednesday, the library will host a workshop on digital marketing. The session starts at 2 p.m. and will last two hours. Participants will learn about social media campaigns and content creation strategies. Handouts will be given at the beginning. Please register online to reserve seats?',
           q: 'How can participants reserve seats?', options: ['By calling the library', 'By registering online', 'By attending without registration', 'By emailing the instructor'], a: 1 },
      ],
      3: [
        { id: 'l3', tts: 'Tomorrow, a bakery will run a one-hour sourdough bread demonstration. Ingredients and tools will be provided.', q: 'What are attendees expected to wear?',
           options: ['Casual clothes', 'Aprons', 'Gloves' , 'Hats'], a: 1 },
      ],
      4: [
        { id: 'l4', tts: 'On Tuesday morning, a local community center will host a yoga session for beginners. Mats and water bottles will be provided.', q: 'Who is the yoga session intended for?',
           options: ['Beginners', 'Children only', 'Seniors', 'Advanced practitioners'], a: 0 },
      ],
      5: [
        { id: 'l5', tts: 'The train to Oxford is delayed by fifteen minutes due to signal problems.', q: 'What happened?', options: ['Arrived early', 'On time', 'Delayed'], a: 2 },
      ],
    }
  };

  let currentIndex = 0;
  let asked = 0;
  const usedIds = new Set();
  const difficultyBySkill = { grammar: 2, reading: 2, listening: 2 };
  const sectionScores = { grammar: 0, reading: 0, listening: 0 };
  const sectionAttempts = { grammar: 0, reading: 0, listening: 0 };

  const card = document.getElementById('quiz-card');
  const bar = document.getElementById('bar');
  const pill = document.getElementById('pill');

  let startTime = Date.now();
  let timerId = null;
  let preferredVoice = null;

  function pickVoice() {
    try {
      const voices = window.speechSynthesis?.getVoices?.() || [];
      const prefer = ['Google UK English Female', 'Google US English', 'Microsoft Aria Online (Natural) - English (United States)', 'en-GB', 'en-US'];
      for (const name of prefer) {
        const v = voices.find(v => v.name === name || v.lang === name);
        if (v) return v;
      }
      return voices[0] || null;
    } catch (_) {
      return null;
    }
  }

  function speak(text) {
    try {
      if (!preferredVoice) preferredVoice = pickVoice();
      const u = new SpeechSynthesisUtterance(text);
      if (preferredVoice) u.voice = preferredVoice;
      u.rate = 1.0; u.pitch = 1.0; u.lang = (preferredVoice && preferredVoice.lang) || 'en-US';
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch (_) {
      try { window.AI && window.AI.ttsSpeak(text); } catch (_) {}
    }
  }

  function nextSkill() {
    const idx = asked % SKILLS.length;
    return SKILLS[idx];
  }

  function getQuestion(skill) {
    const level = difficultyBySkill[skill];
    const bank = BANK[skill][level];
    const available = bank.filter(q => !usedIds.has(q.id));
    if (available.length === 0) {
      // fallback: search other levels near current
      for (let delta = 1; delta <= 4; delta++) {
        const up = Math.min(5, level + delta);
        const down = Math.max(1, level - delta);
        const upBank = BANK[skill][up]?.find(q => !usedIds.has(q.id));
        if (upBank) return { ...upBank, type: skill, level: up };
        const downBank = BANK[skill][down]?.find(q => !usedIds.has(q.id));
        if (downBank) return { ...downBank, type: skill, level: down };
      }
    }
    const q = available[Math.floor(Math.random() * available.length)];
    return { ...q, type: skill, level };
  }

  function renderQuestion() {
    const skill = nextSkill();
    const q = getQuestion(skill);
    usedIds.add(q.id);

    const totalPlanned = Math.min(MAX_QUESTIONS, SKILLS.length * 6); // ~18
    const progress = Math.round((asked / totalPlanned) * 100);
    bar.style.width = progress + '%';
    const timeLeft = Math.max(0, Math.ceil((MAX_TIME_MS - (Date.now() - startTime)) / 1000));
    const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const ss = String(timeLeft % 60).padStart(2, '0');
    pill.textContent = `Question ${asked + 1} • ${skill[0].toUpperCase()}${skill.slice(1)} L${q.level} • ${mm}:${ss}`;

    let bodyHtml = '';
    if (skill === 'reading' && q.paragraph) {
      bodyHtml += `<div class="passage" style="margin-bottom:10px;">${q.paragraph}</div>`;
    }
    if (skill === 'listening' && q.tts) {
      bodyHtml += `<div class="surface" style="margin-bottom:8px"><button class="btn ghost" id="play">Play</button></div>`;
    }

    const optionsHtml = q.options.map((opt, i) => `
      <label>
        <input type="radio" name="opt" value="${i}" style="display:none" />
        ${opt}
      </label>
    `).join('');

    card.innerHTML = `
      <div class="q-meta">${skill.toUpperCase()}</div>
      <div class="q-title ${skill === 'reading' ? 'reading' : ''}">${q.q}</div>
      ${bodyHtml}
      <div class="q-options">${optionsHtml}</div>
      <div class="q-controls">
        <button class="btn ghost" id="prev" ${asked === 0 ? 'disabled' : ''}>Back</button>
        <button class="btn primary" id="next">Next</button>
      </div>
    `;

    if (skill === 'listening' && q.tts) {
      const play = document.getElementById('play');
      play?.addEventListener('click', () => speak(q.tts));
      setTimeout(() => speak(q.tts), 200);
    }

    card.querySelectorAll('label').forEach(label => {
      label.addEventListener('click', () => {
        card.querySelectorAll('label').forEach(l => l.style.borderColor = 'var(--border)');
        label.style.borderColor = 'var(--accent)';
        const input = label.querySelector('input');
        input.checked = true;
      });
    });

    card.querySelector('#prev').addEventListener('click', () => {
      if (asked > 0) {
        // Go back one question logically: reduce counters and difficulty rollback lightly
        asked = Math.max(0, asked - 1);
        currentIndex = Math.max(0, currentIndex - 1);
        renderQuestion();
      }
    });

    card.querySelector('#next').addEventListener('click', () => {
      const selected = card.querySelector('input[name="opt"]:checked');
      if (!selected) {
        alert('Please choose an answer.');
        return;
      }
      const choice = Number(selected.value);
      const correct = choice === q.a;
      sectionAttempts[skill] += 1;
      if (correct) sectionScores[skill] += 1;

      // Adaptive difficulty: adjust by +/- 1
      if (correct) difficultyBySkill[skill] = Math.min(5, difficultyBySkill[skill] + 1);
      else difficultyBySkill[skill] = Math.max(1, difficultyBySkill[skill] - 1);

      asked += 1;

      const elapsed = Date.now() - startTime;
      const reachedTime = elapsed >= MAX_TIME_MS;
      const reachedCount = asked >= MAX_QUESTIONS;

      if (reachedTime || reachedCount) return finish();
      renderQuestion();
    });
  }

  async function finish() {
    clearInterval(timerId);
    try { window.speechSynthesis?.cancel?.(); } catch (_) {}
    const totals = { grammar: sectionAttempts.grammar, reading: sectionAttempts.reading, listening: sectionAttempts.listening };
    const max = totals.grammar + totals.reading + totals.listening;
    const total = sectionScores.grammar + sectionScores.reading + sectionScores.listening;
    const result = {
      sectionScores,
      sectionMax: { grammar: totals.grammar, reading: totals.reading, listening: totals.listening },
      total,
      max,
      startedAt: startTime,
      finishedAt: Date.now(),
      durationMs: Date.now() - startTime,
      difficultyBySkill,
    };
    try {
      localStorage.setItem('lingualift_quiz_result', JSON.stringify(result));
      const strengths = Object.entries(sectionScores)
        .sort((a,b) => (b[1]||0) - (a[1]||0))
        .map(([k]) => k);
      const recs = [
        { title: 'Intro to perfect tenses', id: 'course_perfect', focus: 'grammar' },
        { title: `${(strengths[0]||'Grammar')[0].toUpperCase()}${(strengths[0]||'Grammar').slice(1)} Booster`, id: 'course_focus_1', focus: strengths[0] || 'grammar' },
        { title: `${(strengths[1]||'Reading')[0].toUpperCase()}${(strengths[1]||'Reading').slice(1)} Practice`, id: 'course_focus_2', focus: strengths[1] || 'reading' },
      ];
      localStorage.setItem('cindie_recommendations', JSON.stringify(recs));
      localStorage.setItem('cindie_quiz_completed', '1');
      
      // Generate AI lesson via N8N
      try {
        if (window.n8nIntegration) {
          console.log('Generating AI lesson via N8N...');
          const lesson = await window.n8nIntegration.generateLesson(result);
          console.log('AI lesson generated:', lesson);
        }
      } catch (error) {
        console.error('N8N lesson generation failed:', error);
      }
      
      // Send to backend profile
      fetch('http://localhost:4000/api/placement/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ result, recommendations: recs })
      }).catch(()=>{});
      // Also generate a personalized course on the server
      try {
        const { getIdToken } = await import('../auth.js');
        const token = await getIdToken();
        if (token) {
          await fetch('http://localhost:4000/api/course/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            credentials: 'include',
            body: JSON.stringify({ placementResult: result })
          });
        }
      } catch (_) {}
    } catch (_) {}
    // Render detailed results inline instead of redirecting
    const pct = max > 0 ? Math.round((total / max) * 100) : 0;
    const mins = Math.floor(result.durationMs / 60000);
    const secs = Math.floor((result.durationMs % 60000) / 1000).toString().padStart(2, '0');
    if (bar) bar.style.width = '100%';
    if (pill) pill.textContent = `Results • ${pct}% • ${mins}:${secs}`;
    const sectionRow = (name) => {
      const correct = sectionScores[name] || 0;
      const attempts = totals[name] || 0;
      const p = attempts ? Math.round((correct/attempts)*100) : 0;
      const label = name[0].toUpperCase() + name.slice(1);
      return `<tr><td>${label}</td><td>${correct} / ${attempts}</td><td>${p}%</td><td>L${difficultyBySkill[name]}</td></tr>`;
    };
    card.innerHTML = `
      <div class="q-title">Your Placement Results</div>
      <div class="q-meta" style="margin-bottom:10px;">Overall score: <strong>${total}</strong> / ${max} • ${pct}% • Time: ${mins}:${secs}</div>
      <div class="card2" style="padding:12px;">
        <div class="q-meta" style="margin-bottom:6px;">By skill</div>
        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="text-align:left;">
                <th style="padding:6px 0;">Skill</th>
                <th style="padding:6px 0;">Correct</th>
                <th style="padding:6px 0;">Accuracy</th>
                <th style="padding:6px 0;">Final level</th>
              </tr>
            </thead>
            <tbody>
              ${sectionRow('grammar')}
              ${sectionRow('reading')}
              ${sectionRow('listening')}
            </tbody>
          </table>
        </div>
      </div>
      <div class="q-controls" style="margin-top:12px;">
        <a class="btn primary" href="./dashboard.html">Go to Dashboard</a>
        <button class="btn ghost" id="retake">Retake Quiz</button>
      </div>
    `;
    const retake = document.getElementById('retake');
    retake?.addEventListener('click', () => {
      // Clear AI lesson for fresh generation
      if (window.n8nIntegration) {
        window.n8nIntegration.clearStoredLesson();
      }
      
      // Reset state and restart
      currentIndex = 0; asked = 0; usedIds.clear();
      difficultyBySkill.grammar = 2; difficultyBySkill.reading = 2; difficultyBySkill.listening = 2;
      sectionScores.grammar = 0; sectionScores.reading = 0; sectionScores.listening = 0;
      sectionAttempts.grammar = 0; sectionAttempts.reading = 0; sectionAttempts.listening = 0;
      startTime = Date.now();
      timerId = setInterval(tickTimer, 500);
      renderQuestion();
    });
  }

  function tickTimer() {
    const timeLeft = Math.max(0, MAX_TIME_MS - (Date.now() - startTime));
    if (timeLeft <= 0) return finish();
    // pill updated during renderQuestion with current time; nothing else needed
  }

  // Initialize
  if (typeof window !== 'undefined') {
    window.speechSynthesis?.addEventListener?.('voiceschanged', () => { preferredVoice = pickVoice(); });
  }
  timerId = setInterval(tickTimer, 500);
  renderQuestion();
})();

