const state = {
  screen: 'start',
  tab: 'law1',
  time: 0,
  quizIndex: 0,
  selectedChoice: null,
  answered: false,
  score: 0,
  counted: new Set(),
  selectedByQuestion: {},
  values: {
    eccentricity: 0.58,
    sunMass: 12,
    areaDelta: 0.55,
    law3A: 3,
    binaryA: 4,
    binaryP: 2,
    binaryRatio: 3
  }
};

const mascotLines = {
  law1: '태양은 타원의 중심이 아니라 초점에 있어. O와 F를 헷갈리면 안 돼!',
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
      '직교좌표계에서 타원의 중심을 O로 두면 행성의 위치는 \\((x=a\\cos E,\\ y=b\\sin E)\\)로 나타낼 수 있습니다.',
      '실제로는 태양도 완전히 정지하지 않고, 행성과 함께 공통질량중심을 중심으로 조금 움직입니다.'
    ],
    controls: [
      { key: 'eccentricity', label: '이심률 e', min: 0.05, max: 0.82, step: 0.01, unit: '' },
      { key: 'sunMass', label: '태양 질량', min: 2, max: 30, step: 1, unit: '배' }
    ]
  },
  law2: {
    title: '제2법칙: 면적 속도 일정의 법칙',
    formulas: ['\\(S_1=S_2=S_3\\)', '\\(M=E-e\\sin E\\)'],
    body: [
      '태양과 행성을 연결하는 선분이 같은 시간 동안 쓸고 지나가는 면적은 일정합니다.',
      '행성은 근일점에서 빠르고 원일점에서 느립니다.',
      '속도는 달라지지만, 같은 시간 동안 쓸린 면적은 같습니다.'
    ],
    controls: [
      { key: 'eccentricity', label: '이심률 e', min: 0.05, max: 0.82, step: 0.01, unit: '' },
      { key: 'areaDelta', label: '시간 간격 ΔM', min: 0.25, max: 0.95, step: 0.01, unit: ' rad' }
    ]
  },
  law3: {
    title: '제3법칙: 조화의 법칙',
    formulas: ['\\(\\frac{T^2}{a^3}=\\mathrm{const.}\\)'],
    body: [
      '행성의 공전 주기 T의 제곱은 타원 궤도 긴반지름 a의 세제곱에 비례합니다.',
      '즉 태양에서 멀리 있는 행성일수록 공전 주기가 훨씬 길어집니다.'
    ],
    controls: [
      { key: 'law3A', label: '긴반지름 a', min: 1, max: 8, step: 0.1, unit: ' AU' }
    ]
  },
  binary: {
    title: '응용: 쌍성계와 만유인력',
    formulas: ['\\(\\frac{a^3}{P^2}=\\frac{G(m_1+m_2)}{4\\pi^2}\\)', '\\(m_1+m_2=\\frac{a^3}{P^2}M_\\odot\\)', '\\(a_1m_1=a_2m_2\\)'],
    body: [
      '별의 질량은 저울로 잴 수 없습니다. 하지만 두 별 사이의 거리와 공전 주기를 알면 케플러 제3법칙을 이용해 쌍성계의 전체 질량을 구할 수 있습니다.',
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
const infoPanel = document.querySelector('#info-panel');
const canvas = document.querySelector('#space-canvas');
const ctx = canvas.getContext('2d');
const quizPanel = document.querySelector('#quiz-panel');
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
  tabButtons.forEach((button) => button.classList.toggle('active', button.dataset.tab === tab));
  renderTab();
}

function renderTab() {
  const info = tabInfo[state.tab];
  mascotBubble.textContent = mascotLines[state.tab];
  quizPanel.hidden = state.tab !== 'quiz';
  canvas.style.display = state.tab === 'quiz' ? 'none' : 'block';

  infoPanel.innerHTML = `
    <h2>${info.title}</h2>
    ${info.body.map((text) => `<p>${text}</p>`).join('')}
    ${info.formulas.map((formula) => `<div class="formula">${formula}</div>`).join('')}
    ${renderControls(info.controls)}
    <div id="metrics" class="metric-grid"></div>
  `;

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

function renderControls(controls) {
  if (!controls.length) return '';
  return `
    <div class="control-group">
      ${controls.map((control) => `
        <div class="control">
          <label for="${control.key}">
            <span>${control.label}</span>
            <output data-output="${control.key}"></output>
          </label>
          <input id="${control.key}" data-key="${control.key}" type="range" min="${control.min}" max="${control.max}" step="${control.step}" value="${state.values[control.key]}">
        </div>
      `).join('')}
    </div>
  `;
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
      ['태양 질량', `${formatNumber(state.values.sunMass)}배`],
      ['좌표 방식', 'x=a cosE, y=b sinE']
    ];
  } else if (state.tab === 'law2') {
    items = [
      ['시간 간격', `${formatNumber(state.values.areaDelta)} rad`],
      ['면적 관계', 'S1 = S2 = S3'],
      ['근일점 속도', '빠름'],
      ['원일점 속도', '느림']
    ];
  } else if (state.tab === 'law3') {
    const a = state.values.law3A;
    const T = Math.sqrt(a ** 3);
    const ratio = (T * T) / (a ** 3);
    items = [
      ['a', `${formatNumber(a)} AU`],
      ['T', `${formatNumber(T)} yr`],
      ['T²/a³', formatNumber(ratio, 3)],
      ['관계', 'T² ∝ a³']
    ];
  } else if (state.tab === 'binary') {
    const a = state.values.binaryA;
    const p = state.values.binaryP;
    const ratio = state.values.binaryRatio;
    const totalMass = (a ** 3) / (p ** 2);
    items = [
      ['a', `${formatNumber(a)} AU`],
      ['P', `${formatNumber(p)} yr`],
      ['m1 + m2', `${formatNumber(totalMass)} M☉`],
      ['m1:m2', `${formatNumber(ratio)}:1`]
    ];
  } else if (state.tab === 'quiz') {
    items = [
      ['현재 문항', `${state.quizIndex + 1} / ${KEPLER_QUESTIONS.length}`],
      ['점수', `${state.score} / ${KEPLER_QUESTIONS.length}`]
    ];
  }

  metrics.innerHTML = items.map(([label, value]) => `
    <div class="metric">
      <strong>${label}</strong>
      <span>${value}</span>
    </div>
  `).join('');
}

function renderQuiz() {
  const item = KEPLER_QUESTIONS[state.quizIndex];
  state.selectedChoice = state.selectedByQuestion[state.quizIndex] ?? null;
  state.answered = state.counted.has(state.quizIndex);
  const progressText = state.quizIndex === KEPLER_QUESTIONS.length - 1
    ? `마지막 문제입니다. 현재 점수는 ${state.score}점입니다.`
    : `${state.quizIndex + 1}번 문제를 풀고 다음 문제로 넘어가세요.`;

  quizPanel.innerHTML = `
    <div class="quiz-card">
      <h2>${item.title}</h2>
      <p class="quiz-situation">${item.situation}</p>
      <p><strong>${item.question}</strong></p>
      <div class="choices">
        ${item.choices.map((choice, index) => `
          <button class="choice ${choiceClass(index)}" type="button" data-choice="${index}">
            ${index + 1}. ${choice}
          </button>
        `).join('')}
      </div>
      <div class="quiz-actions">
        <button class="secondary-button" type="button" data-action="prev">이전 문제</button>
        <button class="primary-button" type="button" data-action="check">정답 확인</button>
        <button class="secondary-button" type="button" data-action="next">다음 문제</button>
        <button class="secondary-button" type="button" data-action="reset">다시 풀기</button>
      </div>
      ${state.answered ? renderFeedback(item) : `<p class="feedback">${progressText}</p>`}
    </div>
  `;

  quizPanel.querySelectorAll('[data-choice]').forEach((button) => {
    button.addEventListener('click', () => {
      if (state.answered) return;
      state.selectedChoice = Number(button.dataset.choice);
      state.selectedByQuestion[state.quizIndex] = state.selectedChoice;
      renderQuiz();
    });
  });

  quizPanel.querySelector('[data-action="check"]').addEventListener('click', checkAnswer);
  quizPanel.querySelector('[data-action="prev"]').addEventListener('click', () => moveQuiz(-1));
  quizPanel.querySelector('[data-action="next"]').addEventListener('click', () => moveQuiz(1));
  quizPanel.querySelector('[data-action="reset"]').addEventListener('click', resetQuiz);
  renderMetrics();
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
  return `
    <div class="feedback ${isCorrect ? 'good' : 'bad'}">
      <strong>${isCorrect ? '좋아! 핵심 개념을 제대로 잡았어.' : '괜찮아. 다시 그림을 보면서 태양, 초점, 면적, 주기의 관계를 확인해 보자.'}</strong>
      <p>정답: ${item.answer + 1}번</p>
      <p>${item.explanation}</p>
      <p>관련 법칙: ${item.law}</p>
      ${state.counted.size === KEPLER_QUESTIONS.length ? `<p><strong>최종 점수: ${state.score} / ${KEPLER_QUESTIONS.length}</strong></p>` : ''}
    </div>
  `;
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
}

function moveQuiz(direction) {
  state.quizIndex = Math.max(0, Math.min(KEPLER_QUESTIONS.length - 1, state.quizIndex + direction));
  state.selectedChoice = state.selectedByQuestion[state.quizIndex] ?? null;
  state.answered = state.counted.has(state.quizIndex);
  renderQuiz();
}

function resetQuiz() {
  state.quizIndex = 0;
  state.selectedChoice = null;
  state.answered = false;
  state.score = 0;
  state.counted.clear();
  state.selectedByQuestion = {};
  renderQuiz();
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
  drawCaption('같은 ΔM 동안 만들어진 세 영역의 면적이 같아지는 모습을 비교해 보세요.', 24, 34);
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
  const maxY = maxA ** 3;
  const a = state.values.law3A;
  const T = Math.sqrt(a ** 3);
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
    const y = bottom - ((xA ** 3) / maxY) * graphH;
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
  ctx.fillText(`T²/a³ = ${formatNumber((T * T) / (a ** 3), 3)}`, left + 18, bottom - graphH + 50);
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
  drawCaption(`m1 + m2 = a³/P² = ${formatNumber(totalMass)} M☉`, 24, 34);
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

renderTab();
requestAnimationFrame(animate);
