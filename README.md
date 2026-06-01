# 도전! 케플러 법칙 이해하기

고등학생 대상 천체역학 교육용 인터랙티브 웹 시뮬레이션입니다. 타원 궤도, 면적 속도, 조화의 법칙을 직접 조작하며 이해하는 Kepler Learning Simulation입니다.

## 실행 방법

VS Code에서 이 폴더를 열고 Live Server로 `index.html`을 실행하면 됩니다. 별도 빌드 도구, npm, React, Vite는 필요하지 않습니다.

## 파일 구성

- `index.html`: 화면 구조와 MathJax 로딩
- `style.css`: Paperozi 웹폰트, 우주 전시형 UI 스타일
- `script.js`: Canvas 시뮬레이션, 탭 전환, 슬라이더, 문제 풀이 로직
- `questions.js`: 문제 풀이 데이터
- `assets/haenghaeng.png`: 하단 튜터 캐릭터 행행이 이미지

## 구현 내용

- 시작 화면과 학습 화면 전환
- 제1법칙: 직교좌표계 타원 매개방정식 기반 궤도
- 제2법칙: 같은 시간 간격의 면적 시각화
- 제3법칙: `T² = a³` 그래프
- 쌍성계 응용: 공통질량중심과 질량비
- 5문항 문제 풀이와 점수 확인

제1법칙과 제2법칙의 행성 좌표는 `x = OX + A cos E`, `y = OY + B sin E` 방식으로 계산하며, 태양은 초점 `F = (c, 0)`에 표시합니다.
