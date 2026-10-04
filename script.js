(() => {
  'use strict';

  // 清音46字（ん を含む）
  const SEION = [...'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'];

  // 変換先（濁音・半濁音・小文字）。変換できない文字は載せない。
  const VARIANTS = {
    'あ': ['ぁ'], 'い': ['ぃ'], 'う': ['ぅ'], 'え': ['ぇ'], 'お': ['ぉ'],
    'か': ['が'], 'き': ['ぎ'], 'く': ['ぐ'], 'け': ['げ'], 'こ': ['ご'],
    'さ': ['ざ'], 'し': ['じ'], 'す': ['ず'], 'せ': ['ぜ'], 'そ': ['ぞ'],
    'た': ['だ'], 'ち': ['ぢ'], 'つ': ['づ', 'っ'], 'て': ['で'], 'と': ['ど'],
    'は': ['ば', 'ぱ'], 'ひ': ['び', 'ぴ'], 'ふ': ['ぶ', 'ぷ'], 'へ': ['べ', 'ぺ'], 'ほ': ['ぼ', 'ぽ'],
    'や': ['ゃ'], 'ゆ': ['ゅ'], 'よ': ['ょ'],
  };

  const $ = (id) => document.getElementById(id);
  const setupEl = $('setup');
  const playEl = $('play');
  const slotsEl = $('slots');
  const turnEl = $('turn');
  const resultEl = $('result');
  const currentEl = $('current');
  const progressEl = $('progress');
  const lengthInfoEl = $('length-info');
  const convertAreaEl = $('convert-area');
  const convertNoteEl = $('convert-note');
  const variantsEl = $('variants');

  const state = {
    settings: { length: 'random', convert: 'once' },
    length: 0,
    name: [],
    placed: 0,
    base: '',      // 今回与えられた文字
    chosen: '',    // 実際に置く文字（変換後）
    convertsLeft: 0,
  };

  const randInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function readSettings() {
    const length = document.querySelector('input[name="length"]:checked').value;
    const convert = document.querySelector('input[name="convert"]:checked').value;
    state.settings = { length, convert };
  }

  function startGame() {
    const { length, convert } = state.settings;
    state.length = length === 'random' ? randInt(5, 8) : Number(length);
    state.name = Array(state.length).fill('');
    state.placed = 0;
    state.convertsLeft = convert === 'once' ? 1 : convert === 'always' ? Infinity : 0;

    lengthInfoEl.textContent = `${state.length}文字の名前を作ろう` + (length === 'random' ? '（ランダム）' : '');
    renderSlots();
    setupEl.hidden = true;
    playEl.hidden = false;
    turnEl.hidden = false;
    resultEl.hidden = true;
    slotsEl.classList.remove('complete');
    nextChar();
  }

  function renderSlots() {
    slotsEl.style.setProperty('--n', state.length);
    slotsEl.innerHTML = '';
    for (let i = 0; i < state.length; i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'slot';
      b.dataset.index = i + 1;
      b.setAttribute('aria-label', `${i + 1}文字目`);
      b.addEventListener('click', () => place(i));
      slotsEl.appendChild(b);
    }
  }

  function nextChar() {
    state.base = pick(SEION);
    state.chosen = state.base;
    progressEl.textContent = `${state.placed + 1} / ${state.length} 文字目`;
    renderCurrent(true);
  }

  function renderCurrent(isNew) {
    currentEl.textContent = state.chosen;
    if (isNew) {
      currentEl.classList.remove('new');
      void currentEl.offsetWidth;
      currentEl.classList.add('new');
    }
    renderVariants();
  }

  function renderVariants() {
    const mode = state.settings.convert;
    const forms = VARIANTS[state.base];
    variantsEl.innerHTML = '';

    if (mode === 'none') {
      convertAreaEl.hidden = true;
      return;
    }
    convertAreaEl.hidden = false;

    if (!forms) {
      convertNoteEl.textContent = 'この文字は変換できません';
      return;
    }
    if (state.convertsLeft <= 0) {
      convertNoteEl.textContent = '変換はもう使いました';
      return;
    }

    convertNoteEl.textContent = mode === 'once'
      ? '変換できます（1回だけ・置いた時点で使用）'
      : '変換できます';

    for (const ch of [state.base, ...forms]) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'variant' + (ch === state.chosen ? ' selected' : '');
      b.textContent = ch;
      b.setAttribute('aria-pressed', String(ch === state.chosen));
      b.addEventListener('click', () => {
        state.chosen = ch;
        renderCurrent(false);
      });
      variantsEl.appendChild(b);
    }
  }

  function place(i) {
    if (state.name[i] || state.placed >= state.length) return;
    if (state.chosen !== state.base) state.convertsLeft -= 1;

    state.name[i] = state.chosen;
    state.placed += 1;
    const slot = slotsEl.children[i];
    slot.textContent = state.chosen;
    slot.classList.add('filled', 'just-placed');
    slot.disabled = true;

    if (state.placed >= state.length) {
      finish();
    } else {
      nextChar();
    }
  }

  function finish() {
    turnEl.hidden = true;
    resultEl.hidden = false;
    slotsEl.classList.add('complete');
    $('again-btn').focus({ preventScroll: true });
  }

  $('start-btn').addEventListener('click', () => {
    readSettings();
    startGame();
  });
  $('again-btn').addEventListener('click', startGame);
  $('settings-btn').addEventListener('click', () => {
    playEl.hidden = true;
    setupEl.hidden = false;
  });
})();
