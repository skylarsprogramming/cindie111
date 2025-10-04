(function () {
  async function authToken() {
    try {
      const mod = await import('../auth.js');
      return await mod.getIdToken();
    } catch (_) { return null; }
  }
  function getResult() {
    try {
      const raw = localStorage.getItem('lingualift_quiz_result');
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }

  const result = getResult();
  const summary = document.getElementById('summary');
  const modulesEl = document.getElementById('modules');
  const activityEl = document.getElementById('activity');

  if (!result) {
    summary.innerHTML = '<p>Please take the placement quiz first.</p><p><a class="btn primary" href="./quiz.html">Start Quiz</a></p>';
    modulesEl.style.display = 'none';
    return;
  }

  // Check if we have an AI-generated lesson from N8N
  if (window.n8nIntegration) {
    const aiLesson = window.n8nIntegration.loadStoredLesson();
    if (aiLesson) {
      console.log('Displaying AI-generated lesson:', aiLesson);
      return; // N8N integration will handle the display
    }
  }

  async function fetchServerCourse() {
    const token = await authToken();
    if (!token) return null;
    try {
      const res = await fetch('http://localhost:4000/api/course', { headers: { Authorization: `Bearer ${token}` }, credentials: 'include' });
      if (!res.ok) return null;
      return await res.json();
    } catch (_) { return null; }
  }

  async function ensureServerCourse() {
    const token = await authToken();
    if (!token) return null;
    try {
      const res = await fetch('http://localhost:4000/api/course/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, credentials: 'include',
        body: JSON.stringify({ placementResult: result })
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (_) { return null; }
  }

  let serverCourse = await fetchServerCourse();
  if (!serverCourse) {
    serverCourse = await ensureServerCourse();
  }

  const plan = serverCourse?.plan || window.AI.generateCoursePlan(result);

  summary.innerHTML = `
    <div><strong>Level:</strong> ${plan.level}</div>
    <div><strong>Focus areas:</strong> ${plan.focus.join(', ')}</div>
    <div class="muted">Grammar: ${result.sectionScores.grammar}/5 · Reading: ${result.sectionScores.reading}/5 · Listening: ${result.sectionScores.listening}/5</div>
  `;

  modulesEl.innerHTML = '';
  for (const mod of plan.modules) {
    const div = document.createElement('div');
    div.className = 'mod';
    div.innerHTML = `
      <div style="font-weight:800">${mod.title}</div>
      <div class="muted">Topic: ${mod.topic}</div>
      <div>${mod.activities.map(a => `<span class="activity">${a.type}</span>`).join('')}</div>
      <div style="margin-top:10px"><button class="btn ghost" data-mod="${mod.id}">Start</button></div>
    `;
    modulesEl.appendChild(div);
  }

  modulesEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-mod]');
    if (!btn) return;
    const modId = btn.getAttribute('data-mod');
    const mod = plan.modules.find(m => m.id === modId);
    if (!mod) return;

    startActivity(mod);
  });

  function startActivity(mod) {
    activityEl.style.display = 'block';
    if (mod.area === 'grammar') {
      renderFillBlank();
    } else if (mod.area === 'reading') {
      renderReading();
    } else if (mod.area === 'listening') {
      renderDictation();
    } else {
      renderSpeaking();
    }
    // track start time
    activityEl.setAttribute('data-start-ts', String(Date.now()));
    activityEl.setAttribute('data-module-id', mod.id);
  }

  function renderFillBlank() {
    const sentences = [
      { s: 'She __ to the gym on Mondays.', a: 'goes' },
      { s: 'I __ coffee every morning.', a: 'drink' },
      { s: 'They __ dinner now.', a: 'are having' },
    ];
    const item = sentences[Math.floor(Math.random() * sentences.length)];
    activityEl.innerHTML = `
      <h3>Fill in the blank</h3>
      <p class="muted">Type the missing word or words.</p>
      <div class="card2">
        <div style="font-size:18px;margin-bottom:8px">${item.s.replace('__', '<input id="fb" placeholder="..." style="padding:6px 8px;border-radius:6px;border:1px solid var(--border);background:rgba(255,255,255,0.04);color:var(--text)" />')}</div>
        <button class="btn primary" id="check">Check</button>
        <div id="result" style="margin-top:8px"></div>
      </div>
    `;
    activityEl.querySelector('#check').addEventListener('click', async () => {
      const val = String(activityEl.querySelector('#fb').value).trim().toLowerCase();
      const ok = val === item.a;
      activityEl.querySelector('#result').textContent = ok ? '✅ Correct!' : `❌ Try again. Answer: ${item.a}`;
      await postLessonProgress({ quizScore: ok ? 100 : 0, completed: ok });
    });
  }

  function renderReading() {
    const text = 'Maria lives in a small town near the sea. Every morning, she walks to the market to buy fresh bread and fruit. She likes talking to the friendly baker and watching the boats in the harbor.';
    const qs = [
      { q: 'Where does Maria live?', options: ['In a big city', 'Near the sea', 'In the mountains'], a: 1 },
      { q: 'What does she buy?', options: ['Bread and fruit', 'Fish and meat', 'Clothes'], a: 0 },
    ];
    activityEl.innerHTML = `
      <h3>Reading comprehension</h3>
      <div class="card2" style="margin-bottom:8px">${text}</div>
      <div id="rc"></div>
    `;
    const rc = document.getElementById('rc');
    qs.forEach((it, idx) => {
      const d = document.createElement('div');
      d.className = 'card2';
      d.style.marginTop = '8px';
      d.innerHTML = `
        <div style="font-weight:600">${idx + 1}. ${it.q}</div>
        ${it.options.map((o, i) => `<label style="display:block;margin-top:6px"><input type="radio" name="r${idx}" value="${i}" style="margin-right:6px"/>${o}</label>`).join('')}
      `;
      rc.appendChild(d);
    });
    const submit = document.createElement('button');
    submit.className = 'btn primary';
    submit.textContent = 'Submit';
    submit.style.marginTop = '10px';
    rc.appendChild(submit);
    const out = document.createElement('div');
    out.id = 'out';
    out.style.marginTop = '8px';
    rc.appendChild(out);
    submit.addEventListener('click', async () => {
      let score = 0;
      qs.forEach((it, idx) => {
        const sel = rc.querySelector(`input[name="r${idx}"]:checked`);
        if (sel && Number(sel.value) === it.a) score++;
      });
      out.textContent = `You got ${score}/${qs.length}.`;
      const pct = Math.round((score/qs.length)*100);
      await postLessonProgress({ quizScore: pct, completed: true });
    });
  }

  function renderDictation() {
    const sentence = 'The conference starts at nine tomorrow.';
    activityEl.innerHTML = `
      <h3>Dictation</h3>
      <p class="muted">Listen and type what you hear.</p>
      <div class="card2">
        <button class="btn ghost" id="play">Play</button>
        <input id="dict" placeholder="Type here" style="margin-left:8px;padding:6px 8px;border-radius:6px;border:1px solid var(--border);background:rgba(255,255,255,0.04);color:var(--text);width:70%" />
        <button class="btn primary" id="check">Check</button>
        <div id="out" style="margin-top:8px"></div>
      </div>
    `;
    activityEl.querySelector('#play').addEventListener('click', () => {
      window.AI.ttsSpeak(sentence);
    });
    activityEl.querySelector('#check').addEventListener('click', async () => {
      const val = String(activityEl.querySelector('#dict').value).trim().toLowerCase();
      const ok = val === sentence.toLowerCase();
      activityEl.querySelector('#out').textContent = ok ? '✅ Perfect!' : `❌ Not quite. Answer: ${sentence}`;
      await postLessonProgress({ quizScore: ok ? 100 : 60, completed: ok });
    });
  }

  function renderSpeaking() {
    activityEl.innerHTML = `
      <h3>Speaking practice</h3>
      <p class="muted">Open the Pronunciation page to record and get feedback.</p>
      <a class="btn primary" href="./pronunciation.html">Go to Pronunciation</a>
    `;
  }

  async function postLessonProgress({ quizScore, completed }) {
    const token = await authToken();
    if (!token) return;
    const moduleId = activityEl.getAttribute('data-module-id');
    const startTs = Number(activityEl.getAttribute('data-start-ts') || Date.now());
    const lessonId = `${moduleId}-dyn`;
    const timeSpentMs = Math.max(0, Date.now() - startTs);
    try {
      await fetch('http://localhost:4000/api/course/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        credentials: 'include',
        body: JSON.stringify({ moduleId, lessonId, completed: !!completed, quizScore: typeof quizScore==='number'?quizScore:undefined, timeSpentMs })
      });
    } catch (_) {}
  }
})();

