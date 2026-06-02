const state = {
  screen: 'start',
  tab: 'law1',
  time: 0,
  quizIndex: 0,
  selectedChoice: null,
  answered: false,
  quizComplete: false,
  score: 0,
  counted: new Set(),
  selectedByQuestion: {},
  values: {
    eccentricity: 0.58,
    sunMass: 12,
    areaDelta: 0.55,
    law3A: 3,
    law3K: 1,
    binaryA: 4,
    binaryP: 2,
    binaryRatio: 3
  },
  audio: {
    unlocked: false,
    sfxEnabled: true,
    sfxVolume: 0.45,
    bgmEnabled: false,
    bgmVolume: 0.22,
    context: null,
    bgm: null
  }
};

const BGM_SOURCE = 'assets/bgm-interstellar.mp3';

const mascotLines = {
  law1: '태양은 중심 O가 아니라 초점 F에 있어. 행성 좌표는 타원 위의 (a cosE, b sinE)로 생각하면 돼!',
  law2: '가까울 때 빠르고, 멀 때 느려. 그런데 같은 시간 동안 쓸린 면적은 같아!',
  law3: '거리가 커지면 주기는 훨씬 길어져. T²와 a³의 관계를 봐!',
  binary: '별 두 개가 서로를 도는 것처럼 보여도, 정확히는 공통질량중심을 중심으로 같이 움직여.',
  quiz: '바로 답만 고르지 말고, 어떤 법칙이 쓰였는지 먼저 생각해 봐!'
};

const tabInfo = {
  law1: {
    title: '제1법칙: 타원 궤도의 법칙',
    formulas: ['\\(x=a\\cos E,\\quad y=b\\sin E\\)', '\\(b=a\\sqrt{1-e^2},\\quad c=ae\\)'],
    body: [
      '행성은 타원을 궤도로 공전합니다. 이때 태양은 타원의 중심이 아니라 두 초점 중 한 곳에 위치합니다.',
      '편심 이각 \\(E\\)는 타원 위 행성의 위치를 계산하기 위한 보조각입니다.',
      '실제 방향각과는 다르지만, 시뮬레이션에서 타원 위 위치를 계산하는 데 유용합니다.',
      '질량 슬라이더는 태양이 행성보다 몇 배 무거운지 나타냅니다. 태양 질량이 커질수록 공통질량중심은 태양 가까이에 놓입니다.'
    ],
    controls: [
      { key: 'eccentricity', label: '이심률 e', min: 0.05, max: 0.82, step: 0.01, unit: '' },
      { key: 'sunMass', label: '태양:행성 질량비', min: 2, max: 30, step: 1, unit: ':1' }
    ]
  },
  law2: {
    title: '제2법칙: 면적 속도 일정의 법칙',
    formulas: ['\\(S_1=S_2=S_3\\)'],
    body: [
      '태양과 행성을 잇는 선분이 같은 시간 동안 쓸고 지나가는 면적은 일정하다.',
      '행성은 태양에 가까울 때 더 빠르게 움직이고, 멀리 있을 때 더 느리게 움직인다.',
      '하지만 같은 시간 동안 쓸고 지나가는 면적은 같다.'
    ],
    advanced: {
      title: '왜 면적 속도가 일정할까?',
      body: [
        '태양의 중력은 항상 태양 방향으로 작용하는 중심력이다.',
        '그래서 행성의 각운동량이 보존되고, 그 결과 같은 시간 동안 쓸고 지나가는 면적이 일정하게 유지된다.'
      ],
      formulas: ['\\(\\frac{dS}{dt}=\\frac12r^2\\omega\\)', '\\(L=mr^2\\omega\\)']
    },
    controls: [
      { key: 'eccentricity', label: '이심률 e', min: 0.05, max: 0.82, step: 0.01, unit: '' },
      { key: 'areaDelta', label: '시간 간격 Δt', min: 0.25, max: 0.95, step: 0.01, unit: '' }
    ]
  },
  law3: {
    title: '제3법칙: 조화의 법칙',
    formulas: ['\\(\\frac{T^2}{a^3}=K\\)', '\\(K=1\\ \\mathrm{yr^2/AU^3}\\ \\text{(태양계 단위 기준)}\\)'],
    body: [
      '행성의 공전 주기 T의 제곱은 타원 궤도 긴반지름 a의 세제곱에 비례합니다.',
      '태양 주위를 도는 행성을 AU와 년 단위로 나타내면 상수 K는 약 1입니다. 여기서는 K 값을 바꾸며 중심별 질량이 달라진 상황을 비교할 수 있습니다.'
    ],
    controls: [
      { key: 'law3A', label: '긴반지름 a', min: 1, max: 8, step: 0.1, unit: ' AU' },
      { key: 'law3K', label: '상수 K = T²/a³', min: 0.4, max: 2.5, step: 0.05, unit: ' yr²/AU³' }
    ]
  },
  binary: {
    title: '응용: 쌍성계와 만유인력',
    formulas: ['\\(\\frac{a^3}{P^2}=\\frac{G(m_1+m_2)}{4\\pi^2}\\)', '\\(m_1+m_2=\\frac{a^3}{P^2}M_\\odot\\)', '\\(a_1m_1=a_2m_2\\)'],
    body: [
      '별의 질량은 저울로 잴 수 없습니다. 하지만 두 별 사이의 거리와 공전 주기를 알면 케플러 제3법칙을 이용해 두 별의 질량의 합을 구할 수 있습니다.',
      '공통질량중심에 가까운 별일수록 더 큰 질량을 가집니다. 질량이 큰 별은 더 작은 궤도를 돕니다.'
    ],
    controls: [
      { key: 'binaryA', label: '두 별 사이 거리 a', min: 1, max: 10, step: 0.1, unit: ' AU' },
      { key: 'binaryP', label: '공전 주기 P', min: 0.5, max: 10, step: 0.1, unit: ' yr' },
      { key: 'binaryRatio', label: '거리비 a₂/a₁', min: 0.5, max: 5, step: 0.1, unit: '' }
    ]
  },
  quiz: {
    title: '문제 풀이: 케플러 법칙 적용하기',
    formulas: [],
    body: [
      '자료를 먼저 읽고, 어떤 법칙이 쓰였는지 판단해 봅시다.',
      '정답 확인 후 해설과 관련 법칙을 확인할 수 있습니다.'
    ],
    controls: []
  }
};

const startScreen = document.querySelector('#start-screen');
const learnScreen = document.querySelector('#learn-screen');
const startBtn = document.querySelector('#start-btn');
const homeBtn = document.querySelector('#home-btn');
const audioSettingsBtn = document.querySelector('#audio-settings-btn');
const audioSettingsPanel = document.querySelector('#audio-settings-panel');
const sfxToggle = document.querySelector('#sfx-toggle');
const sfxVolume = document.querySelector('#sfx-volume');
const bgmToggle = document.querySelector('#bgm-toggle');
const bgmVolume = document.querySelector('#bgm-volume');
const infoPanel = document.querySelector('#info-panel');
const canvas = document.querySelector('#space-canvas');
const ctx = canvas.getContext('2d');
const quizPanel = document.querySelector('#quiz-panel');
const mascotRow = document.querySelector('#mascot-row');
const mascot = document.querySelector('.mascot');
const mascotBubble = document.querySelector('#mascot-bubble');
const tabButtons = [...document.querySelectorAll('.tab-button')];

function solveE(M, e) {
  let E = M;
  for (let i = 0; i < 8; i += 1) {
    E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  }
  return E;
}

function normalizeAngle(angle) {
  const twoPi = Math.PI * 2;
  return ((angle % twoPi) + twoPi) % twoPi;
}

function showLearn() {
  unlockAudio();
  updateBgm();
  state.screen = 'learn';
  startScreen.classList.remove('active');
  learnScreen.classList.add('active');
  resizeCanvas();
  renderTab();
}

function showStart() {
  state.screen = 'start';
  learnScreen.classList.remove('active');
  startScreen.classList.add('active');
}

function setTab(tab) {
  state.tab = tab;
  state.selectedChoice = null;
  state.answered = false;
  updateMascotMode(tab);
  tabButtons.forEach((button) => button.classList.toggle('active', button.dataset.tab === tab));
  renderTab();
}

function renderTab() {
  const info = tabInfo[state.tab];
  updateMascotMode(state.tab);
  mascotBubble.textContent = mascotLines[state.tab];
  quizPanel.hidden = state.tab !== 'quiz';
  canvas.style.display = state.tab === 'quiz' ? 'none' : 'block';
  infoPanel.innerHTML = renderInfoPanel(info);

  infoPanel.querySelectorAll('input[type="range"]').forEach((input) => {
    input.addEventListener('input', (event) => {
      const key = event.target.dataset.key;
      state.values[key] = Number(event.target.value);
      updateOutputs();
      renderMetrics();
      if (state.tab === 'quiz') renderQuiz();
    });
  });

  if (state.tab === 'quiz') {
    renderQuiz();
  }
  updateOutputs();
  renderMetrics();
  typesetMath();
}

function renderInfoPanel(info) {
  const paragraphs = info.body.map((text) => `<p>${text}</p>`);
  const formulas = info.formulas.map((formula) => `<div class="formula">${formula}</div>`);

  return [
    `<h2>${info.title}</h2>`,
    ...paragraphs,
    ...formulas,
    renderAdvancedInfo(info.advanced),
    renderControls(info.controls),
    '<div id="metrics" class="metric-grid"></div>'
  ].join('\n');
}

function renderAdvancedInfo(advanced) {
  if (!advanced) return '';

  const paragraphs = advanced.body.map((text) => `<p>${text}</p>`);
  const formulas = advanced.formulas.map((formula) => `<div class="formula compact-formula">${formula}</div>`);

  return [
    '<details class="advanced-info">',
    `  <summary>${advanced.title}</summary>`,
    ...paragraphs,
    ...formulas,
    '</details>'
  ].join('\n');
}

function renderControls(controls) {
  if (!controls.length) return '';

  return [
    '<div class="control-group">',
    controls.map(renderControl).join('\n'),
    '</div>'
  ].join('\n');
}

function renderControl(control) {
  return [
    '<div class="control">',
    `  <label for="${control.key}">`,
    `    <span>${control.label}</span>`,
    `    <output data-output="${control.key}"></output>`,
    '  </label>',
    `  <input id="${control.key}" data-key="${control.key}" type="range" min="${control.min}" max="${control.max}" step="${control.step}" value="${state.values[control.key]}">`,
    '</div>'
  ].join('\n');
}

function updateOutputs() {
  document.querySelectorAll('[data-output]').forEach((output) => {
    const key = output.dataset.output;
    const control = tabInfo[state.tab].controls.find((item) => item.key === key);
    const value = state.values[key];
    output.textContent = `${formatNumber(value)}${control?.unit ?? ''}`;
  });
}

function renderMetrics() {
  const metrics = document.querySelector('#metrics');
  if (!metrics) return;
  let items = [];
  if (state.tab === 'law1') {
    const e = state.values.eccentricity;
    items = [
      ['짧은반지름 비율 b/a', formatNumber(Math.sqrt(1 - e * e))],
      ['초점 거리 비율 c/a', formatNumber(e)],
      ['태양:행성 질량비', `${formatNumber(state.values.sunMass)}:1`],
      ['좌표 방식', '(a cosE, b sinE)']
    ];
  } else if (state.tab === 'law2') {
    items = [
      ['시간 간격', `Δt ${formatNumber(state.values.areaDelta)}`],
      ['면적 관계', 'S1 = S2 = S3'],
      ['태양 가까이', '빠르게 이동'],
      ['태양 멀리', '느리게 이동']
    ];
  } else if (state.tab === 'law3') {
    const a = state.values.law3A;
    const K = state.values.law3K;
    const T = Math.sqrt(K * (a ** 3));
    items = [
      ['a', `${formatNumber(a)} AU`],
      ['T', `${formatNumber(T)} yr`],
      ['K = T²/a³', `${formatNumber(K, 2)} yr²/AU³`],
      ['태양계 기준 K', '1 yr²/AU³']
    ];
  } else if (state.tab === 'binary') {
    const a = state.values.binaryA;
    const p = state.values.binaryP;
    const ratio = state.values.binaryRatio;
    const totalMass = (a ** 3) / (p ** 2);
    items = [
      ['a', `${formatNumber(a)} AU`],
      ['P', `${formatNumber(p)} yr`],
      ['m1 + m2', `태양 질량의 ${formatNumber(totalMass)}배`],
      ['m1:m2', `${formatNumber(ratio)}:1`]
    ];
  } else if (state.tab === 'quiz') {
    if (state.quizComplete) {
      items = [
        ['현재 단계', '최종 점수'],
        ['점수', `${state.score} / ${KEPLER_QUESTIONS.length}`]
      ];
      metrics.innerHTML = items.map(renderMetric).join('\n');
      return;
    }
    items = [
      ['현재 문항', `${state.quizIndex + 1} / ${KEPLER_QUESTIONS.length}`],
      ['점수', `${state.score} / ${KEPLER_QUESTIONS.length}`]
    ];
  }

  metrics.innerHTML = items.map(renderMetric).join('\n');
}

function renderMetric([label, value]) {
  return [
    '<div class="metric">',
    `  <strong>${label}</strong>`,
    `  <span>${value}</span>`,
    '</div>'
  ].join('\n');
}

function renderQuiz() {
  if (state.quizComplete) {
    updateMascotMode('quiz', 'correct');
    quizPanel.innerHTML = renderFinalScore();
    quizPanel.querySelector('[data-action="reset"]').addEventListener('click', resetQuiz);
    renderMetrics();
    return;
  }

  const item = KEPLER_QUESTIONS[state.quizIndex];
  state.selectedChoice = state.selectedByQuestion[state.quizIndex] ?? null;
  state.answered = state.counted.has(state.quizIndex);
  const progressText = state.answered
    ? '해설을 확인했어요. 이제 다음 단계로 넘어갈 수 있습니다.'
    : '답을 고른 뒤 정답 확인을 눌러야 다음 문제로 넘어갈 수 있습니다.';

  quizPanel.innerHTML = renderQuizCard(item, progressText);

  quizPanel.querySelectorAll('[data-choice]').forEach((button) => {
    button.addEventListener('click', () => {
      if (state.answered) return;
      state.selectedChoice = Number(button.dataset.choice);
      state.selectedByQuestion[state.quizIndex] = state.selectedChoice;
      renderQuiz();
    });
  });

  quizPanel.querySelector('[data-action="check"]')?.addEventListener('click', checkAnswer);
  quizPanel.querySelector('[data-action="prev"]')?.addEventListener('click', () => moveQuiz(-1));
  quizPanel.querySelector('[data-action="next"]')?.addEventListener('click', () => moveQuiz(1));
  quizPanel.querySelector('[data-action="reset"]')?.addEventListener('click', resetQuiz);
  renderMetrics();
}

function renderQuizCard(item, progressText) {
  const feedback = state.answered
    ? renderFeedback(item)
    : `<p class="feedback">${progressText}</p>`;
  const isFirst = state.quizIndex === 0;
  const isLast = state.quizIndex === KEPLER_QUESTIONS.length - 1;
  const checkDisabled = state.selectedChoice === null || state.answered ? ' disabled' : '';
  const nextDisabled = state.answered ? '' : ' disabled';
  const prevDisabled = isFirst ? ' disabled' : '';
  const nextLabel = isLast ? '결과 보기' : '다음 문제';

  return [
    '<div class="quiz-card">',
    `  <h2>${item.title}</h2>`,
    `  <p class="quiz-situation">${item.situation}</p>`,
    `  <p><strong>${item.question}</strong></p>`,
    '  <div class="choices">',
    item.choices.map(renderChoice).join('\n'),
    '  </div>',
    '  <div class="quiz-actions">',
    `    <button class="secondary-button" type="button" data-action="prev"${prevDisabled}>이전 문제</button>`,
    `    <button class="primary-button" type="button" data-action="check"${checkDisabled}>정답 확인</button>`,
    `    <button class="secondary-button" type="button" data-action="next"${nextDisabled}>${nextLabel}</button>`,
    '  </div>',
    feedback,
    '</div>'
  ].join('\n');
}

function renderChoice(choice, index) {
  return [
    `    <button class="choice ${choiceClass(index)}" type="button" data-choice="${index}">`,
    `      ${index + 1}. ${choice}`,
    '    </button>'
  ].join('\n');
}

function choiceClass(index) {
  const item = KEPLER_QUESTIONS[state.quizIndex];
  if (!state.answered) return state.selectedChoice === index ? 'selected' : '';
  if (index === item.answer) return 'correct';
  if (index === state.selectedChoice && index !== item.answer) return 'wrong';
  return '';
}

function renderFeedback(item) {
  const isCorrect = state.selectedChoice === item.answer;
  const message = isCorrect
    ? '좋아! 핵심 개념을 제대로 잡았어.'
    : '괜찮아. 다시 그림을 보면서 태양, 초점, 면적, 주기의 관계를 확인해 보자.';
  return [
    `<div class="feedback ${isCorrect ? 'good' : 'bad'}">`,
    `  <strong>${message}</strong>`,
    `  <p>정답: ${item.answer + 1}번</p>`,
    `  <p>${item.explanation}</p>`,
    `  <p>관련 법칙: ${item.law}</p>`,
    '</div>'
  ].join('\n');
}

function renderFinalScore() {
  const total = KEPLER_QUESTIONS.length;
  const percent = Math.round((state.score / total) * 100);
  const message = percent >= 80
    ? '케플러 법칙의 핵심 관계를 잘 연결했어요.'
    : '틀린 문항의 해설을 다시 읽고 시뮬레이션으로 한 번 더 확인해 봅시다.';

  return [
    '<div class="quiz-card final-score-card">',
    '  <p class="eyebrow">Kepler Learning Simulation</p>',
    '  <h2>최종 점수</h2>',
    `  <p class="final-score">${state.score} / ${total}</p>`,
    `  <p class="quiz-situation">${message}</p>`,
    '  <div class="score-list">',
    KEPLER_QUESTIONS.map(renderScoreItem).join('\n'),
    '  </div>',
    '  <div class="quiz-actions">',
    '    <button class="primary-button" type="button" data-action="reset">다시 풀기</button>',
    '  </div>',
    '</div>'
  ].join('\n');
}

function renderScoreItem(item, index) {
  const selected = state.selectedByQuestion[index];
  const isCorrect = selected === item.answer;
  const selectedText = selected === undefined ? '미응답' : `${selected + 1}번`;

  return [
    `<div class="score-item ${isCorrect ? 'correct' : 'wrong'}">`,
    `  <strong>${index + 1}. ${item.title.replace(/^문제 \\d+\\.\\s*/, '')}</strong>`,
    `  <span>${isCorrect ? '정답' : '오답'} · 선택: ${selectedText} · 정답: ${item.answer + 1}번</span>`,
    '</div>'
  ].join('\n');
}

function checkAnswer() {
  if (state.selectedChoice === null) return;
  state.answered = true;
  if (!state.counted.has(state.quizIndex)) {
    state.counted.add(state.quizIndex);
    if (state.selectedChoice === KEPLER_QUESTIONS[state.quizIndex].answer) {
      state.score += 1;
    }
  }
  renderQuiz();
  updateMascotMode('quiz', state.selectedChoice === KEPLER_QUESTIONS[state.quizIndex].answer ? 'correct' : 'wrong');
}

function moveQuiz(direction) {
  if (direction > 0 && !state.answered) return;
  if (direction > 0 && state.quizIndex === KEPLER_QUESTIONS.length - 1) {
    state.quizComplete = true;
    renderQuiz();
    return;
  }

  state.quizIndex = Math.max(0, Math.min(KEPLER_QUESTIONS.length - 1, state.quizIndex + direction));
  state.selectedChoice = state.selectedByQuestion[state.quizIndex] ?? null;
  state.answered = state.counted.has(state.quizIndex);
  renderQuiz();
}

function resetQuiz() {
  state.quizIndex = 0;
  state.selectedChoice = null;
  state.answered = false;
  state.quizComplete = false;
  state.score = 0;
  state.counted.clear();
  state.selectedByQuestion = {};
  renderQuiz();
  updateMascotMode('quiz');
}

function updateMascotMode(mode, feedback = '') {
  if (!mascotRow || !mascot) return;
  mascotRow.dataset.mode = mode;
  mascot.dataset.mode = mode;
  mascot.classList.toggle('feedback-correct', feedback === 'correct');
  mascot.classList.toggle('feedback-wrong', feedback === 'wrong');
}

function unlockAudio() {
  if (state.audio.unlocked) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (AudioContext) {
    state.audio.context = state.audio.context || new AudioContext();
    if (state.audio.context.state === 'suspended') {
      state.audio.context.resume().catch(() => {});
    }
  }
  state.audio.unlocked = true;
}

function playClickSfx() {
  const audio = state.audio;
  if (!audio.unlocked || !audio.sfxEnabled || !audio.context || audio.sfxVolume <= 0) return;

  const now = audio.context.currentTime;
  const osc = audio.context.createOscillator();
  const gain = audio.context.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(620, now);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.07);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.08 * audio.sfxVolume, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
  osc.connect(gain);
  gain.connect(audio.context.destination);
  osc.start(now);
  osc.stop(now + 0.1);
}

function createBgm() {
  const audio = state.audio;
  if (audio.bgm) return;

  const bgm = new Audio(BGM_SOURCE);
  bgm.loop = true;
  bgm.preload = 'auto';
  bgm.hidden = true;
  bgm.volume = 0;
  document.body.appendChild(bgm);
  audio.bgm = bgm;
}

function updateBgm() {
  const audio = state.audio;
  if (!audio.unlocked) return;
  createBgm();
  if (!audio.bgm) return;

  audio.bgm.volume = audio.bgmEnabled ? audio.bgmVolume : 0;
  if (audio.bgmEnabled) {
    audio.bgm.play().catch(() => {});
  } else {
    audio.bgm.pause();
  }
}

function toggleSettingsPanel() {
  const isOpening = audioSettingsPanel.hidden;
  audioSettingsPanel.hidden = !isOpening;
  audioSettingsBtn.setAttribute('aria-expanded', String(isOpening));
}

function syncAudioControls() {
  sfxToggle.checked = state.audio.sfxEnabled;
  sfxVolume.value = state.audio.sfxVolume;
  bgmToggle.checked = state.audio.bgmEnabled;
  bgmVolume.value = state.audio.bgmVolume;
}

function setupAudioControls() {
  syncAudioControls();
  audioSettingsBtn.addEventListener('click', () => {
    unlockAudio();
    toggleSettingsPanel();
  });

  sfxToggle.addEventListener('change', () => {
    unlockAudio();
    state.audio.sfxEnabled = sfxToggle.checked;
  });

  sfxVolume.addEventListener('input', () => {
    unlockAudio();
    state.audio.sfxVolume = Number(sfxVolume.value);
  });

  bgmToggle.addEventListener('change', () => {
    unlockAudio();
    state.audio.bgmEnabled = bgmToggle.checked;
    updateBgm();
  });

  bgmVolume.addEventListener('input', () => {
    unlockAudio();
    state.audio.bgmVolume = Number(bgmVolume.value);
    updateBgm();
  });
}

function setupClickSounds() {
  document.addEventListener('click', (event) => {
    const target = event.target.closest('button, input[type="checkbox"], input[type="range"]');
    if (!target || target.disabled) return;
    unlockAudio();
    playClickSfx();
  });
}

function typesetMath() {
  if (window.MathJax?.typesetPromise) {
    window.MathJax.typesetPromise([infoPanel]).catch(() => {});
  }
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(720, Math.floor(rect.width * dpr));
  canvas.height = Math.max(420, Math.floor(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function getCanvasSize() {
  const rect = canvas.getBoundingClientRect();
  return { w: rect.width, h: rect.height };
}

function clearCanvas() {
  const { w, h } = getCanvasSize();
  ctx.clearRect(0, 0, w, h);
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, '#07182a');
  gradient.addColorStop(1, '#03101e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  drawTinyStars(w, h);
}

function drawTinyStars(w, h) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (let i = 0; i < 70; i += 1) {
    const x = (i * 83) % w;
    const y = (i * 137) % h;
    const size = i % 7 === 0 ? 1.7 : 1;
    ctx.globalAlpha = 0.28 + ((i * 11) % 60) / 100;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function orbitLayout(eccentricity = state.values.eccentricity) {
  const { w, h } = getCanvasSize();
  const A = Math.min(w * 0.34, h * 0.3);
  const e = eccentricity;
  const B = A * Math.sqrt(1 - e * e);
  const C = A * e;
  const OX = w * 0.5;
  const OY = h * 0.53;
  const sunX = OX + C;
  const sunY = OY;
  return { w, h, A, B, C, OX, OY, sunX, sunY, e };
}

function pointOnEllipse(layout, M) {
  const E = solveE(normalizeAngle(M), layout.e);
  return {
    E,
    x: layout.OX + layout.A * Math.cos(E),
    y: layout.OY + layout.B * Math.sin(E)
  };
}

function drawEllipse(layout) {
  ctx.save();
  ctx.strokeStyle = 'rgba(107,230,255,0.82)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= 240; i += 1) {
    const E = (i / 240) * Math.PI * 2;
    const x = layout.OX + layout.A * Math.cos(E);
    const y = layout.OY + layout.B * Math.sin(E);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawPoint(x, y, radius, color, label, labelDx = 10, labelDy = -10) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = color;
  ctx.shadowBlur = 16;
  ctx.fill();
  ctx.shadowBlur = 0;
  if (label) {
    ctx.fillStyle = '#eef9ff';
    ctx.font = '700 14px Paperozi, Arial';
    ctx.fillText(label, x + labelDx, y + labelDy);
  }
  ctx.restore();
}

function drawLine(x1, y1, x2, y2, color = 'rgba(255,255,255,0.45)', width = 1.5) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function drawLaw1() {
  clearCanvas();
  const layout = orbitLayout();
  const M = state.time * 0.85;
  const planet = pointOnEllipse(layout, M);
  const planetMass = 1;
  const sunMass = state.values.sunMass;
  const baryX = (sunMass * layout.sunX + planetMass * planet.x) / (sunMass + planetMass);
  const baryY = (sunMass * layout.sunY + planetMass * planet.y) / (sunMass + planetMass);

  drawEllipse(layout);
  drawLine(layout.OX - layout.A - 34, layout.OY, layout.OX + layout.A + 34, layout.OY, 'rgba(255,255,255,0.18)', 1);
  drawLine(layout.sunX, layout.sunY, planet.x, planet.y, 'rgba(120,242,201,0.58)', 2);

  drawPoint(layout.OX, layout.OY, 5, '#eef9ff', 'O');
  drawPoint(layout.sunX, layout.sunY, 16, '#ffd36a', '태양 F', 16, -24);
  drawPoint(layout.OX - layout.C, layout.OY, 7, '#c6a7ff', "F′");
  drawPoint(layout.OX + layout.A, layout.OY, 5, '#78f2c9', '근일점', 10, 22);
  drawPoint(layout.OX - layout.A, layout.OY, 5, '#78f2c9', '원일점', -58, 22);
  drawPoint(planet.x, planet.y, 10, '#6be6ff', '행성');
  drawPoint(baryX, baryY, 6, '#ff7f9b', '공통질량중심', 12, 34);

  drawCaption('타원의 중심 O와 태양의 위치 F가 다르다는 점을 관찰해 보세요.', 24, 34);
  drawCaption(`질량비 태양:행성 = ${formatNumber(sunMass)}:1, 공통질량중심은 무거운 태양 쪽에 가까워집니다.`, 24, 60);
}

function drawLaw2() {
  clearCanvas();
  const layout = orbitLayout();
  const delta = state.values.areaDelta;
  const starts = [0.12, 2.25, 4.25];
  const colors = ['rgba(120,242,201,0.28)', 'rgba(107,230,255,0.28)', 'rgba(198,167,255,0.28)'];

  drawEllipse(layout);
  starts.forEach((start, index) => drawSweptArea(layout, start, start + delta, colors[index], `S${index + 1}`));

  const planet = pointOnEllipse(layout, state.time * 0.85);
  drawPoint(layout.sunX, layout.sunY, 15, '#ffd36a', '태양 F');
  drawLine(layout.sunX, layout.sunY, planet.x, planet.y, 'rgba(255,211,106,0.62)', 2);
  drawPoint(planet.x, planet.y, 10, '#6be6ff', '행성');
  drawCaption('같은 시간 동안 이동 거리는 달라도 색칠된 세 면적은 같습니다.', 24, 34);
}

function drawSweptArea(layout, startM, endM, color, label) {
  const points = [];
  const steps = 34;
  for (let i = 0; i <= steps; i += 1) {
    points.push(pointOnEllipse(layout, startM + ((endM - startM) * i) / steps));
  }
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color.replace('0.28', '0.9');
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(layout.sunX, layout.sunY);
  points.forEach((point) => ctx.lineTo(point.x, point.y));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const mid = points[Math.floor(points.length / 2)];
  ctx.fillStyle = '#eef9ff';
  ctx.font = '800 16px Paperozi, Arial';
  ctx.fillText(label, (layout.sunX + mid.x) / 2, (layout.sunY + mid.y) / 2);
  ctx.restore();
}

function drawLaw3() {
  clearCanvas();
  const { w, h } = getCanvasSize();
  const pad = Math.min(w, h) * 0.13;
  const left = pad;
  const bottom = h - pad;
  const graphW = w - pad * 1.75;
  const graphH = h - pad * 1.75;
  const maxA = 8;
  const maxK = 2.5;
  const maxY = maxK * (maxA ** 3);
  const a = state.values.law3A;
  const K = state.values.law3K;
  const T = Math.sqrt(K * (a ** 3));
  const yVal = T * T;

  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.34)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(left, bottom);
  ctx.lineTo(left + graphW, bottom);
  ctx.moveTo(left, bottom);
  ctx.lineTo(left, bottom - graphH);
  ctx.stroke();

  ctx.strokeStyle = '#6be6ff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 160; i += 1) {
    const xA = 1 + (i / 160) * (maxA - 1);
    const x = left + (xA / maxA) * graphW;
    const y = bottom - ((K * (xA ** 3)) / maxY) * graphH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  const pointX = left + (a / maxA) * graphW;
  const pointY = bottom - (yVal / maxY) * graphH;
  drawPoint(pointX, pointY, 10, '#78f2c9', `a=${formatNumber(a)}`, 12, -12);

  ctx.fillStyle = '#eef9ff';
  ctx.font = '800 15px Paperozi, Arial';
  ctx.fillText('a', left + graphW + 12, bottom + 4);
  ctx.fillText('T²', left - 8, bottom - graphH - 14);
  ctx.fillStyle = '#a8c6d9';
  ctx.font = '700 14px Paperozi, Arial';
  ctx.fillText(`T = ${formatNumber(T)} yr`, left + 18, bottom - graphH + 26);
  ctx.fillText(`K = T²/a³ = ${formatNumber(K, 2)} yr²/AU³`, left + 18, bottom - graphH + 50);
  ctx.fillText('태양계 단위 기준 K = 1', left + 18, bottom - graphH + 74);
  ctx.restore();
}

function drawBinary() {
  clearCanvas();
  const { w, h } = getCanvasSize();
  const cx = w * 0.5;
  const cy = h * 0.52;
  const totalDistance = Math.min(w, h) * 0.42;
  const ratio = state.values.binaryRatio;
  const m1 = ratio;
  const m2 = 1;
  const r1 = totalDistance * m2 / (m1 + m2);
  const r2 = totalDistance * m1 / (m1 + m2);
  const angle = state.time * 0.8;
  const x1 = cx + r1 * Math.cos(angle);
  const y1 = cy + r1 * Math.sin(angle);
  const x2 = cx - r2 * Math.cos(angle);
  const y2 = cy - r2 * Math.sin(angle);
  const totalMass = (state.values.binaryA ** 3) / (state.values.binaryP ** 2);

  ctx.save();
  ctx.strokeStyle = 'rgba(107,230,255,0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r1, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  drawLine(x1, y1, x2, y2, 'rgba(255,255,255,0.28)', 1.5);
  drawLine(cx, cy, x1, y1, 'rgba(120,242,201,0.5)', 2);
  drawLine(cx, cy, x2, y2, 'rgba(198,167,255,0.5)', 2);
  drawPoint(cx, cy, 7, '#eef9ff', 'O', 10, -12);
  drawPoint(x1, y1, 18 + Math.min(10, m1 * 2), '#ffd36a', 'm₁');
  drawPoint(x2, y2, 16, '#c6a7ff', 'm₂');
  drawCaption(`두 별의 질량의 합 = a³/P² = 태양 질량의 ${formatNumber(totalMass)}배`, 24, 34);
  drawCaption('질량이 큰 별 m₁은 공통질량중심에 더 가까운 작은 궤도를 돕니다.', 24, 60);
}

function drawCaption(text, x, y) {
  ctx.save();
  ctx.fillStyle = 'rgba(5, 18, 32, 0.58)';
  ctx.fillRect(x - 10, y - 22, Math.min(620, text.length * 13), 34);
  ctx.fillStyle = '#eef9ff';
  ctx.font = '700 15px Paperozi, Arial';
  ctx.fillText(text, x, y);
  ctx.restore();
}

function formatNumber(value, digits = 2) {
  return Number(value).toFixed(digits).replace(/\.?0+$/, '');
}

function animate(timestamp) {
  state.time = timestamp / 1000;
  if (state.screen === 'learn') {
    if (state.tab === 'law1') drawLaw1();
    if (state.tab === 'law2') drawLaw2();
    if (state.tab === 'law3') drawLaw3();
    if (state.tab === 'binary') drawBinary();
  }
  requestAnimationFrame(animate);
}

startBtn.addEventListener('click', showLearn);
startBtn.addEventListener('touchend', (event) => {
  event.preventDefault();
  showLearn();
}, { passive: false });
homeBtn.addEventListener('click', showStart);
tabButtons.forEach((button) => {
  button.addEventListener('click', () => setTab(button.dataset.tab));
});
window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', typesetMath);
setupAudioControls();
setupClickSounds();

renderTab();
requestAnimationFrame(animate);
