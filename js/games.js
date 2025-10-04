(function () {
  // Word Match
  const MATCH_DATA = [
    { w: 'rapid', m: 'very fast' },
    { w: 'assist', m: 'to help' },
    { w: 'purchase', m: 'to buy' },
    { w: 'depart', m: 'to leave' },
  ];

  function initMatch() {
    const root = document.getElementById('match');
    if (!root) return;
    const words = [...MATCH_DATA].sort(() => Math.random() - 0.5);
    const meanings = [...MATCH_DATA].sort(() => Math.random() - 0.5);
    let selected = null;
    let score = 0;
    root.innerHTML = `
      <div class="tiles" id="words">${words.map(x => `<div class="tile" data-type="w" data-k="${x.w}">${x.w}</div>`).join('')}</div>
      <div class="tiles" id="meanings" style="margin-top:8px">${meanings.map(x => `<div class="tile" data-type="m" data-k="${x.m}">${x.m}</div>`).join('')}</div>
      <div class="muted" id="ms" style="margin-top:8px">Score: 0/${MATCH_DATA.length}</div>
    `;

    root.addEventListener('click', (e) => {
      const t = e.target.closest('.tile');
      if (!t) return;
      if (!selected) {
        selected = t;
        t.style.borderColor = 'var(--accent)';
      } else {
        const a = selected;
        const b = t;
        if (a === b) return;
        const word = a.dataset.type === 'w' ? a.textContent : b.textContent;
        const meaning = a.dataset.type === 'm' ? a.textContent : b.textContent;
        const ok = MATCH_DATA.some(x => x.w === word && x.m === meaning);
        if (ok) {
          a.style.opacity = '0.4';
          b.style.opacity = '0.4';
          a.style.pointerEvents = 'none';
          b.style.pointerEvents = 'none';
          score++;
          root.querySelector('#ms').textContent = `Score: ${score}/${MATCH_DATA.length}`;
        }
        selected.style.borderColor = 'var(--border)';
        selected = null;
      }
    });
  }

  // Sentence Builder
  const BUILDER_DATA = [
    { s: 'I am reading a book', words: ['I', 'am', 'reading', 'a', 'book'] },
    { s: 'She goes to school', words: ['She', 'goes', 'to', 'school'] },
    { s: 'They are playing football', words: ['They', 'are', 'playing', 'football'] }
  ];

  function initBuilder() {
    const root = document.getElementById('builder');
    if (!root) return;
    const item = BUILDER_DATA[Math.floor(Math.random() * BUILDER_DATA.length)];
    const shuffled = [...item.words].sort(() => Math.random() - 0.5);
    root.innerHTML = `
      <div class="sentence" id="pool">${shuffled.map(w => `<span class="word">${w}</span>`).join('')}</div>
      <div class="sentence" id="answer"></div>
      <button class="btn primary" id="check" style="margin-top:8px">Check</button>
      <div id="out" class="muted" style="margin-top:8px"></div>
    `;
    const pool = root.querySelector('#pool');
    const answer = root.querySelector('#answer');
    pool.addEventListener('click', (e) => {
      const w = e.target.closest('.word');
      if (!w) return;
      answer.appendChild(w);
    });
    answer.addEventListener('click', (e) => {
      const w = e.target.closest('.word');
      if (!w) return;
      pool.appendChild(w);
    });
    root.querySelector('#check').addEventListener('click', () => {
      const built = Array.from(answer.querySelectorAll('.word')).map(x => x.textContent).join(' ');
      root.querySelector('#out').textContent = built === item.s ? '✅ Correct!' : `❌ Try again. Answer: ${item.s}`;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { initMatch(); initBuilder(); });
  } else {
    initMatch(); initBuilder();
  }
})();

