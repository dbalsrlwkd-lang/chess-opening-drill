# 오프닝 연습장 — 인수인계 문서

혼자 쓰는 체스 오프닝 암기 앱입니다. 서버 없이 HTML 한 파일로 동작하고, 폰에는 PWA로 설치합니다.
이 문서는 Claude Code가 이 폴더에서 작업을 이어받을 때 필요한 내용을 담고 있습니다.

- 사용자: 1명(본인). 주로 휴대폰에서 사용. 학급·공유 기능은 필요 없음.
- 사용자와의 대화 언어: 한국어. 앱 문구는 모두 한국어 "해요체".
- 사용자는 체스 초·중급자이고, 개발은 Claude에게 맡기는 방식입니다. 결과는 화면 캡처나 쉬운 말로 설명해야 합니다.

## 1. 지금 상태 한눈에

| 항목 | 내용 |
|---|---|
| 오프닝 | 49개 (1.e4 27, 1.d4 16, 1.c4 2, 1.Nf3 2, 기타 2) |
| 학습 모드 | 배우기, 연습, 복습(간격 반복), 갈림길 연습 |
| 부가 기능 | 오프닝 이후 계획 문제, 실전 기보(PGN) 분석, 기록 내보내기/가져오기, 연속 일수·주간 통계 |
| 겉모습 | 보드 색 3종, 기물 4종(클래식·표정·심플·픽셀), 입체감 켬/끔, 효과음, 다크 모드 |
| 체스 엔진 | Stockfish 19 lite(웹어셈블리, 1.9MB). 평가 막대, 내 수와 배운 수 비교, 오프닝 뒤 이어 두기, 기보 실수 찾기. 자세한 내용은 5-1절 |
| 실행 환경 | 규칙 엔진은 직접 구현해 내장. Stockfish만 npm 패키지(`stockfish`, 개발용 의존성)에서 가져와 `deploy/`에 따로 둠 |
| 배포 | `deploy/` 폴더를 정적 호스팅에 올리면 PWA로 설치 가능. **아직 어디에도 올리지 않음** |

## 2. 폴더 구조

```
CLAUDE.md                이 문서
build.js                 src/ 를 하나의 HTML로 합치는 스크립트
opening-drill.html       빌드 결과(단일 파일 앱). 직접 고치지 말 것
src/
  index.template.html    뼈대(head, 상단 메뉴, 그라데이션 defs). /*__STYLES__*/ 등 자리표시자 포함
  styles.css             전체 스타일 (약 360줄)
  engine.js              체스 규칙 엔진 `Chess` (약 230줄)
  sf.js                  Stockfish 작업자 연결 `SF.go(uci수 배열, {depth|movetime, skill})`
  openings.js            오프닝 데이터 `LINES` 49개 (약 1,860줄, 파일의 절반 이상)
  plan.js                오프닝 이후 계획 문제 `PLAN`
  app.js                 앱 로직 전체 (약 1,150줄, 하나의 즉시실행함수)
deploy/                  배포용: index.html(=opening-drill.html), manifest.webmanifest, sw.js, 아이콘 4개,
                         stockfish-19-lite-single.js/.wasm(build.js가 복사), THIRD-PARTY.txt(GPL 고지)
package.json             개발용 의존성 stockfish 하나. 새 PC에서는 `npm install` 먼저
tools/
  validate.js            모든 수순과 오답/대안 수가 규칙상 둘 수 있는지 검사
  review.js              얕은 기물 계산 탐색으로 해설 주장을 점검(내부 검수용)
  perft.js               규칙 엔진 자체 검증(알려진 국면의 수 개수와 비교)
  claims.js              해설에 적은 전술 수순이 실제로 진행되는지 확인하는 예시 모음
  sfcheck.js             Stockfish로 본수순·오답·대안 분류를 전수 점검 (결과: tools/sfcheck-result.json)
  serve.js               deploy/ 를 http://localhost:8765 로 여는 작은 서버(.claude/launch.json 에 등록됨)
  ui-tests-reference/    Playwright(Python) 화면 테스트. 경로가 예전 작업 환경 기준이라 그대로는 안 돌아감
```

### 명령

```bash
node build.js                                # src → opening-drill.html, deploy/index.html
node tools/validate.js opening-drill.html    # 마지막 줄이 "49 lines, problems: 0" 이어야 함
node tools/perft.js                          # 전부 OK 여야 함
node tools/review.js opening-drill.html 2    # 깊이 2는 약 40초. 깊이 3은 몇 분
node tools/sfcheck.js opening-drill.html 15  # Stockfish 전수 점검. 뒤에 오프닝 id를 적으면 그것만
node tools/serve.js                          # 엔진 기능은 file:// 에서 안 되므로 PC 시험은 이 서버로
```

`src/`를 고친 뒤에는 반드시 `node build.js` → `node tools/validate.js opening-drill.html` 순서로 확인합니다.
배포본을 바꿀 때는 `deploy/sw.js`의 `CACHE` 버전 숫자도 올려야 폰에 새 버전이 반영됩니다(현재 `opening-drill-cache-v16`).
효과음(`snd`)은 Web Audio로 만듭니다. 사용자 요청으로 수를 둘 때는 기물 소리만 내고 정답·오답 알림음은 내지 않습니다(퀴즈와 완주 소리만 남김). move·cap은 `knock`(짧은 잡음 + 금방 사라지는 나무 울림 음 4개, 매번 높이가 조금 다름)으로 실제 기물 소리를 흉내 냄. Lichess 기본 효과음은 자유 라이선스가 아니라서(COPYING.md의 non-free 예외) 쓰지 않음, ok, bad, alt, done. 폰 스피커는 낮은 음이 안 들려서 400Hz 이상과 걸러 낸 잡음을 씁니다. 폰은 터치가 끝날 때만 소리를 허락하므로 첫 터치에 `audio()`로 미리 켭니다.

## 3. 데이터 형식

### 오프닝 한 줄 (`src/openings.js`의 `LINES` 원소)

```js
{
  id: 'italian-w',            // 고유 id. 저장 기록의 키이므로 바꾸면 안 됨
  group: 'white',             // 'trap' 이면 함정 묶음. 그 외 값은 현재 의미 없음
  side: 'w',                  // 내가 두는 색
  role: '막는 쪽',            // (함정만) '막는 쪽' | '거는 쪽'
  variation: true,            // (선택) 다른 오프닝의 변화형이면 표시용
  title: '이탈리안 게임', sub: '1.e4 e5 2.Nf3 Nc6 3.Bc4',
  summary: '한 문단 소개',
  ideas: ['핵심 아이디어 3개'],
  pros: ['장점'], cons: ['단점'],
  after: '오프닝 이후 전개 설명',
  moves: [                    // 백·흑 수가 번갈아. 짝수 인덱스가 백
    { san: 'e4', note: '이 수의 설명', tags: ['중앙', '전개'],
      alt:   { d4: '좋은 수지만 이 라인은 아닌 수의 설명' },   // 감점 없음
      wrong: { Qh5: '나쁜 수의 설명' },                          // 오답 처리
      wrongDefault: '목록에 없는 다른 수를 뒀을 때의 설명',      // (선택)
      hint: '첫 번째 힌트 문구',                                 // (선택)
      why:  { q: '이유 퀴즈', opts: ['정답', '오답', '오답'], a: 0 } },   // (선택) a는 정답 인덱스
    { san: 'e5', note: '상대 수의 설명' },
    ...
  ],
  outro: '끝났을 때 한 줄 정리'
}
```

규칙:
- `san`은 표준 대수 기보. 모호성 해소 표기(`Nbd2`, `Nge7`)와 `+`, `#`까지 엔진이 만드는 표기와 같아야 합니다. 비교할 때는 `+#!?`를 떼고 비교합니다.
- `alt`, `wrong`의 키는 그 자리에서 **실제로 둘 수 있는 수**여야 하고 본수순과 달라야 합니다. `tools/validate.js`가 이를 검사합니다.
- `tags`에 `'함정'`이 있으면 정답 표시가 `!!`로 나옵니다. 쓰는 태그: 중앙, 전개, 위협, 수비, 킹 안전, 함정.
- 내 수에는 `note`가 반드시 있어야 합니다.
- 화면의 "첫 수 묶음"은 `moves[0].san`으로 정해집니다(`e4`, `d4`, `c4`, `Nf3`, 그 외는 '기타'). 묶음 안의 구분은 `side`와 `group === 'trap'`으로 합니다.

### 계획 문제 (`src/plan.js`)

```js
const PLAN = { 'italian-w': { q: '이 자리에서 백의 다음 계획은?', opts: ['정답', '오답', '오답'] }, ... };
```
정답은 항상 첫 번째이고 화면에서 섞습니다. 모든 오프닝 id에 하나씩 있어야 합니다.

### 저장 (localStorage)

| 키 | 내용 |
|---|---|
| `opening-drill-v1` | 진도 `P` |
| `opening-drill-pref` | 설정 `PREF` |

```js
P = {
  learned: { [id]: true },          // 배우기를 끝낸 오프닝
  lv:   { [id]: { [ply]: 0..3 } },  // 수별 숙련도
  miss: { [id]: { [ply]: n } },     // 수별 오답 횟수
  done: { [id]: n },                // 완주 횟수
  due:  { [id]: { [ply]: 날짜번호 } },   // 다음 복습 날짜(로컬 기준 1970년부터의 일수)
  iv:   { [id]: { [ply]: 일수 } },       // 현재 복습 간격
  days: { [날짜번호]: n }           // 그날 푼 문제 수 (최근 120일만 보관)
}
PREF = { infl, snd, board: 'green'|'wood'|'blue', pieces: 'classic'|'emo'|'simple'|'pixel', p3d, auto, me, liUser, ccUser, eng(엔진 평가 스위치), sfLv(엔진 세기 0~3) }
```

간격 반복 규칙(`sched`): 복습 날이 된 수를 한 번에 맞히면 간격이 1 → 3 → 7 → 16 → 35 → 70일로 한 단계 오릅니다. 틀리거나 힌트를 쓰면 간격 0, 오늘 다시. 아직 복습 날이 아닌 수는 맞혀도 간격이 늘지 않습니다.

기록 내보내기 파일 형식: `{ app: 'opening-drill', v: 1, at: ISO시각, P, PREF }`. 가져오기는 `mergeIn`으로 합칩니다(값이 큰 쪽이 남음).

## 4. 코드 구조 (`src/app.js`)

하나의 즉시실행함수 안에 전부 있고, 화면은 `$app.innerHTML`을 통째로 다시 그리는 방식입니다. 프레임워크 없음.

| 영역 | 주요 함수 |
|---|---|
| 묶음·정렬 | `FIRSTS`, `firstKey`, `sectionOf`, `lineLabel` |
| 기물·보드 | `PIECE_SETS`, `pieceSvg`, `initPieceDefs`, `BOARDS`, `applyBoard`, `drawBoard`, `influence`, `inflHtml` |
| 저장 | `save`, `mergeIn`, `initCloud`, `savePref` |
| 숙련도·복습 | `lvOf`, `setLv`, `mastery`, `today`, `sched`, `initSched`, `learnedItems`, `buildQueue`, `bump`, `streak`, `isReady` |
| 화면 | `go`, `render`, `renderHome`, `renderFirst`, `renderIntro`, `renderPlay`, `renderRec`, `renderPgn` |
| 플레이 진행 | `newSession`, `startLine`, `startReview`, `step`, `attempt`, `onCorrect`, `finishLine`, `pickQuiz`, `hint`, `backOne`, `bindBoard` |
| 갈림길 | `forkPool`, `forkOptions`, `forkNarrow`, `forkSync`, `startFork` |
| 기보 분석 | `parsePgn`, `pgnMoves`, `analyzeGame`, `runPgn`, `fetchGames` |

- 화면 종류(`view`): `home`(첫 수 고르기) → `first`(그 첫 수의 오프닝 목록) → `intro`(오프닝 소개) → `play`. 그 밖에 `rec`(성적표·설정), `pgn`(실전 기보).
- 플레이 상태는 전역 `S` 하나에 들어 있습니다. `S.mode`는 `learn | practice | review | fork | spar`(spar는 엔진과 이어 두기, 5-1절).
- **갈림길 연습**: 배운 오프닝 중 같은 색의 것들을 후보(`S.cands`)로 두고, 상대 차례에는 후보들이 두는 수 중 하나를 무작위로 고르고, 내 차례에는 후보 중 어느 오프닝의 수든 정답으로 받습니다. `S.line`은 항상 `S.cands[0]`입니다. 데이터에 별도의 나무 구조는 없고, 여러 줄의 공통 앞부분으로 나무를 그때그때 만듭니다.
- **입체감**: 필터를 쓰지 않습니다. `pieceSvg`가 같은 경로를 네 겹(`g.sh` 그림자, `g.bd` 몸통 그라데이션, `g.rim` 안쪽 밝은·어두운 테두리, `g.ol` 윤곽선)으로 그립니다. 사용자가 "빛 계산은 쓰지 말라"고 명시했습니다.
- `window.claude.use('db')`를 쓰는 `initCloud`는 이 앱이 Claude 아티팩트였던 시절의 잔재입니다. 독립 실행에서는 아무 일도 하지 않습니다. 지워도 됩니다.

## 5. 규칙 엔진 (`src/engine.js`)

외부 다운로드가 막힌 환경에서 만들어서, chess.js 대신 같은 사용법의 최소 구현을 직접 썼습니다.

```js
const g = new Chess();            // new Chess(fen) 도 가능
g.move('Nf3');                    // SAN 문자열 또는 { from:'g1', to:'f3', promotion:'q' }. 실패하면 null
                                  // 반환: { color, from, to, flags, piece, san, captured?, promotion? }
g.undo(); g.turn(); g.get('e4');  // get → { type, color } | null
g.moves();                        // SAN 배열.  g.moves({ verbose: true, square: 'e2' }) 도 가능
g.history();                      // SAN 배열.  g.history({ verbose: true }) 는 수 객체 배열
g.in_check(); g.in_checkmate(); g.perft(depth);
```

- flags: `n` 일반, `b` 폰 두 칸, `e` 앙파상, `c` 잡기, `p` 승급, `k`/`q` 캐슬링.
- 없는 것: FEN 출력, 무승부 판정(3회 반복, 50수, 기물 부족), 스테일메이트 함수. 오프닝 연습에는 필요 없었습니다.
- perft 6개 국면으로 검증했습니다(`tools/perft.js`).
- 실제 chess.js로 바꿔도 됩니다. 다만 위 사용법과 반환 형식을 앱이 그대로 쓰고 있으니 `move`의 반환값과 `history` 형식을 확인해야 합니다.

## 5-1. Stockfish (`src/sf.js`, `app.js`의 "체스 엔진" 구역)

- `deploy/stockfish-19-lite-single.js`를 Web Worker로 띄우고 UCI 글자 명령(`position startpos moves …`, `go depth N`)으로 대화합니다. 규칙 엔진에 FEN 출력이 없어서 항상 "처음 자리 + 지금까지 둔 수" 형태로 보냅니다(`uciOf`).
- 엔진 기능을 처음 쓸 때만 불러옵니다. `file://`로 연 경우(단일 파일 `opening-drill.html`)에는 브라우저가 작업자를 막으므로 안내 문구만 나옵니다(`engErr`).
- 점수는 엔진이 "둘 차례인 쪽" 기준으로 주므로 `evNum`에서 백 기준 센티폰으로 바꿉니다. 메이트는 ±10000 근처 값.
- 앱 안 기능 네 가지
  - **엔진 평가 스위치**(`PREF.eng`, 기본 꺼짐): 보드 위 평가 막대(`evbarHtml`, `engTick`). 내 차례에 추천 수는 보여주지 않습니다(정답 누설 방지).
  - **내 수와 배운 수 비교**(`engCompare`): 스위치가 켜진 상태에서 본수순이 아닌 수를 두면 해설 카드에 두 수의 평가를 나란히 보여줍니다.
  - **엔진과 이어 두기**(`S.mode === 'spar'`, `startSpar`·`sparStep`·`renderSpar`): 완주 화면의 버튼으로 들어갑니다. 세기 4단계(`SPAR_LV`, `PREF.sfLv`), 추천 수, 한 수 무르기. 숙련도·복습 기록에는 영향이 없습니다. 무승부 판정은 스테일메이트뿐(반복·50수 없음).
  - **기보 실수 찾기**(`scanGame`): 기보 분석 결과의 판마다 버튼. 깊이 10으로 최대 120수까지 훑어, 내 수 중 평가가 1.0 이상 떨어진 곳을 보여줍니다.
- 라이선스: Stockfish는 GPL-3.0입니다. 엔진 파일을 고치지 않고 별도 파일로 배포하며 `deploy/THIRD-PARTY.txt`에 고지했습니다. 엔진을 앱 HTML 안에 합치거나 수정하지 말 것.
- 사용자가 승인한 것: 앱이 "HTML 한 파일"에서 "HTML + 엔진 파일 2개"로 바뀌는 것(2026-11-16).

## 6. 검증 상태 — 무엇을 믿을 수 있고 무엇은 아닌가

**확인된 것**
- 49개 수순, 그리고 `alt`·`wrong`에 적은 모든 수가 규칙상 둘 수 있음 (`validate.js`, 문제 0건).
- 폰 크기(390×844)와 PC 크기 화면에서 배우기·연습·복습·갈림길·기보 분석·내보내기/가져오기·오프라인(서비스 워커) 동작을 Playwright로 자동 확인.
- 사용자가 실제 폰에서 이전 버전(오프닝 23개 시점)을 써 보고 "괜찮다"고 했습니다.

**확인되지 않은 것 — 우선 처리 대상**
1. **해설의 체스적 정확성 — 수 분류는 2026-11-16에 Stockfish로 전수 점검함**(`tools/sfcheck.js`, 깊이 14, 의심 항목은 큰 엔진 깊이 20으로 재확인).
   - 고친 것(대안 → 오답으로 옮기고 설명을 다시 씀): `scotch-w` 6수 Nb5·Nxc6, 8수 Nd2·Qd2 / `philidor-b` 4...Be7 / `trap-englund` 7.Nd5 / `trap-friedliver` 4...Qe7
   - 알고도 그대로 둔 것: `danish-w`(끝 자리 −0.9, 7.Nf3보다 7.Qb3가 0.5 좋음. Qb3는 이미 대안으로 있음)와 `kg-w`(끝 자리 −1.5)는 갬빗이라 엔진 평가가 원래 나쁨. `trap-englund` 2수의 d5·e4는 "둘 수 있지만 폰을 받는 게 가장 좋다"는 설명이 사실과 맞음. 오답으로 분류했지만 엔진 평가가 본수순과 0.3 이내인 14개(`catalan-w` Qb3·Qd3, `london-w` Nc3·dxc5 등)는 "이 라인의 수가 아니에요"라는 뜻이고 설명도 단정적이지 않아 유지.
   - **아직 점검하지 못한 것**: 해설 문장 자체의 위치적 주장("전개가 늦어져요" 등), 본수순 설명(`note`)에 적힌 수순, `PLAN`의 정답이 타당한 계획인지. 엔진 점수만으로는 판단이 안 되는 부분입니다.
2. **Lichess·체스닷컴 아이디로 기보 불러오기**(`fetchGames`). 네트워크가 없는 환경에서 작성해 **한 번도 실행해 보지 못했습니다.** API 주소, 응답 형식, CORS를 실제로 확인해야 합니다. PGN 붙여넣기 경로는 테스트했습니다.
3. **최신 버전의 실제 폰 동작.** 드래그 감각, 효과음, 입체 기물 성능, 아이폰 사파리 표시.
4. **파일로 내보내기**가 설치된 PWA(특히 아이폰)에서 되는지. 안 될 때를 대비해 "텍스트로 복사"를 넣어 두었습니다.

**`review.js`가 표시하지만 문제없는 것으로 판단한 항목** (다시 조사할 필요 없음)
- `evans-w` 12, `trap-legal` 8, `trap-elephant` 11: 의도된 폰·퀸 희생
- `qg-w` 2 (Nc3), `qga-b` 5·7 (b5): 갬빗이라 얕은 탐색에서는 폰을 쥔 쪽이 좋아 보임
- `italian-w` 2·8, `italian-b` 3: 위치적 설명이라 기물 손익으로 잡히지 않음
- `trap-shilling` 6, `trap-friedliver` 9, `petrov-b` 5: 탐색 깊이보다 깊은 전술. 수순은 `claims.js`로 따로 확인함

## 7. 배포와 설치

**배포됨(2026-11-16): https://dbalsrlwkd-lang.github.io/chess-opening-drill/** (GitHub Pages)
- 저장소: https://github.com/dbalsrlwkd-lang/chess-opening-drill (공개). `main` 브랜치가 전체 소스, `gh-pages` 브랜치가 `deploy/` 폴더 내용입니다.
- **올리는 방법**: `deploy/sw.js`의 캐시 버전을 올린 뒤 `powershell -ExecutionPolicy Bypass -File tools/publish.ps1 "고친 내용"`. 빌드 → 수순 검사 → 커밋 → `main` 푸시 → `git subtree push --prefix deploy origin gh-pages` 를 한 번에 합니다. 1~2분 뒤 반영됩니다.
- Git과 GitHub CLI는 2026-11-16에 winget으로 설치했고, `gh`는 사용자 계정(dbalsrlwkd-lang)으로 로그인돼 있습니다. 토큰 권한에 `workflow`가 없어서 GitHub Actions 파일(.github/workflows)은 올릴 수 없습니다. 그래서 Actions 대신 gh-pages 브랜치 방식을 씁니다.
- 커밋 작성자는 GitHub noreply 주소로 설정했습니다(저장소 로컬 설정). 사용자의 실제 이메일을 커밋에 넣지 말 것.
- 예전에 Netlify(https://beautiful-kheer-daa2f4.netlify.app)에도 올렸습니다. 지금은 쓰지 않는 예전 버전입니다. 주소가 달라 기록은 서로 이어지지 않습니다.
아래는 처음 배포할 때의 안내입니다.
2026-11-16 점검: `deploy/` 10개 파일(약 2.3MB)이 그대로 올릴 수 있는 상태. 로컬 서버에서 서비스 워커가 엔진 파일까지 저장하고, 서버를 끈 뒤에도 앱과 엔진이 동작함을 확인. 사용자에게는 Netlify Drop(app.netlify.com/drop)을 안내함.

1. `deploy/` 폴더 전체를 HTTPS 정적 호스팅에 올립니다. Netlify Drop(폴더 끌어놓기), GitHub Pages, Cloudflare Pages 어느 것이든 됩니다. 하위 경로에 올려도 동작하도록 모든 경로가 상대 경로입니다.
2. 계정 가입·로그인은 사용자가 직접 해야 합니다.
3. 폰에서 주소를 열고 "홈 화면에 추가"를 누르면 설치됩니다(안드로이드는 크롬, 아이폰은 사파리).
4. 한 번 열면 서비스 워커가 파일을 저장해 이후 오프라인으로 실행됩니다.

주의: 주소(출처)가 바뀌면 localStorage가 새로 시작됩니다. 사용자가 다른 곳에서 쓰던 기록이 있으면 옮기기 전에 내보내기를 안내해야 합니다.

나중 단계로 TWA(플레이스토어)나 Capacitor로 넓히는 것을 고려했지만 지금은 계획에 없습니다.

## 8. 사용자가 정한 것들 (바꾸기 전에 물어볼 것)

- 디자인은 체스 앱들의 일반적인 틀을 따름: 폰에서 보드가 화면 폭을 꽉 채우고, 좌표는 칸 안에, 해설은 보드 바로 밑 카드, 맨 아래 고정 버튼 줄.
- 예전의 "종이 공책" 디자인과 명조체는 버렸습니다. 지금은 시스템 고딕체만 씁니다(웹폰트 없음).
- 기물: 클래식(기본), 표정, 심플, 픽셀. **모던 세트와 꼬마 몬스터 세트는 사용자가 폐기했습니다.** 다시 만들지 말 것.
- 실제 캐릭터(포켓몬 등)를 본뜬 기물은 만들지 않습니다. 사용자는 Lichess 같은 공개 라이선스 기물 세트를 넣는 데 관심이 있습니다. 라이선스를 확인하고 추가하면 됩니다.
- 입체감은 그림으로만 표현(필터·빛 계산 금지). 기본값 켜짐.
- 배우기 모드에서 상대 수가 나오면 이유를 보여주고 멈춤. "상대 수 자동 진행" 스위치로 끌 수 있음.
- 첫 화면은 "백이 처음 움직이는 기물"로 묶음.
- 홈에서 플레이 화면으로 들어가면 폰에서는 상단 메뉴가 페이지 맨 아래로 내려갑니다(없애지 않음).

## 9. 다음에 할 만한 일

우선순위 순입니다.

1. 엔진 기능을 실제 폰에서 확인(속도, 배터리, 아이폰 사파리). PC 크롬에서만 확인했습니다. 그리고 해설 문장·계획 문제의 남은 검수(6절의 1번 마지막 항목).
2. 배포하고 설치까지 안내 (7절).
3. `fetchGames` 실제 동작 확인과 수정.
4. 갈림길 데이터 보강. 지금은 오프닝끼리 앞부분이 겹칠 때만 갈림길이 생깁니다. 한 오프닝 안에서 "상대가 여기서 다른 수를 두면"을 직접 적을 수 있도록 데이터 형식을 넓히는 방법을 생각해 볼 수 있습니다. 예: 수 객체에 `branch: [{ san, note, then: [...] }]`.
5. 빠진 오프닝: 시실리안의 다른 변화(스베시니코프, 타이마노프, 가속 드래곤), 프렌치·카로칸의 다른 백 대응(교환, 타라시), 런던·카탈란을 흑으로 받는 법, 트롬포프스키 등.
6. 코드 정리: `app.js`를 기능별 파일로 나누기, `initCloud` 제거, Playwright 테스트를 이 폴더 기준으로 다시 세우기(`tools/ui-tests-reference/` 참고).
7. (완료) git 저장소로 만들고 GitHub에 올림.

## 10. 화면 테스트 참고

`tools/ui-tests-reference/`의 파이썬 파일은 Playwright로 다음을 확인하던 스크립트입니다. 경로(`/home/claude/work/`)와 크롬 실행 파일 위치가 예전 작업 환경 기준이라 고쳐야 돌아갑니다.

| 파일 | 확인 내용 |
|---|---|
| `ui.py` | 배우기 3개 → 복습(일부러 오답 포함) → 날짜 이동 → 예전 형식 기록 이어받기 → 연습 |
| `ui2.py` | 복습 간격 규칙(미리 복습은 간격 유지, 제때 복습은 1→3일) |
| `ui3.py` | 드래그와 탭 이동을 섞어 4개 오프닝 완주 |
| `ui4.py` | 상대 수 멈춤/계속/자동 진행, 기물·입체감 전환 |
| `ui8.py` | 갈림길 6판, PGN 분석 4판, 내보내기/가져오기, 통계 |
| `pwa.py` | 로컬 서버에서 서비스 워커 등록 후 오프라인 실행 |

테스트 요령: 페이지 안에서 `LINES`와 `Chess`는 전역이라 `page.evaluate`로 정답 수를 계산할 수 있습니다. 앱 로직은 즉시실행함수 안이라 직접 접근할 수 없으므로 화면을 눌러서 조작합니다. 내 차례인지는 `.turn` 요소의 문구 "내 차례"로 판단하면 안정적입니다.
