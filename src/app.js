(function () {
// 첫 수(백이 맨 처음 움직이는 기물)로 오프닝을 묶어요
const FIRSTS = [
  { k: 'e4', t: '1.e4', n: '킹 앞 폰', d: '가장 흔한 첫 수. 열린 자리와 빠른 공격' },
  { k: 'd4', t: '1.d4', n: '퀸 앞 폰', d: '단단한 중앙. 천천히 쌓는 자리' },
  { k: 'c4', t: '1.c4', n: 'c 폰 · 잉글리시', d: '옆에서 중앙을 압박' },
  { k: 'Nf3', t: '1.Nf3', n: '킹 쪽 나이트', d: '기물 먼저, 폰은 나중에' },
  { k: 'etc', t: '그 밖의 첫 수', n: '1.f4 · 1.b3', d: '잘 안 두는 수로 상대를 낯설게' }
];
function firstKey(L) { const m = L.moves[0].san; return ['e4', 'd4', 'c4', 'Nf3'].includes(m) ? m : 'etc'; }
function sectionOf(L) { return L.group === 'trap' ? 2 : L.side === 'w' ? 0 : 1; }
const SECTIONS = [{ n: '백으로 두기', d: '내가 이 수로 시작할 때' }, { n: '흑으로 상대하기', d: '상대가 이 수로 시작할 때' }, { n: '함정', d: '당하지 않기, 걸어보기' }];
LINES.forEach((L, i) => { L._i = i; });
LINES.sort((a, b) => (FIRSTS.findIndex(f => f.k === firstKey(a)) - FIRSTS.findIndex(f => f.k === firstKey(b))) || (sectionOf(a) - sectionOf(b)) || (a._i - b._i));
const $app = document.getElementById('app');
const strip = s => s.replace(/[+#!?]/g, '');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const byId = id => LINES.find(l => l.id === id);
const PIECE_PATHS = {
  p: '<circle cx="22.5" cy="12.5" r="4.6"/><rect x="17" y="18" width="11" height="3.2" rx="1.6"/><path d="M16 37 C16 30.5 19 26.5 20.3 21.2 h4.4 C26 26.5 29 30.5 29 37 z"/><rect x="12" y="36.5" width="21" height="4.5" rx="2"/>',
  r: '<path d="M12.5 15 V8.5 h4.5 v3.2 h3 V8.5 h5 v3.2 h3 V8.5 h4.5 V15 z"/><rect x="12.5" y="14.5" width="20" height="3.6" rx="1"/><path d="M15.5 18 L16.3 32.5 h12.4 L29.5 18 z"/><rect x="13" y="32.3" width="19" height="4" rx="1"/><rect x="11" y="36.3" width="23" height="4.7" rx="2"/>',
  n: '<path d="M14.5 37 C14.5 31 17.5 27.6 20.6 24.8 C18 24.6 15.4 25.6 13 27.2 C10.8 28.6 8.7 27.2 9.3 24.6 C10.3 21 13.6 17.6 16.6 15.3 L16.8 10 L19.8 13 C22 12.2 24.2 12.1 26 12.6 C32.5 14.6 35.8 22.5 34.6 37 z"/><rect x="11" y="36.3" width="23" height="4.7" rx="2"/><circle class="dt" cx="18.6" cy="17.6" r="1.2"/><path class="dl" d="M27.2 15.2 C30.4 20 31.6 27 31 33.5"/>',
  b: '<circle cx="22.5" cy="9.6" r="2.7"/><path d="M17.2 32.5 C14.8 27 15.8 21.6 22.5 13.2 C29.2 21.6 30.2 27 27.8 32.5 z"/><rect x="15" y="32" width="15" height="4.4" rx="1.6"/><rect x="11" y="36.3" width="23" height="4.7" rx="2"/><path class="dl" d="M25.4 19.4 L20.6 25"/>',
  q: '<path d="M12.6 32.6 L9.4 16 L16 26 L17.3 12.6 L21.2 25 L22.5 10.6 L23.8 25 L27.7 12.6 L29 26 L35.6 16 L32.4 32.6 z"/><circle cx="9.2" cy="14" r="2.3"/><circle cx="17.2" cy="10.8" r="2.3"/><circle cx="22.5" cy="8.6" r="2.3"/><circle cx="27.8" cy="10.8" r="2.3"/><circle cx="35.8" cy="14" r="2.3"/><rect x="12.4" y="32.3" width="20.2" height="4.2" rx="1.4"/><rect x="11" y="36.3" width="23" height="4.7" rx="2"/>',
  k: '<path class="cr" d="M22.5 5.5 V15.5 M18.8 9.2 H26.2"/><path d="M12.8 32.6 C10.2 26.4 11 20.6 16 19.4 C19.4 18.6 21.6 20.8 22.5 23 C23.4 20.8 25.6 18.6 29 19.4 C34 20.6 34.8 26.4 32.2 32.6 z"/><path d="M20 15.8 h5 l-2.5 4.6 z"/><rect x="12.4" y="32.3" width="20.2" height="4.2" rx="1.4"/><rect x="11" y="36.3" width="23" height="4.7" rx="2"/>'
};
const PIECE_SETS = [
  { k: 'classic', n: '클래식', p: {
  p: '<circle cx="22.5" cy="11.8" r="5.4"/><path d="M17.6 17.6 h9.8 c.2 1.5 -.7 2.6 -2 3.2 c2.9 3.2 5.6 6.9 6.2 12.6 h-18.2 c.6 -5.7 3.3 -9.4 6.2 -12.6 c-1.3 -.6 -2.2 -1.7 -2 -3.2 z"/><path d="M12.6 33.4 h19.8 c1.6 0 2.6 1.3 2.6 2.9 v3.2 h-25 v-3.2 c0 -1.6 1 -2.9 2.6 -2.9 z"/><path class="dl" d="M12 36.2 h21"/>',
  r: '<path d="M11.5 8.5 h5 v3.4 h3.5 V8.5 h5 v3.4 h3.5 V8.5 h5 v8.8 l-3.2 3 h-15.6 l-3.2 -3 z"/><path d="M15 20.3 h15 l1.6 13.1 h-18.2 z"/><path class="dl" d="M12.6 16.2 h19.8 M14.4 30 h16.2"/><path d="M12.6 33.4 h19.8 c1.6 0 2.6 1.3 2.6 2.9 v3.2 h-25 v-3.2 c0 -1.6 1 -2.9 2.6 -2.9 z"/><path class="dl" d="M12 36.2 h21"/>',
  b: '<circle cx="22.5" cy="6.6" r="2.4"/><path d="M22.5 9.2 c5.4 4.8 8.2 9.2 8.2 13.4 c0 3.5 -2.2 6.1 -5 7.4 h-6.4 c-2.8 -1.3 -5 -3.9 -5 -7.4 c0 -4.2 2.8 -8.6 8.2 -13.4 z"/><path d="M16.2 30 h12.6 l2 3.4 h-16.6 z"/><path class="dl" d="M25 15.6 l-4.2 5.8 M17.4 26.4 c3.2 1.2 7 1.2 10.2 0"/><path d="M12.6 33.4 h19.8 c1.6 0 2.6 1.3 2.6 2.9 v3.2 h-25 v-3.2 c0 -1.6 1 -2.9 2.6 -2.9 z"/><path class="dl" d="M12 36.2 h21"/>',
  q: '<path d="M8.4 15.6 L13 29.6 h19 L36.6 15.6 L31.2 23.4 L29.6 12.2 L26.1 22.6 L22.5 10.4 L18.9 22.6 L15.4 12.2 L13.8 23.4 z"/><circle cx="8.2" cy="13.6" r="2.2"/><circle cx="15.3" cy="10.2" r="2.2"/><circle cx="22.5" cy="8.3" r="2.2"/><circle cx="29.7" cy="10.2" r="2.2"/><circle cx="36.8" cy="13.6" r="2.2"/><path d="M13 29.6 h19 l1.4 3.8 h-21.8 z"/><path class="dl" d="M12.4 26.6 c6.4 -1.8 13.8 -1.8 20.2 0"/><path d="M12.6 33.4 h19.8 c1.6 0 2.6 1.3 2.6 2.9 v3.2 h-25 v-3.2 c0 -1.6 1 -2.9 2.6 -2.9 z"/><path class="dl" d="M12 36.2 h21"/>',
  k: '<path class="cr" d="M22.5 3.6 v8.6 M18.8 6.8 h7.4"/><path d="M22.5 11.8 c2.7 0 4.6 1.9 4.6 4.1 c0 1.6 -1 3.3 -2.2 4.3 h-4.8 c-1.2 -1 -2.2 -2.7 -2.2 -4.3 c0 -2.2 1.9 -4.1 4.6 -4.1 z"/><path d="M22.5 20.6 c4.6 -4.2 11.8 -2.6 11.8 3.2 c0 2.8 -1.5 4.4 -2.9 6 h-17.8 c-1.4 -1.6 -2.9 -3.2 -2.9 -6 c0 -5.8 7.2 -7.4 11.8 -3.2 z"/><path d="M13.6 29.8 h17.8 l1.4 3.6 h-20.6 z"/><path class="dl" d="M22.5 21 v8.4 M14.6 27 c5 -1.4 10.8 -1.4 15.8 0"/><path d="M12.6 33.4 h19.8 c1.6 0 2.6 1.3 2.6 2.9 v3.2 h-25 v-3.2 c0 -1.6 1 -2.9 2.6 -2.9 z"/><path class="dl" d="M12 36.2 h21"/>',
  n: '<path d="M33.6 33.4 c.8 -7.8 -.4 -14 -3.6 -18.4 c-2.2 -3 -5.2 -4.8 -8.6 -5.4 l-1.7 -4.6 l-2.7 3.8 l-2.5 -1.6 l.3 3.8 c-2.8 2.4 -5.6 6.2 -7.6 10.4 c-.9 2 -.5 3.8 .7 4.8 c1.4 1.1 3.2 .9 4.4 -.2 c1.2 -1 2.6 -1.8 4.2 -2.1 l2.4 -.3 c-2.9 3 -5 6 -5.5 9.8 z"/><circle class="dt" cx="15.6" cy="15.6" r="1.25"/><path class="dl" d="M27.2 13.2 c3 4.4 4.2 10.4 4 17.4 M9.4 24.6 l1.3 -1.1 M18.9 23.6 c1.2 -1.6 1.9 -3.3 2 -5.2"/><path d="M12.6 33.4 h19.8 c1.6 0 2.6 1.3 2.6 2.9 v3.2 h-25 v-3.2 c0 -1.6 1 -2.9 2.6 -2.9 z"/><path class="dl" d="M12 36.2 h21"/>'
} },
  { k: 'emo', n: '표정', p: {
  p: '<circle cx="22.5" cy="11.8" r="5.4"/><path d="M17.6 17.6 h9.8 c.2 1.5 -.7 2.6 -2 3.2 c2.9 3.2 5.6 6.9 6.2 12.6 h-18.2 c.6 -5.7 3.3 -9.4 6.2 -12.6 c-1.3 -.6 -2.2 -1.7 -2 -3.2 z"/><path d="M12.6 33.4 h19.8 c1.6 0 2.6 1.3 2.6 2.9 v3.2 h-25 v-3.2 c0 -1.6 1 -2.9 2.6 -2.9 z"/><path class="dl" d="M12 36.2 h21"/><circle class="pp" cx="20.5" cy="11.2" r=".95"/><circle class="pp" cx="24.5" cy="11.2" r=".95"/><path class="sm" d="M20.8 13.2 c1.02 1.3 2.38 1.3 3.4 0"/><circle class="bl" cx="18.6" cy="13" r="1.1"/><circle class="bl" cx="26.4" cy="13" r="1.1"/>',
  r: '<path d="M11.5 8.5 h5 v3.4 h3.5 V8.5 h5 v3.4 h3.5 V8.5 h5 v8.8 l-3.2 3 h-15.6 l-3.2 -3 z"/><path d="M15 20.3 h15 l1.6 13.1 h-18.2 z"/><path class="dl" d="M14.4 30 h16.2"/><path d="M12.6 33.4 h19.8 c1.6 0 2.6 1.3 2.6 2.9 v3.2 h-25 v-3.2 c0 -1.6 1 -2.9 2.6 -2.9 z"/><path class="dl" d="M12 36.2 h21"/><circle class="pp" cx="19.6" cy="24.4" r=".95"/><circle class="pp" cx="25.4" cy="24.4" r=".95"/><path class="sm" d="M20.3 27 c1.32 1.3 3.08 1.3 4.4 0"/>',
  b: '<circle cx="22.5" cy="6.6" r="2.4"/><path d="M22.5 9.2 c5.4 4.8 8.2 9.2 8.2 13.4 c0 3.5 -2.2 6.1 -5 7.4 h-6.4 c-2.8 -1.3 -5 -3.9 -5 -7.4 c0 -4.2 2.8 -8.6 8.2 -13.4 z"/><path d="M16.2 30 h12.6 l2 3.4 h-16.6 z"/><path class="dl" d="M17.4 26.4 c3.2 1.2 7 1.2 10.2 0"/><path d="M12.6 33.4 h19.8 c1.6 0 2.6 1.3 2.6 2.9 v3.2 h-25 v-3.2 c0 -1.6 1 -2.9 2.6 -2.9 z"/><path class="dl" d="M12 36.2 h21"/><circle class="pp" cx="20" cy="19.6" r=".95"/><circle class="pp" cx="25" cy="19.6" r=".95"/><path class="sm" d="M20.6 22.2 c1.14 1.3 2.66 1.3 3.8 0"/>',
  q: '<path d="M8.4 15.6 L13 29.6 h19 L36.6 15.6 L31.2 23.4 L29.6 12.2 L26.1 22.6 L22.5 10.4 L18.9 22.6 L15.4 12.2 L13.8 23.4 z"/><circle cx="8.2" cy="13.6" r="2.2"/><circle cx="15.3" cy="10.2" r="2.2"/><circle cx="22.5" cy="8.3" r="2.2"/><circle cx="29.7" cy="10.2" r="2.2"/><circle cx="36.8" cy="13.6" r="2.2"/><path d="M13 29.6 h19 l1.4 3.8 h-21.8 z"/><path d="M12.6 33.4 h19.8 c1.6 0 2.6 1.3 2.6 2.9 v3.2 h-25 v-3.2 c0 -1.6 1 -2.9 2.6 -2.9 z"/><path class="dl" d="M12 36.2 h21"/><circle class="pp" cx="19.4" cy="25" r=".95"/><circle class="pp" cx="25.6" cy="25" r=".95"/><path class="sm" d="M20.5 27 c1.2 1.3 2.8 1.3 4 0"/>',
  k: '<path class="cr" d="M22.5 3.6 v8.6 M18.8 6.8 h7.4"/><path d="M22.5 11.8 c2.7 0 4.6 1.9 4.6 4.1 c0 1.6 -1 3.3 -2.2 4.3 h-4.8 c-1.2 -1 -2.2 -2.7 -2.2 -4.3 c0 -2.2 1.9 -4.1 4.6 -4.1 z"/><path d="M22.5 20.6 c4.6 -4.2 11.8 -2.6 11.8 3.2 c0 2.8 -1.5 4.4 -2.9 6 h-17.8 c-1.4 -1.6 -2.9 -3.2 -2.9 -6 c0 -5.8 7.2 -7.4 11.8 -3.2 z"/><path d="M13.6 29.8 h17.8 l1.4 3.6 h-20.6 z"/><path class="dl" d="M14.6 27 c5 -1.4 10.8 -1.4 15.8 0"/><path d="M12.6 33.4 h19.8 c1.6 0 2.6 1.3 2.6 2.9 v3.2 h-25 v-3.2 c0 -1.6 1 -2.9 2.6 -2.9 z"/><path class="dl" d="M12 36.2 h21"/><circle class="pp" cx="18.6" cy="23.6" r=".95"/><circle class="pp" cx="26.4" cy="23.6" r=".95"/><path class="sm" d="M20.1 26 c1.44 1.3 3.36 1.3 4.8 0"/>',
  n: '<path d="M33.6 33.4 c.8 -7.8 -.4 -14 -3.6 -18.4 c-2.2 -3 -5.2 -4.8 -8.6 -5.4 l-1.7 -4.6 l-2.7 3.8 l-2.5 -1.6 l.3 3.8 c-2.8 2.4 -5.6 6.2 -7.6 10.4 c-.9 2 -.5 3.8 .7 4.8 c1.4 1.1 3.2 .9 4.4 -.2 c1.2 -1 2.6 -1.8 4.2 -2.1 l2.4 -.3 c-2.9 3 -5 6 -5.5 9.8 z"/><circle class="dt" cx="15.6" cy="15.6" r="1.25"/><path class="dl" d="M27.2 13.2 c3 4.4 4.2 10.4 4 17.4 M9.4 24.6 l1.3 -1.1 M18.9 23.6 c1.2 -1.6 1.9 -3.3 2 -5.2"/><path d="M12.6 33.4 h19.8 c1.6 0 2.6 1.3 2.6 2.9 v3.2 h-25 v-3.2 c0 -1.6 1 -2.9 2.6 -2.9 z"/><path class="dl" d="M12 36.2 h21"/><path class="sm" d="M10.8 27 c1.4 .9 2.9 .7 4.2 -.2"/><circle class="bl" cx="18.6" cy="19.4" r="1.2"/>'
} },
  { k: 'simple', n: '심플', p: PIECE_PATHS },
  { k: 'pixel', n: '픽셀', p: {
  p: '<rect class="px" x="18" y="6" width="9" height="3"/><rect class="px" x="15" y="9" width="3" height="3"/><rect x="18" y="9" width="9" height="3"/><rect class="px" x="27" y="9" width="3" height="3"/><rect class="px" x="12" y="12" width="3" height="3"/><rect x="15" y="12" width="15" height="3"/><rect class="px" x="30" y="12" width="3" height="3"/><rect class="px" x="12" y="15" width="3" height="3"/><rect x="15" y="15" width="12" height="3"/><rect class="sd" x="27" y="15" width="3" height="3"/><rect class="px" x="30" y="15" width="3" height="3"/><rect class="px" x="15" y="18" width="3" height="3"/><rect x="18" y="18" width="3" height="3"/><rect class="sd" x="21" y="18" width="6" height="3"/><rect class="px" x="27" y="18" width="3" height="3"/><rect class="px" x="12" y="21" width="21" height="3"/><rect class="px" x="15" y="24" width="3" height="3"/><rect x="18" y="24" width="6" height="3"/><rect class="sd" x="24" y="24" width="3" height="3"/><rect class="px" x="27" y="24" width="3" height="3"/><rect class="px" x="15" y="27" width="3" height="3"/><rect x="18" y="27" width="6" height="3"/><rect class="sd" x="24" y="27" width="3" height="3"/><rect class="px" x="27" y="27" width="3" height="3"/><rect class="px" x="12" y="30" width="3" height="3"/><rect x="15" y="30" width="12" height="3"/><rect class="sd" x="27" y="30" width="3" height="3"/><rect class="px" x="30" y="30" width="3" height="3"/><rect class="px" x="9" y="33" width="3" height="3"/><rect x="12" y="33" width="18" height="3"/><rect class="sd" x="30" y="33" width="3" height="3"/><rect class="px" x="33" y="33" width="3" height="3"/><rect class="px" x="6" y="36" width="33" height="3"/><rect class="px" x="6" y="39" width="3" height="3"/><rect x="9" y="39" width="21" height="3"/><rect class="sd" x="30" y="39" width="6" height="3"/><rect class="px" x="36" y="39" width="3" height="3"/><rect class="px" x="6" y="42" width="33" height="3"/>',
  r: '<rect class="px" x="6" y="3" width="9" height="3"/><rect class="px" x="18" y="3" width="9" height="3"/><rect class="px" x="30" y="3" width="9" height="3"/><rect class="px" x="6" y="6" width="3" height="3"/><rect x="9" y="6" width="3" height="3"/><rect class="px" x="12" y="6" width="3" height="3"/><rect class="px" x="18" y="6" width="3" height="3"/><rect x="21" y="6" width="3" height="3"/><rect class="px" x="24" y="6" width="3" height="3"/><rect class="px" x="30" y="6" width="3" height="3"/><rect class="sd" x="33" y="6" width="3" height="3"/><rect class="px" x="36" y="6" width="3" height="3"/><rect class="px" x="6" y="9" width="3" height="3"/><rect x="9" y="9" width="3" height="3"/><rect class="px" x="12" y="9" width="9" height="3"/><rect x="21" y="9" width="3" height="3"/><rect class="px" x="24" y="9" width="9" height="3"/><rect class="sd" x="33" y="9" width="3" height="3"/><rect class="px" x="36" y="9" width="3" height="3"/><rect class="px" x="6" y="12" width="3" height="3"/><rect x="9" y="12" width="21" height="3"/><rect class="sd" x="30" y="12" width="6" height="3"/><rect class="px" x="36" y="12" width="3" height="3"/><rect class="px" x="6" y="15" width="33" height="3"/><rect class="px" x="12" y="18" width="3" height="3"/><rect x="15" y="18" width="12" height="3"/><rect class="sd" x="27" y="18" width="3" height="3"/><rect class="px" x="30" y="18" width="3" height="3"/><rect class="px" x="12" y="21" width="3" height="3"/><rect x="15" y="21" width="3" height="3"/><rect class="pe" x="18" y="21" width="3" height="3"/><rect x="21" y="21" width="3" height="3"/><rect class="pe" x="24" y="21" width="3" height="3"/><rect class="sd" x="27" y="21" width="3" height="3"/><rect class="px" x="30" y="21" width="3" height="3"/><rect class="px" x="12" y="24" width="3" height="3"/><rect x="15" y="24" width="12" height="3"/><rect class="sd" x="27" y="24" width="3" height="3"/><rect class="px" x="30" y="24" width="3" height="3"/><rect class="px" x="12" y="27" width="3" height="3"/><rect x="15" y="27" width="12" height="3"/><rect class="sd" x="27" y="27" width="3" height="3"/><rect class="px" x="30" y="27" width="3" height="3"/><rect class="px" x="12" y="30" width="3" height="3"/><rect x="15" y="30" width="12" height="3"/><rect class="sd" x="27" y="30" width="3" height="3"/><rect class="px" x="30" y="30" width="3" height="3"/><rect class="px" x="9" y="33" width="27" height="3"/><rect class="px" x="6" y="36" width="33" height="3"/><rect class="px" x="6" y="39" width="3" height="3"/><rect x="9" y="39" width="21" height="3"/><rect class="sd" x="30" y="39" width="6" height="3"/><rect class="px" x="36" y="39" width="3" height="3"/><rect class="px" x="6" y="42" width="33" height="3"/>',
  b: '<rect class="px" x="21" y="0" width="3" height="3"/><rect class="px" x="18" y="3" width="3" height="3"/><rect class="pg" x="21" y="3" width="3" height="3"/><rect class="px" x="24" y="3" width="3" height="3"/><rect class="px" x="21" y="6" width="3" height="3"/><rect class="px" x="18" y="9" width="3" height="3"/><rect x="21" y="9" width="3" height="3"/><rect class="px" x="24" y="9" width="3" height="3"/><rect class="px" x="15" y="12" width="3" height="3"/><rect x="18" y="12" width="6" height="3"/><rect class="pe" x="24" y="12" width="3" height="3"/><rect class="px" x="27" y="12" width="3" height="3"/><rect class="px" x="12" y="15" width="3" height="3"/><rect x="15" y="15" width="6" height="3"/><rect class="pe" x="21" y="15" width="3" height="3"/><rect x="24" y="15" width="3" height="3"/><rect class="sd" x="27" y="15" width="3" height="3"/><rect class="px" x="30" y="15" width="3" height="3"/><rect class="px" x="12" y="18" width="3" height="3"/><rect x="15" y="18" width="3" height="3"/><rect class="pe" x="18" y="18" width="3" height="3"/><rect x="21" y="18" width="6" height="3"/><rect class="sd" x="27" y="18" width="3" height="3"/><rect class="px" x="30" y="18" width="3" height="3"/><rect class="px" x="12" y="21" width="3" height="3"/><rect x="15" y="21" width="12" height="3"/><rect class="sd" x="27" y="21" width="3" height="3"/><rect class="px" x="30" y="21" width="3" height="3"/><rect class="px" x="15" y="24" width="3" height="3"/><rect x="18" y="24" width="6" height="3"/><rect class="sd" x="24" y="24" width="3" height="3"/><rect class="px" x="27" y="24" width="3" height="3"/><rect class="px" x="12" y="27" width="21" height="3"/><rect class="px" x="15" y="30" width="3" height="3"/><rect x="18" y="30" width="6" height="3"/><rect class="sd" x="24" y="30" width="3" height="3"/><rect class="px" x="27" y="30" width="3" height="3"/><rect class="px" x="12" y="33" width="3" height="3"/><rect x="15" y="33" width="12" height="3"/><rect class="sd" x="27" y="33" width="3" height="3"/><rect class="px" x="30" y="33" width="3" height="3"/><rect class="px" x="6" y="36" width="33" height="3"/><rect class="px" x="6" y="39" width="3" height="3"/><rect x="9" y="39" width="21" height="3"/><rect class="sd" x="30" y="39" width="6" height="3"/><rect class="px" x="36" y="39" width="3" height="3"/><rect class="px" x="6" y="42" width="33" height="3"/>',
  q: '<rect class="pg" x="6" y="3" width="3" height="3"/><rect class="pg" x="15" y="3" width="3" height="3"/><rect class="pg" x="21" y="3" width="3" height="3"/><rect class="pg" x="27" y="3" width="3" height="3"/><rect class="pg" x="36" y="3" width="3" height="3"/><rect class="px" x="6" y="6" width="3" height="3"/><rect class="px" x="15" y="6" width="3" height="3"/><rect class="px" x="21" y="6" width="3" height="3"/><rect class="px" x="27" y="6" width="3" height="3"/><rect class="px" x="36" y="6" width="3" height="3"/><rect class="px" x="6" y="9" width="3" height="3"/><rect x="9" y="9" width="3" height="3"/><rect class="px" x="12" y="9" width="6" height="3"/><rect x="18" y="9" width="3" height="3"/><rect class="px" x="21" y="9" width="3" height="3"/><rect x="24" y="9" width="3" height="3"/><rect class="px" x="27" y="9" width="6" height="3"/><rect x="33" y="9" width="3" height="3"/><rect class="px" x="36" y="9" width="3" height="3"/><rect class="px" x="6" y="12" width="3" height="3"/><rect x="9" y="12" width="27" height="3"/><rect class="px" x="36" y="12" width="3" height="3"/><rect class="px" x="9" y="15" width="3" height="3"/><rect x="12" y="15" width="18" height="3"/><rect class="sd" x="30" y="15" width="3" height="3"/><rect class="px" x="33" y="15" width="3" height="3"/><rect class="px" x="9" y="18" width="27" height="3"/><rect class="px" x="12" y="21" width="3" height="3"/><rect x="15" y="21" width="12" height="3"/><rect class="sd" x="27" y="21" width="3" height="3"/><rect class="px" x="30" y="21" width="3" height="3"/><rect class="px" x="12" y="24" width="3" height="3"/><rect x="15" y="24" width="3" height="3"/><rect class="pg" x="18" y="24" width="3" height="3"/><rect x="21" y="24" width="3" height="3"/><rect class="pg" x="24" y="24" width="3" height="3"/><rect class="sd" x="27" y="24" width="3" height="3"/><rect class="px" x="30" y="24" width="3" height="3"/><rect class="px" x="12" y="27" width="3" height="3"/><rect x="15" y="27" width="12" height="3"/><rect class="sd" x="27" y="27" width="3" height="3"/><rect class="px" x="30" y="27" width="3" height="3"/><rect class="px" x="9" y="30" width="3" height="3"/><rect x="12" y="30" width="18" height="3"/><rect class="sd" x="30" y="30" width="3" height="3"/><rect class="px" x="33" y="30" width="3" height="3"/><rect class="px" x="9" y="33" width="27" height="3"/><rect class="px" x="6" y="36" width="33" height="3"/><rect class="px" x="6" y="39" width="3" height="3"/><rect x="9" y="39" width="21" height="3"/><rect class="sd" x="30" y="39" width="6" height="3"/><rect class="px" x="36" y="39" width="3" height="3"/><rect class="px" x="6" y="42" width="33" height="3"/>',
  k: '<rect class="px" x="21" y="0" width="3" height="3"/><rect class="px" x="18" y="3" width="3" height="3"/><rect class="pg" x="21" y="3" width="3" height="3"/><rect class="px" x="24" y="3" width="3" height="3"/><rect class="px" x="15" y="6" width="3" height="3"/><rect class="pg" x="18" y="6" width="9" height="3"/><rect class="px" x="27" y="6" width="3" height="3"/><rect class="px" x="18" y="9" width="3" height="3"/><rect class="pg" x="21" y="9" width="3" height="3"/><rect class="px" x="24" y="9" width="3" height="3"/><rect class="px" x="12" y="12" width="21" height="3"/><rect class="px" x="9" y="15" width="3" height="3"/><rect x="12" y="15" width="18" height="3"/><rect class="sd" x="30" y="15" width="3" height="3"/><rect class="px" x="33" y="15" width="3" height="3"/><rect class="px" x="9" y="18" width="3" height="3"/><rect x="12" y="18" width="3" height="3"/><rect class="pe" x="15" y="18" width="3" height="3"/><rect x="18" y="18" width="9" height="3"/><rect class="pe" x="27" y="18" width="3" height="3"/><rect class="sd" x="30" y="18" width="3" height="3"/><rect class="px" x="33" y="18" width="3" height="3"/><rect class="px" x="9" y="21" width="3" height="3"/><rect x="12" y="21" width="18" height="3"/><rect class="sd" x="30" y="21" width="3" height="3"/><rect class="px" x="33" y="21" width="3" height="3"/><rect class="px" x="12" y="24" width="3" height="3"/><rect x="15" y="24" width="12" height="3"/><rect class="sd" x="27" y="24" width="3" height="3"/><rect class="px" x="30" y="24" width="3" height="3"/><rect class="px" x="9" y="27" width="27" height="3"/><rect class="px" x="12" y="30" width="3" height="3"/><rect x="15" y="30" width="12" height="3"/><rect class="sd" x="27" y="30" width="3" height="3"/><rect class="px" x="30" y="30" width="3" height="3"/><rect class="px" x="9" y="33" width="3" height="3"/><rect x="12" y="33" width="18" height="3"/><rect class="sd" x="30" y="33" width="3" height="3"/><rect class="px" x="33" y="33" width="3" height="3"/><rect class="px" x="6" y="36" width="33" height="3"/><rect class="px" x="6" y="39" width="3" height="3"/><rect x="9" y="39" width="21" height="3"/><rect class="sd" x="30" y="39" width="6" height="3"/><rect class="px" x="36" y="39" width="3" height="3"/><rect class="px" x="6" y="42" width="33" height="3"/>',
  n: '<rect class="px" x="21" y="3" width="6" height="3"/><rect class="px" x="18" y="6" width="3" height="3"/><rect x="21" y="6" width="6" height="3"/><rect class="px" x="27" y="6" width="6" height="3"/><rect class="px" x="15" y="9" width="3" height="3"/><rect x="18" y="9" width="15" height="3"/><rect class="px" x="33" y="9" width="3" height="3"/><rect class="px" x="12" y="12" width="3" height="3"/><rect x="15" y="12" width="3" height="3"/><rect class="pe" x="18" y="12" width="3" height="3"/><rect x="21" y="12" width="12" height="3"/><rect class="sd" x="33" y="12" width="3" height="3"/><rect class="px" x="36" y="12" width="3" height="3"/><rect class="px" x="9" y="15" width="3" height="3"/><rect x="12" y="15" width="18" height="3"/><rect class="sd" x="30" y="15" width="6" height="3"/><rect class="px" x="36" y="15" width="3" height="3"/><rect class="px" x="6" y="18" width="3" height="3"/><rect x="9" y="18" width="21" height="3"/><rect class="sd" x="30" y="18" width="6" height="3"/><rect class="px" x="36" y="18" width="3" height="3"/><rect class="px" x="3" y="21" width="3" height="3"/><rect x="6" y="21" width="12" height="3"/><rect class="px" x="18" y="21" width="6" height="3"/><rect x="24" y="21" width="6" height="3"/><rect class="sd" x="30" y="21" width="6" height="3"/><rect class="px" x="36" y="21" width="3" height="3"/><rect class="px" x="3" y="24" width="3" height="3"/><rect class="pe" x="6" y="24" width="3" height="3"/><rect x="9" y="24" width="6" height="3"/><rect class="px" x="15" y="24" width="3" height="3"/><rect class="px" x="24" y="24" width="3" height="3"/><rect x="27" y="24" width="3" height="3"/><rect class="sd" x="30" y="24" width="6" height="3"/><rect class="px" x="36" y="24" width="3" height="3"/><rect class="px" x="6" y="27" width="9" height="3"/><rect class="px" x="21" y="27" width="3" height="3"/><rect x="24" y="27" width="6" height="3"/><rect class="sd" x="30" y="27" width="6" height="3"/><rect class="px" x="36" y="27" width="3" height="3"/><rect class="px" x="18" y="30" width="3" height="3"/><rect x="21" y="30" width="9" height="3"/><rect class="sd" x="30" y="30" width="6" height="3"/><rect class="px" x="36" y="30" width="3" height="3"/><rect class="px" x="15" y="33" width="3" height="3"/><rect x="18" y="33" width="12" height="3"/><rect class="sd" x="30" y="33" width="6" height="3"/><rect class="px" x="36" y="33" width="3" height="3"/><rect class="px" x="6" y="36" width="33" height="3"/><rect class="px" x="6" y="39" width="3" height="3"/><rect x="9" y="39" width="21" height="3"/><rect class="sd" x="30" y="39" width="6" height="3"/><rect class="px" x="36" y="39" width="3" height="3"/><rect class="px" x="6" y="42" width="33" height="3"/>'
} }
];
// 입체 기물은 필터 없이 그림으로만 표현해요: 바닥 그림자 → 몸통(그라데이션) → 안쪽 밝은 테두리·어두운 테두리 → 윤곽선
function pieceSvg(color, type, set, flat) {
  const ps = PIECE_SETS.find(x => x.k === (set || PREF.pieces)) || PIECE_SETS[0], d = ps.p[type];
  if (flat || !PREF.p3d) return '<svg class="pc set-' + ps.k + ' ' + color + '" viewBox="0 0 45 45" aria-hidden="true"><g>' + d + '</g></svg>';
  return '<svg class="pc d3 set-' + ps.k + ' ' + color + '" viewBox="0 0 45 45" aria-hidden="true"><g class="sh" transform="translate(1.1 1.9)">' + d + '</g><g class="bd">' + d + '</g>' +
    '<g class="rim" clip-path="url(#cp-' + ps.k + '-' + type + ')"><g class="hl" transform="translate(1.15 1.15)">' + d + '</g><g class="lo" transform="translate(-1.2 -1.2)">' + d + '</g></g><g class="ol">' + d + '</g></svg>';
}
function initPieceDefs() {
  const defs = document.getElementById('pdefs'); if (!defs) return;
  let h = '';
  for (const ps of PIECE_SETS) for (const t in ps.p) h += '<clipPath id="cp-' + ps.k + '-' + t + '">' + ps.p[t] + '</clipPath>';
  defs.insertAdjacentHTML('beforeend', h);
}
// 수 이름 뒤 조사: 마지막 글자를 읽었을 때 받침이 있으면 '을', 없으면 '를' (e4를, Nf3을, O-O를)
function eul(san) { const c = strip(san).slice(-1); return san + ('1Ll3Mm6Nn78'.includes(c) ? '을' : '를'); }
const delay = ms => new Promise(r => setTimeout(r, ms));

if (typeof Chess === 'undefined') {
  $app.innerHTML = '<p>체스 규칙 엔진을 불러오지 못했어요. 파일이 손상됐을 수 있어요.</p>';
  return;
}

/* ---------- progress store ---------- */
const LS_KEY = 'opening-drill-v1';
const blankP = () => ({ lv: {}, miss: {}, learned: {}, done: {}, due: {}, iv: {}, days: {} });
let P = blankP();
try { const raw = localStorage.getItem(LS_KEY); if (raw) P = Object.assign(P, JSON.parse(raw)); } catch (e) {}
let cloudRef = null, saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(P)); } catch (e) {}
    if (cloudRef) cloudRef.set(JSON.parse(JSON.stringify(P))).catch(() => {});
  }, 600);
}
function mergeIn(o) {
  if (!o) return;
  for (const k of ['lv', 'miss', 'done', 'due', 'iv', 'days']) {
    P[k] = P[k] || {};
    const src = o[k] || {};
    for (const id in src) {
      if (typeof src[id] === 'object') {
        P[k][id] = P[k][id] || {};
        for (const p in src[id]) P[k][id][p] = Math.max(P[k][id][p] || 0, src[id][p] || 0);
      } else P[k][id] = Math.max(P[k][id] || 0, src[id] || 0);
    }
  }
  for (const id in (o.learned || {})) if (o.learned[id]) P.learned[id] = true;
}
async function initCloud() {
  try {
    if (!window.claude || !window.claude.use) return;
    const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
    if (!db || !user) return;
    const uid = await user.id();
    if (!uid) return;
    const ref = db.doc('data/users/' + uid + '/progress');
    const snap = await ref.get();
    if (snap.exists) mergeIn(snap.data());
    initSched();
    cloudRef = ref;
    save();
    if (view === 'home' || view === 'rec') { homeQueue = null; render(); }
  } catch (e) {}
}
let PREF = { infl: true, snd: true, board: 'green', pieces: 'classic', p3d: true, auto: false };
const BOARDS = [
  { k: 'green', n: '초록', l: '#ecebd5', d: '#7b9a5d' },
  { k: 'wood', n: '나무', l: '#ecd9b6', d: '#b28862' },
  { k: 'blue', n: '파랑', l: '#e4e9ef', d: '#7d95b3' }
];
function applyBoard() {
  const b = BOARDS.find(x => x.k === PREF.board) || BOARDS[0], st = document.documentElement.style;
  st.setProperty('--sq-l', b.l); st.setProperty('--sq-d', b.d);
  document.documentElement.classList.toggle('p3d', !!PREF.p3d);
}
let AC = null, NOISE = null;
function audio() { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state !== 'running') AC.resume(); return AC; }
// 폰 브라우저는 손가락을 뗄 때(터치 끝·클릭)에만 소리를 허락해요. 그래서 첫 터치 때 소리 장치를 미리 켜 둬요.
['pointerup', 'touchend', 'click', 'keydown'].forEach(ev => document.addEventListener(ev, () => { if (PREF.snd) { try { audio(); } catch (e) {} } }, { capture: true, passive: true }));
function snd(kind) {
  if (!PREF.snd) return;
  try {
    const A = audio(), t = A.currentTime + .005;
    // 음 하나: f 에서 시작해 (f2가 있으면) f2 로 미끄러져요
    const T = (f, at, dur, type, vol, f2) => {
      const o = A.createOscillator(), g = A.createGain();
      o.type = type || 'sine'; o.frequency.setValueAtTime(f, t + at); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + at + dur);
      g.gain.setValueAtTime(.0001, t + at); g.gain.linearRampToValueAtTime(vol, t + at + .008); g.gain.exponentialRampToValueAtTime(.0001, t + at + dur);
      o.connect(g); g.connect(A.destination); o.start(t + at); o.stop(t + at + dur + .03);
    };
    // 나무 기물이 판에 놓이는 '톡': 짧은 잡음을 걸러서 만들어요(폰 스피커에서도 들리는 높이)
    const K = (at, dur, freq, vol) => {
      if (!NOISE) { NOISE = A.createBuffer(1, Math.floor(A.sampleRate * .2), A.sampleRate); const d = NOISE.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
      const n = A.createBufferSource(), f = A.createBiquadFilter(), g = A.createGain();
      n.buffer = NOISE; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 1.2;
      g.gain.setValueAtTime(vol, t + at); g.gain.exponentialRampToValueAtTime(.0001, t + at + dur);
      n.connect(f); f.connect(g); g.connect(A.destination); n.start(t + at); n.stop(t + at + dur + .02);
    };
    // 나무가 울리는 음 하나: 부딪히자마자 가장 크고 금방 사라져요
    const M = (f, at, dur, vol) => {
      const o = A.createOscillator(), g = A.createGain();
      o.frequency.value = f; g.gain.setValueAtTime(vol, t + at); g.gain.exponentialRampToValueAtTime(.0001, t + at + dur);
      o.connect(g); g.connect(A.destination); o.start(t + at); o.stop(t + at + dur + .02);
    };
    // 나무 기물이 나무 판에 닿는 소리: 닿는 순간의 '딱'(잡음) + 나무가 울리는 음 네 개. 둘 때마다 높이와 세기가 조금씩 달라요.
    const knock = (at, base, vol) => {
      const fq = base * (1 + (Math.random() - .5) * .12), v = vol * (.85 + Math.random() * .3);
      K(at, .014, 2300, v * .55); K(at, .05, 620, v * .7);
      M(fq, at, .11, v * .7); M(fq * 2.32, at, .05, v * .28); M(fq * 4.15, at, .022, v * .1); M(fq * .5, at, .14, v * .5);
    };
    const tock = () => { knock(0, 235, .44); knock(.026, 300, .07); }; // 놓고 나서 살짝 한 번 더 닿아요
    if (kind === 'move') tock();
    else if (kind === 'cap') { knock(0, 400, .26); knock(.08, 205, .52); } // 상대 기물을 쳐내고 묵직하게 놓아요
    else if (kind === 'ok') { T(784, 0, .13, 'sine', .12); T(1175, .1, .24, 'sine', .12); }
    else if (kind === 'bad') { T(330, 0, .15, 'triangle', .26, 230); T(247, .13, .24, 'triangle', .26, 175); }
    else if (kind === 'alt') { T(659, 0, .22, 'sine', .11); }
    else if (kind === 'done') { T(523, 0, .14, 'triangle', .24); T(659, .12, .14, 'triangle', .24); T(784, .24, .14, 'triangle', .24); T(1047, .36, .42, 'triangle', .26); }
  } catch (e) {}
}
try { const pr = localStorage.getItem('opening-drill-pref'); if (pr) PREF = Object.assign(PREF, JSON.parse(pr)); } catch (e) {}
applyBoard();
initPieceDefs();
function savePref() { try { localStorage.setItem('opening-drill-pref', JSON.stringify(PREF)); } catch (e) {} }
const lvOf = (id, ply) => (P.lv[id] && P.lv[id][ply]) || 0;
function setLv(id, ply, v) { P.lv[id] = P.lv[id] || {}; P.lv[id][ply] = Math.max(0, Math.min(3, v)); save(); }
function addMiss(id, ply) { P.miss[id] = P.miss[id] || {}; P.miss[id][ply] = (P.miss[id][ply] || 0) + 1; save(); }
const userPlies = L => L.moves.map((m, i) => i).filter(i => (i % 2 === 0 ? 'w' : 'b') === L.side);
function mastery(L) {
  const ps = userPlies(L);
  const sum = ps.reduce((a, p) => a + lvOf(L.id, p), 0);
  return { pct: Math.round(sum / (ps.length * 3) * 100), avg: sum / ps.length };
}
/* ---------- 간격 반복: 수마다 다음 복습 날짜(due)와 간격(iv, 일)을 기억해요 ---------- */
const STEPS = [1, 3, 7, 16, 35, 70];
function today() { const d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000); }
function ivOf(id, ply) { const v = P.iv[id] && P.iv[id][ply]; return v === undefined ? 0 : v; }
// 예전 기록(날짜 없음)이나 새로 배운 수에 첫 일정을 붙여요: 익힌 정도에 맞춰 간격을 주고 오늘부터 복습
function initSched() {
  let ch = false;
  for (const L of LINES) {
    if (!P.learned[L.id]) continue;
    for (const p of userPlies(L)) {
      if (P.iv[L.id] && P.iv[L.id][p] !== undefined) continue;
      P.iv[L.id] = P.iv[L.id] || {}; P.due[L.id] = P.due[L.id] || {};
      P.iv[L.id][p] = [0, 0, 1, 3][lvOf(L.id, p)];
      if (P.due[L.id][p] === undefined) P.due[L.id][p] = today();
      ch = true;
    }
  }
  if (ch) save();
}
function dueOf(id, ply) { const v = P.due[id] && P.due[id][ply]; return v === undefined ? today() : v; }
// ok: 한 번에 맞힘 → 복습 날이 된 수만 간격을 한 단계 늘려요. 틀리면 오늘 다시.
function sched(id, ply, ok) {
  const t = today(), was = dueOf(id, ply);
  P.due[id] = P.due[id] || {}; P.iv[id] = P.iv[id] || {};
  if (!ok) { P.iv[id][ply] = 0; P.due[id][ply] = t; }
  else if (was <= t) {
    const cur = ivOf(id, ply), nx = STEPS.find(x => x > cur) || STEPS[STEPS.length - 1];
    P.iv[id][ply] = nx; P.due[id][ply] = t + nx;
  } else { P.iv[id][ply] = ivOf(id, ply); P.due[id][ply] = was; }
  save();
  return P.due[id][ply] - t;
}
// 날짜별 활동 기록(연속 일수, 주간 통계)
function bump() { const t = today(); P.days = P.days || {}; P.days[t] = (P.days[t] || 0) + 1; for (const d in P.days) if (+d < t - 120) delete P.days[d]; save(); }
function streak() { const t = today(), D = P.days || {}; let d = D[t] ? t : t - 1, n = 0; while (D[d]) { n++; d--; } return n; }
function lastDays(k) { const t = today(), D = P.days || {}, out = []; for (let i = k - 1; i >= 0; i--) out.push({ day: t - i, n: D[t - i] || 0 }); return out; }
function isReady(L) { return !!P.learned[L.id] && userPlies(L).every(p => lvOf(L.id, p) >= 2); }
function dayLabel(n) { return n <= 0 ? '오늘' : n === 1 ? '내일' : n + '일 뒤'; }
function learnedItems() {
  const t = today(), out = [];
  for (const L of LINES) {
    if (!P.learned[L.id]) continue;
    for (const p of userPlies(L)) out.push({ id: L.id, ply: p, wait: dueOf(L.id, p) - t });
  }
  return out;
}
function dueCount() { return learnedItems().filter(x => x.wait <= 0).length; }
function moveLabel(L, ply) {
  const n = Math.floor(ply / 2) + 1;
  return (ply % 2 === 0 ? n + '.' : n + '...') + L.moves[ply].san;
}

/* ---------- review queue ---------- */
const SESSION = 12;
function buildQueue(early) {
  const all = learnedItems();
  let pool = all.filter(x => x.wait <= 0);
  const totalDue = pool.length;
  if (early && !pool.length) pool = all.slice().sort((a, b) => a.wait - b.wait).slice(0, 8);
  // 가장 오래 밀린 수, 약한 수부터
  pool.forEach(x => { x.key = x.wait * 10 + lvOf(x.id, x.ply) + Math.random(); });
  pool.sort((a, b) => a.key - b.key);
  pool = pool.slice(0, SESSION);
  pool.sort(() => Math.random() - .5);
  // avoid the same line twice in a row
  for (let i = 1; i < pool.length; i++) {
    if (pool[i].id === pool[i - 1].id) {
      const j = pool.findIndex((x, k) => k > i && x.id !== pool[i - 1].id);
      if (j > 0) [pool[i], pool[j]] = [pool[j], pool[i]];
    }
  }
  const q = pool.map(it => {
    const m = byId(it.id).moves[it.ply];
    const type = m.why && lvOf(it.id, it.ply) >= 2 && Math.random() < .45 ? 'why' : 'move';
    return { id: it.id, ply: it.ply, type };
  });
  q.totalDue = totalDue; q.early = !!early && !totalDue;
  return q;
}

/* ---------- board ---------- */
const FILES = 'abcdefgh';
function sqName(fi, ri) { return FILES[fi] + (ri + 1); }
function sqXY(sq, orient) {
  const f = FILES.indexOf(sq[0]), r = +sq[1] - 1;
  return orient === 'w' ? { x: f, y: 7 - r } : { x: 7 - f, y: r };
}
const PNAME = { p: '폰', n: '나이트', b: '비숍', r: '룩', q: '퀸', k: '킹' };
const PVAL = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
function influence(game, sq) {
  const pc = game.get(sq); if (!pc) return null;
  const f = FILES.indexOf(sq[0]), r = +sq[1] - 1;
  const I = { from: sq, piece: pc, ctrl: [], atk: [], def: [], pins: [] };
  const at = (ff, rr) => (ff < 0 || ff > 7 || rr < 0 || rr > 7) ? undefined : FILES[ff] + (rr + 1);
  const touch = s => { const t = game.get(s); if (!t) { I.ctrl.push(s); return null; } if (t.color !== pc.color) I.atk.push(s); else if (t.type !== 'k') I.def.push(s); return t; };
  const jumps = { n: [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]], k: [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]] };
  const slides = { b: [[1, 1], [1, -1], [-1, 1], [-1, -1]], r: [[1, 0], [-1, 0], [0, 1], [0, -1]] };
  slides.q = slides.b.concat(slides.r);
  if (pc.type === 'p') {
    const d = pc.color === 'w' ? 1 : -1;
    for (const df of [-1, 1]) { const s = at(f + df, r + d); if (s) touch(s); }
  } else if (jumps[pc.type]) {
    for (const [df, dr] of jumps[pc.type]) { const s = at(f + df, r + dr); if (s) touch(s); }
  } else {
    for (const [df, dr] of slides[pc.type]) {
      let k = 1, s;
      while ((s = at(f + df * k, r + dr * k))) {
        const t = touch(s);
        if (t) {
          if (t.color !== pc.color && t.type !== 'k') { // look behind the first enemy piece for a pin
            let k2 = k + 1, s2;
            while ((s2 = at(f + df * k2, r + dr * k2))) {
              const t2 = game.get(s2);
              if (t2) { if (t2.color !== pc.color && 'kqr'.includes(t2.type) && PVAL[t2.type] > PVAL[t.type]) I.pins.push({ via: s, target: s2 }); break; }
              k2++;
            }
          }
          break;
        }
        k++;
      }
    }
  }
  return I;
}
function inflHtml(I, game) {
  if (!I) return '';
  const nm = s => s + ' ' + PNAME[game.get(s).type];
  const rows = [];
  const kingHit = I.atk.find(s => game.get(s).type === 'k');
  if (I.atk.length) rows.push('<div class="r"><span class="lg atk">공격</span><span>' + I.atk.map(nm).join(', ') + (kingHit ? ' · <b>체크!</b>' : '') + '</span></div>');
  if (I.def.length) rows.push('<div class="r"><span class="lg def">지킴</span><span>' + I.def.map(nm).join(', ') + '</span></div>');
  for (const pn of I.pins) rows.push('<div class="r"><span class="lg pin">핀</span><span>' + nm(pn.via) + ' 뒤에 ' + nm(pn.target) + '. 앞 기물이 움직이면 뒤가 잡혀요</span></div>');
  if (I.ctrl.length) rows.push('<div class="r"><span class="lg ctrl">노리는 칸</span><span class="mono">' + I.ctrl.join(' ') + '</span></div>');
  if (!rows.length) return '';
  const c = I.piece.color === 'w' ? '백' : '흑';
  return '<div class="infl"><span class="who2">' + I.from + ' ' + c + ' ' + PNAME[I.piece.type] + (I.piece.type === 'n' ? '가' : '이') + ' 하는 일</span>' + rows.join('') + '</div>';
}
function drawBoard(el, game, o) {
  o = o || {};
  const orient = o.orient || 'w';
  let html = '<div class="board">';
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    const fi = orient === 'w' ? x : 7 - x, ri = orient === 'w' ? 7 - y : y;
    const sq = sqName(fi, ri), p = game.get(sq);
    const cls = ['sq', (fi + ri) % 2 === 0 ? 'd' : 'l'];
    if (o.last && (o.last.from === sq || o.last.to === sq)) cls.push('last');
    if (o.sel === sq) cls.push('sel');
    if (o.hint && o.hint.includes(sq)) cls.push('hint');
    if (o.near && o.near.includes(sq)) cls.push('near');
    if (o.bad && o.bad.includes(sq)) cls.push('bad');
    if (o.land && o.land.includes(sq)) cls.push('land');
    let inner = '';
    if (!o.mini) {
      if (x === 0) inner += '<span class="co r">' + (ri + 1) + '</span>';
      if (y === 7) inner += '<span class="co f">' + FILES[fi] + '</span>';
    }
    if (p) inner += pieceSvg(p.color, p.type, null, o.flat);
    if (o.badge && o.badge.sq === sq) inner += '<span class="badge ' + o.badge.kind + '">' + { ok: '✓', bad: '✕', alt: '!?' }[o.badge.kind] + '</span>';
    if (o.targets && o.targets.includes(sq)) inner += p ? '<span class="ring"></span>' : '<span class="dot"></span>';
    html += '<div class="' + cls.join(' ') + '" data-sq="' + sq + '">' + inner + '</div>';
  }
  html += '</div>';
  const line = (from, to, color, mk, w, dash, cls) => {
    const a = sqXY(from, orient), b = sqXY(to, orient);
    const x1 = a.x + .5, y1 = a.y + .5, x2 = b.x + .5, y2 = b.y + .5;
    const len = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / len, uy = (y2 - y1) / len;
    const sx = x1 + ux * .22, sy = y1 + uy * .22, ex = x2 - ux * .34, ey = y2 - uy * .34;
    return '<line class="' + (cls || '') + '" x1="' + sx + '" y1="' + sy + '" x2="' + ex + '" y2="' + ey + '" stroke="' + color + '" stroke-width="' + w + '" stroke-linecap="round"' + (dash ? ' stroke-dasharray=".14 .12"' : '') + ' marker-end="url(#' + mk + ')"/>';
  };
  if (o.arrow || o.infl) {
    const mk = (id, c) => '<marker id="' + id + '" markerWidth="3" markerHeight="3" refX="1.4" refY="1.5" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L3,1.5 L0,3 z" fill="' + c + '"/></marker>';
    let svg = '<svg class="arrows' + (o.fresh ? ' fresh' : '') + '" viewBox="0 0 8 8" aria-hidden="true"><defs>' + mk('ah', 'var(--arrow)') + mk('ah-a', 'var(--atk)') + mk('ah-d', 'var(--def)') + '</defs>';
    if (o.infl) {
      const I = o.infl;
      for (const c of I.ctrl) { const p = sqXY(c, orient); svg += '<circle class="inf" cx="' + (p.x + .5) + '" cy="' + (p.y + .5) + '" r=".1" fill="var(--ctrl)"/>'; }
      for (const t of I.def) svg += line(I.from, t, 'var(--def)', 'ah-d', '.09', false, 'inf');
      for (const t of I.atk) svg += line(I.from, t, 'var(--atk)', 'ah-a', '.11', false, 'inf');
      for (const pn of I.pins) svg += line(pn.via, pn.target, 'var(--atk)', 'ah-a', '.07', true, 'inf');
    }
    if (o.arrow) svg += line(o.arrow.from, o.arrow.to, 'var(--arrow)', 'ah', '.18');
    html += svg + '</svg>';
  }
  el.innerHTML = html;
}

/* ---------- views ---------- */
let view = 'home', S = null, homeQueue = null, curFirst = 'e4';
function go(v, arg) {
  view = v;
  if (v === 'home') homeQueue = buildQueue();
  if (v === 'intro') S = { line: byId(arg) };
  if (v === 'first') curFirst = arg;
  render();
  window.scrollTo(0, 0);
}
function render() {
  document.querySelector('.wrap').dataset.view = view;
  document.getElementById('nav-home').setAttribute('aria-current', view !== 'rec' && view !== 'pgn');
  document.getElementById('nav-pgn').setAttribute('aria-current', view === 'pgn');
  document.getElementById('nav-rec').setAttribute('aria-current', view === 'rec');
  if (view === 'home') renderHome();
  else if (view === 'first') renderFirst();
  else if (view === 'pgn') renderPgn();
  else if (view === 'intro') renderIntro();
  else if (view === 'rec') renderRec();
  else if (view === 'play') renderPlay();
}
document.getElementById('brand').onclick = () => go('home');
document.getElementById('nav-home').onclick = () => go('home');
document.getElementById('nav-rec').onclick = () => go('rec');
document.getElementById('nav-pgn').onclick = () => go('pgn');

function diagramHtml(id, orient, mini) {
  return '<div class="diagram' + (mini ? ' mini' : '') + '"><div class="board-wrap" id="' + id + '"></div></div>';
}
const posCache = {};
function finalPos(L) {
  if (!posCache[L.id]) { const g = new Chess(); L.moves.forEach(m => g.move(m.san)); posCache[L.id] = g; }
  return posCache[L.id];
}
function lineLabel(L) { const F = FIRSTS.find(f => f.k === firstKey(L)); return F.t + ' · ' + SECTIONS[sectionOf(L)].n; }
function statusHtml(L) {
  if (!P.learned[L.id]) return '<span class="chip">배우기 전</span>';
  const t = today(), waits = userPlies(L).map(p => dueOf(L.id, p) - t), due = waits.filter(w => w <= 0).length;
  const chip = due ? '<span class="chip due">오늘 ' + due + '수</span>' : '<span class="chip ok">✓ ' + dayLabel(Math.min.apply(null, waits)) + '</span>';
  const pct = mastery(L).pct;
  return chip + (isReady(L) ? '<span class="chip rdy">실전 준비</span>' : '') + '<span class="pbar" role="img" aria-label="숙련도 ' + pct + '%"><i style="width:' + pct + '%"></i></span>';
}
function renderHome() {
  if (!homeQueue) homeQueue = buildQueue();
  const q = homeQueue;
  let h = '<div class="home">';
  if (q.length) {
    h += '<section class="homework"><div><span class="label">오늘의 복습</span><h2>' + q.length + '문제</h2><p>약 ' + Math.max(2, Math.ceil(q.length * .4)) + '분 · ' + (q.totalDue > q.length ? '오늘 복습할 ' + q.totalDue + '수 중 급한 것부터' : '복습할 날이 된 수만 섞어서 내요') + '</p></div>' +
      '<button class="btn primary" id="startReview" type="button">복습 시작</button></section>';
  } else if (learnedItems().length) {
    const up = learnedItems(), nx = Math.min.apply(null, up.map(x => x.wait)), cnt = up.filter(x => x.wait === nx).length;
    h += '<section class="homework"><div><span class="label">오늘의 복습</span><h2>오늘은 끝났어요</h2><p>다음 복습은 ' + dayLabel(nx) + ', ' + cnt + '수예요.</p></div>' +
      '<button class="btn" id="startEarly" type="button">미리 복습</button></section>';
  } else {
    h += '<section class="homework"><div><span class="label">시작하기</span><h2>오프닝을 하나 배워 보세요</h2><p>배운 수는 잊을 때쯤 여기에서 다시 물어봐요.</p></div>' +
      '<button class="btn primary" id="startFirst" type="button">이탈리안 게임 배우기</button></section>';
  }
  const nLearn = LINES.filter(l => P.learned[l.id]).length, wk = lastDays(7).reduce((a, x) => a + x.n, 0);
  h += '<div class="stats"><div><b>' + streak() + '</b><span>연속 일수</span></div><div><b>' + wk + '</b><span>최근 7일 문제</span></div><div><b>' + nLearn + '<small>/' + LINES.length + '</small></b><span>배운 오프닝</span></div><div><b>' + LINES.filter(isReady).length + '</b><span>실전 준비</span></div></div>';
  const fw = forkPool('w').length, fb = forkPool('b').length;
  if (fw >= 2 || fb >= 2) h += '<section class="homework fork"><div><span class="label ink">갈림길 연습</span><h2>상대가 고르는 길에 맞춰 두기</h2><p>배운 오프닝을 한데 섞어요. 상대가 어느 수를 둘지 몰라요.</p></div><div class="frow">' +
    (fw >= 2 ? '<button class="btn" data-fork="w" type="button">백으로 · ' + fw + '개</button>' : '') + (fb >= 2 ? '<button class="btn" data-fork="b" type="button">흑으로 · ' + fb + '개</button>' : '') + '</div></section>';
  h += '<section class="chapter"><div class="chead"><h2>첫 수로 고르기</h2><span class="muted">백이 맨 처음 움직이는 기물</span></div><ul class="toc firsts">';
  const t = today();
  for (const F of FIRSTS) {
    const lines = LINES.filter(l => firstKey(l) === F.k), learned = lines.filter(l => P.learned[l.id]);
    let due = 0;
    for (const L of learned) due += userPlies(L).filter(p => dueOf(L.id, p) <= t).length;
    h += '<li><button class="card ftile" type="button" data-first="' + F.k + '"><span class="thumb" data-fthumb="' + F.k + '"></span><span class="cbody"><span class="t">' + F.t + ' <small>' + F.n + '</small></span>' +
      '<span class="n">' + F.d + '</span><span class="crow"><span class="chip">오프닝 ' + lines.length + '개</span>' + (learned.length ? '<span class="chip ok">배운 것 ' + learned.length + '</span>' : '') + (due ? '<span class="chip due">오늘 ' + due + '수</span>' : '') + '</span></span></button></li>';
  }
  h += '</ul></section>';
  $app.innerHTML = h + '</div>';
  $app.querySelectorAll('[data-fthumb]').forEach(el => { const g = new Chess(); if (el.dataset.fthumb !== 'etc') g.move(el.dataset.fthumb); drawBoard(el, g, { orient: 'w', mini: true, flat: true }); });
  $app.querySelectorAll('[data-first]').forEach(b => b.onclick = () => go('first', b.dataset.first));
  $app.querySelectorAll('[data-fork]').forEach(b => b.onclick = () => startFork(b.dataset.fork));
  const sr = document.getElementById('startReview'); if (sr) sr.onclick = () => startReview();
  const se = document.getElementById('startEarly'); if (se) se.onclick = () => startReview(true);
  const sf = document.getElementById('startFirst'); if (sf) sf.onclick = () => go('intro', 'italian-w');
}
function renderFirst() {
  const F = FIRSTS.find(f => f.k === curFirst) || FIRSTS[0];
  let h = '<button class="back" id="back" type="button">← 첫 수 고르기</button><div class="home"><div class="fhead"><h1>' + F.t + '</h1><p class="muted">' + F.n + ' · ' + F.d + '</p></div>';
  SECTIONS.forEach((sec, si) => {
    const lines = LINES.filter(l => firstKey(l) === F.k && sectionOf(l) === si);
    if (!lines.length) return;
    h += '<section class="chapter"><div class="chead"><h2>' + sec.n + '</h2><span class="muted">' + sec.d + ' · ' + lines.length + '개</span></div><ul class="toc">';
    for (const L of lines) {
      const small = L.role ? ' · ' + L.role : L.variation ? ' · 변화' : '';
      h += '<li><button class="card" type="button" data-line="' + L.id + '"><span class="thumb" data-thumb="' + L.id + '"></span><span class="cbody"><span class="t">' + esc(L.title) + '</span>' +
        '<span class="n"><i class="side ' + L.side + '"></i>' + (L.side === 'w' ? '백' : '흑') + small + ' · ' + esc(L.sub) + '</span><span class="crow">' + statusHtml(L) + '</span></span></button></li>';
    }
    h += '</ul>';
    if (si < 2) { const side = si === 0 ? 'w' : 'b', n = forkPool(side, F.k).length; if (n >= 2) h += '<button class="btn forkbtn" data-fork="' + side + '" type="button">갈림길 연습 · 배운 ' + n + '개 섞기</button>'; }
    h += '</section>';
  });
  h += '<p class="legend"><span><span class="chip due">오늘 3수</span>오늘 복습할 수</span><span><span class="chip ok">✓ 3일 뒤</span>다음 복습까지</span><span><span class="chip rdy">실전 준비</span>모든 수를 두 번 이상 맞힘</span><span><span class="pbar"><i style="width:60%"></i></span>숙련도</span></p>';
  $app.innerHTML = h + '</div>';
  $app.querySelectorAll('[data-fork]').forEach(b => b.onclick = () => startFork(b.dataset.fork, F.k));
  $app.querySelectorAll('[data-thumb]').forEach(el => { const L = byId(el.dataset.thumb); drawBoard(el, finalPos(L), { orient: L.side, mini: true, flat: true }); });
  $app.querySelectorAll('[data-line]').forEach(b => b.onclick = () => go('intro', b.dataset.line));
  document.getElementById('back').onclick = () => go('home');
}

function analysisHtml(L) {
  if (!L.pros) return '';
  const trap = L.group === 'trap';
  return '<section class="analysis"><div class="pcgrid"><div><h3>' + (trap ? '알아두면 좋은 점' : '장점') + '</h3><ul class="plist pro">' + L.pros.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul></div>' +
    '<div><h3>' + (trap ? '주의할 점' : '단점') + '</h3><ul class="plist con">' + L.cons.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul></div></div>' +
    '<div><h3>' + (trap ? '그다음 흐름' : '오프닝 이후 전개') + '</h3><p class="after">' + esc(L.after) + '</p><p class="legend">읽는 법 · h3 = 폰을 h3 칸으로 · Nd2 = 나이트를 d2로 · ...Be6 = 흑이 비숍을 e6로 (N 나이트, B 비숍, R 룩, Q 퀸, K 킹)</p></div></section>';
}
function renderIntro() {
  const L = S.line, learned = !!P.learned[L.id];
  $app.innerHTML = '<button class="back" id="back" type="button">← ' + FIRSTS.find(f => f.k === firstKey(L)).t + ' 오프닝</button>' +
    '<div class="intro"><div class="ihead"><span class="label">' + lineLabel(L) + (L.role ? ' · ' + L.role : '') + '</span>' +
    '<h1>' + esc(L.title) + '</h1><p class="lead-p">' + esc(L.summary) + '</p>' +
    '<div class="actions"><button class="btn ' + (learned ? '' : 'primary') + '" id="learn" type="button">배우기</button>' +
    '<button class="btn ' + (learned ? 'primary' : '') + '" id="practice" type="button">연습</button></div>' +
    '<p class="note-sm">' + (learned ? '연습은 익힌 수를 자동으로 넘기고 약한 수부터 물어봐요.' : '배우기는 화살표를 따라 두고, 연습은 직접 찾아서 둬요.') + '</p></div>' +
    '<figure class="diagram-fig">' + diagramHtml('mini', L.side, true) + '<figcaption><b>목표 자리</b>' + L.moves.length + '수 뒤 · ' + (L.side === 'w' ? '백' : '흑') + '으로 둬요<br><span class="mono">' + esc(L.sub) + '</span></figcaption></figure>' +
    '<div class="ibody"><h3 class="sheet-h">핵심 아이디어</h3><ul class="ideas">' + L.ideas.map(t => '<li><span>' + esc(t) + '</span></li>').join('') + '</ul>' + analysisHtml(L) + '</div></div>';
  drawBoard(document.getElementById('mini'), finalPos(L), { orient: L.side, mini: true });
  document.getElementById('back').onclick = () => go('first', firstKey(L));
  document.getElementById('learn').onclick = () => startLine(L.id, 'learn');
  document.getElementById('practice').onclick = () => startLine(L.id, 'practice');
}

function renderRec() {
  const wkd = lastDays(7), wmax = Math.max(1, ...wkd.map(x => x.n)), DOW = ['일', '월', '화', '수', '목', '금', '토'];
  let h = '<div class="rec"><section><div class="section-h"><h2>최근 7일</h2><span class="muted">연속 ' + streak() + '일 · 합계 ' + wkd.reduce((a, x) => a + x.n, 0) + '문제</span></div><div class="week">' +
    wkd.map(x => '<div class="wd"><span class="wn">' + (x.n || '') + '</span><span class="wb"><i style="height:' + Math.round(x.n / wmax * 100) + '%"></i></span><span class="wl">' + DOW[new Date(x.day * 86400000).getUTCDay()] + '</span></div>').join('') + '</div></section>';
  h += '<section><div class="section-h"><span class="label">성적표</span><h2>오프닝별 숙련도</h2></div><table class="rtable"><thead><tr><th>오프닝</th><th>숙련도</th><th style="text-align:right">%</th></tr></thead><tbody>';
  for (const L of LINES) {
    const m = mastery(L);
    if (!P.learned[L.id]) continue;
    h += '<tr><td>' + esc(L.title) + (isReady(L) ? ' <span class="chip rdy">실전 준비</span>' : '') + '</td><td><div class="meter"><i style="width:' + m.pct + '%"></i></div></td><td class="num">' + m.pct + '</td></tr>';
  }
  h += '</tbody></table>' + (LINES.some(l => P.learned[l.id]) ? '' : '<p class="muted" style="margin:8px 0 0">아직 배운 오프닝이 없어요.</p>') + '<p class="muted" style="margin:8px 0 0;font-size:13px">배운 오프닝만 보여요. 전체 ' + LINES.length + '개 중 ' + LINES.filter(l => P.learned[l.id]).length + '개.</p></section>';
  const up = learnedItems();
  if (up.length) {
    const rows = [['오늘', x => x.wait <= 0], ['내일', x => x.wait === 1], ['2~7일 뒤', x => x.wait >= 2 && x.wait <= 7], ['그 뒤', x => x.wait > 7]];
    h += '<section><div class="section-h"><span class="label">복습 일정</span><h2>언제 다시 물어보나</h2></div><table class="rtable"><thead><tr><th>시기</th><th style="text-align:right">수</th></tr></thead><tbody>' +
      rows.map(r => '<tr><td>' + r[0] + '</td><td class="num">' + up.filter(r[1]).length + '</td></tr>').join('') + '</tbody></table>' +
      '<p class="muted" style="margin:8px 0 0;font-size:13px">한 번에 맞히면 1일 → 3일 → 7일 → 16일 → 35일 → 70일로 간격이 늘고, 틀리면 그날 다시 나와요.</p></section>';
  }
  h += '<section><div class="section-h"><span class="label">오답 노트</span><h2>자주 틀리는 수</h2></div>';
  const list = [];
  for (const id in P.miss) for (const p in P.miss[id]) { const L = byId(id); if (L && L.moves[p]) list.push({ L, p: +p, n: P.miss[id][p] }); }
  list.sort((a, b) => b.n - a.n);
  if (list.length) h += '<table class="rtable"><thead><tr><th>오프닝</th><th>수</th><th style="text-align:right">횟수</th></tr></thead><tbody>' +
    list.slice(0, 5).map(x => '<tr><td>' + esc(x.L.title) + '</td><td class="mono">' + esc(moveLabel(x.L, x.p)) + '</td><td class="num">' + x.n + '</td></tr>').join('') + '</tbody></table>';
  else h += '<p class="muted">아직 틀린 수가 없어요. 연습이나 복습을 하면 여기에 쌓여요.</p>';
  h += '</section><section><div class="section-h"><h2>설정</h2></div><div class="setbox"><div class="setrow"><span>보드 색</span><div class="swatches">' +
    BOARDS.map(b => '<button type="button" class="sw" data-board="' + b.k + '" aria-pressed="' + (PREF.board === b.k) + '"><i style="background:linear-gradient(135deg,' + b.l + ' 50%,' + b.d + ' 50%)"></i>' + b.n + '</button>').join('') +
    '</div></div><div class="setrow"><span>기물 모양</span><div class="swatches">' +
    PIECE_SETS.map(x => '<button type="button" class="sw" data-pieces="' + x.k + '" aria-pressed="' + (PREF.pieces === x.k) + '"><span class="pv">' + pieceSvg('w', 'n', x.k) + '</span>' + x.n + '</button>').join('') +
    '</div></div><div class="setrow"><span>입체감</span><button class="tgl" id="set3d" type="button" aria-pressed="' + !!PREF.p3d + '">빛과 그림자 넣기</button></div>' +
    '<div class="setrow"><span>상대 수</span><button class="tgl" id="setAuto" type="button" aria-pressed="' + !!PREF.auto + '">배우기에서 설명 없이 자동 진행</button></div>' +
    '<div class="setrow"><span>효과음</span><button class="tgl" id="setSnd" type="button" aria-pressed="' + PREF.snd + '">정답·오답 소리</button></div>' +
    '<div class="setrow"><span>공격·수비 표시</span><button class="tgl" id="setInfl" type="button" aria-pressed="' + PREF.infl + '">둔 기물이 노리는 칸</button></div></div>';
  h += '</section><section><div class="section-h"><span class="label">관리</span><h2>기록</h2></div><p class="muted" style="margin:0 0 10px">' + (cloudRef ? '기록이 내 계정에 저장돼서 휴대폰과 PC에서 이어서 할 수 있어요.' : '기록은 이 브라우저에 저장돼요.') + '</p>' +
    '<div class="confirm"><button class="btn" id="exp" type="button">기록 내보내기</button><button class="btn" id="expCopy" type="button">텍스트로 복사</button><button class="btn" id="imp" type="button">기록 가져오기</button><input type="file" id="impFile" accept=".json,application/json,text/plain" hidden></div>' +
    '<div id="impBox" hidden><textarea id="impText" class="ta" rows="4" placeholder="내보낸 기록 텍스트를 여기에 붙여 넣거나, 아래에서 파일을 고르세요"></textarea><div class="confirm"><button class="btn primary" id="impGo" type="button">붙여 넣은 기록 합치기</button><button class="btn" id="impPick" type="button">파일 고르기</button></div></div>' +
    '<p class="muted" id="ioMsg" style="margin:8px 0 14px;font-size:13px">기기를 바꾸거나 앱을 지우기 전에 내보내 두세요. 가져오면 지금 기록과 합쳐져요(더 높은 숙련도가 남아요).</p>' +
    '<div class="confirm" id="resetBox"><button class="btn" id="reset" type="button">기록 모두 지우기</button></div></section></div>';
  $app.innerHTML = h;
  $app.querySelectorAll('[data-board]').forEach(b => b.onclick = () => { PREF.board = b.dataset.board; savePref(); applyBoard(); renderRec(); });
  $app.querySelectorAll('[data-pieces]').forEach(b => b.onclick = () => { PREF.pieces = b.dataset.pieces; savePref(); renderRec(); });
  document.getElementById('set3d').onclick = () => { PREF.p3d = !PREF.p3d; savePref(); applyBoard(); renderRec(); };
  document.getElementById('setAuto').onclick = () => { PREF.auto = !PREF.auto; savePref(); renderRec(); };
  document.getElementById('setSnd').onclick = () => { PREF.snd = !PREF.snd; savePref(); if (PREF.snd) snd('ok'); renderRec(); };
  document.getElementById('setInfl').onclick = () => { PREF.infl = !PREF.infl; savePref(); renderRec(); };
  const ioMsg = t => { document.getElementById('ioMsg').textContent = t; };
  const dump = () => JSON.stringify({ app: 'opening-drill', v: 1, at: new Date().toISOString(), P, PREF });
  document.getElementById('exp').onclick = () => {
    try {
      const d = new Date(), name = 'opening-drill-기록-' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + '.json';
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([dump()], { type: 'application/json' })); a.download = name;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      ioMsg('"' + name + '" 파일로 내보냈어요. 다운로드 폴더를 확인하세요.');
    } catch (e) { ioMsg('파일로 내보내지 못했어요. "텍스트로 복사"를 써 보세요.'); }
  };
  document.getElementById('expCopy').onclick = () => {
    const t = dump();
    const done = () => ioMsg('기록을 복사했어요. 메모장이나 메신저에 붙여 넣어 보관하세요.');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, () => { showText(t); });
    else showText(t);
  };
  function showText(t) { const b = document.getElementById('impBox'); b.hidden = false; const ta = document.getElementById('impText'); ta.value = t; ta.select(); ioMsg('자동 복사가 안 돼서 아래 상자에 넣어 뒀어요. 전체를 길게 눌러 복사하세요.'); }
  function importText(t) {
    let o; try { o = JSON.parse(t); } catch (e) { return ioMsg('기록 형식이 아니에요. 내보낸 텍스트 전체를 넣었는지 확인하세요.'); }
    if (!o || o.app !== 'opening-drill' || !o.P) return ioMsg('이 앱에서 내보낸 기록이 아니에요.');
    mergeIn(o.P); initSched(); save(); homeQueue = null; renderRec();
    document.getElementById('ioMsg').textContent = '기록을 합쳤어요. 배운 오프닝 ' + LINES.filter(l => P.learned[l.id]).length + '개.';
  }
  document.getElementById('imp').onclick = () => { const b = document.getElementById('impBox'); b.hidden = !b.hidden; };
  document.getElementById('impPick').onclick = () => document.getElementById('impFile').click();
  document.getElementById('impFile').onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => importText(String(r.result)); r.readAsText(f); };
  document.getElementById('impGo').onclick = () => importText(document.getElementById('impText').value.trim());
  document.getElementById('reset').onclick = () => {
    document.getElementById('resetBox').innerHTML = '<span>모든 숙련도와 오답 기록을 지울까요? 되돌릴 수 없어요.</span><button class="btn" id="resetYes" type="button" style="border-color:var(--bad);color:var(--bad)">지우기</button><button class="btn text" id="resetNo" type="button">취소</button>';
    document.getElementById('resetYes').onclick = () => { P = blankP(); save(); homeQueue = null; renderRec(); };
    document.getElementById('resetNo').onclick = renderRec;
  };
}

/* ---------- 실전 기보: 내가 둔 판이 배운 수순에서 어디서 벗어났는지 ---------- */
let PG = { text: '', res: null, msg: '', games: [], scan: {} };
// 엔진으로 한 판을 훑어, 내 수 가운데 평가가 크게 떨어진 곳(실수)을 찾아요
async function scanGame(i) {
  const gm = PG.games[i], x = PG.res[i]; if (!gm || !x || (PG.scan[i] && PG.scan[i].run)) return;
  const sc = PG.scan[i] = { run: true, txt: '엔진을 준비하는 중…' };
  const paint = () => { const e = document.getElementById('scan' + i); if (e && PG.scan[i] === sc) e.innerHTML = scanHtml(sc, i); };
  paint();
  const g = new Chess(), ms = [];
  for (const tok of gm.moves) { const r = g.move(tok); if (!r) break; ms.push(r); if (ms.length >= 120) break; }
  const uci = ms.map(m => m.from + m.to + (m.promotion || ''));
  try {
    const ev = [];
    for (let k = 0; k <= ms.length; k++) {
      const o = await SF.go(uci.slice(0, k), { depth: 10 });
      if (PG.scan[i] !== sc) return;
      ev.push({ v: evNum(o, k % 2 === 0 ? 'w' : 'b'), best: o.best });
      sc.txt = '엔진이 보는 중… ' + k + ' / ' + ms.length; paint();
    }
    const s = x.side === 'w' ? 1 : -1, cl = v => Math.max(-800, Math.min(800, v)), h = new Chess(), list = [];
    for (let k = 0; k < ms.length; k++) {
      const b = ev[k].best;
      if ((k % 2 === 0 ? 'w' : 'b') === x.side && b && b !== uci[k]) {
        const loss = (cl(ev[k].v) - cl(ev[k + 1].v)) * s;
        if (loss >= 100) {
          const bm = h.move({ from: b.slice(0, 2), to: b.slice(2, 4), promotion: b[4] || 'q' }); if (bm) h.undo();
          list.push({ ply: k, san: ms[k].san, loss, big: loss >= 250, best: bm ? bm.san : b, a: ev[k].v * s, z: ev[k + 1].v * s });
        }
      }
      h.move(ms[k].san);
    }
    sc.list = list; sc.n = ms.length;
  } catch (e) { sc.txt = engErr(e); sc.err = true; }
  sc.run = false; paint();
}
function scanHtml(sc, i) {
  if (!sc) return '<button class="btn" type="button" data-scan="' + i + '">엔진으로 실수 찾기</button>';
  if (sc.run || sc.err) return '<div class="gd muted">' + esc(sc.txt) + '</div>';
  if (!sc.list.length) return '<div class="gd">엔진이 ' + sc.n + '수까지 봤는데, 내 수에 큰 실수는 없었어요.</div>';
  const top = sc.list.slice().sort((a, b) => b.loss - a.loss).slice(0, 8).sort((a, b) => a.ply - b.ply);
  return '<div class="gd"><b>엔진이 찾은 내 실수 ' + sc.list.length + '곳</b>' + (sc.list.length > top.length ? ' (큰 것 ' + top.length + '곳만)' : '') + ' <span class="muted">· 숫자는 내 기준 평가, +면 내가 유리</span></div><ul class="scanl">' +
    top.map(m => '<li><b class="mono">' + esc(numLabel(m.ply, m.san)) + (m.big ? '??' : '?') + '</b> ' + evText(m.a) + ' → ' + evText(m.z) + ' · 엔진 추천 <b class="mono">' + esc(m.best) + '</b></li>').join('') + '</ul>';
}
function parsePgn(text) {
  const games = []; let cur = null, body = '';
  const flush = () => { if (cur && body.trim()) { cur.moves = pgnMoves(body); if (cur.moves.length) games.push(cur); } cur = null; body = ''; };
  for (const raw of String(text).replace(/\r/g, '').split('\n')) {
    const line = raw.trim(), t = /^\[(\w+)\s+"(.*)"\]$/.exec(line);
    if (t) { if (body.trim()) flush(); cur = cur || { tags: {} }; cur.tags[t[1]] = t[2]; }
    else if (line) { cur = cur || { tags: {} }; body += ' ' + line; }
  }
  flush();
  return games;
}
function pgnMoves(body) {
  let b = body.replace(/\{[^}]*\}/g, ' ').replace(/;[^\n]*/g, ' ');
  while (/\([^()]*\)/.test(b)) b = b.replace(/\([^()]*\)/g, ' ');
  return b.replace(/\$\d+/g, ' ').split(/\s+/).map(x => x.replace(/^\d+\.+/, '').replace(/[!?]+$/, '')).filter(x => x && !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(x) && !/^\d+\.*$/.test(x));
}
function numLabel(ply, san) { const n = Math.floor(ply / 2) + 1; return (ply % 2 === 0 ? n + '.' : n + '...') + san; }
function analyzeGame(gm, me) {
  const g = new Chess(), sans = [], shown = [];
  for (const tok of gm.moves) { const r = g.move(tok); if (!r) break; sans.push(strip(r.san)); shown.push(r.san); if (sans.length >= 60) break; }
  const lower = x => String(x || '').trim().toLowerCase();
  const match = side => {
    let cands = LINES.filter(l => l.side === side), ply = 0, done = null;
    for (; ply < sans.length; ply++) {
      const ended = cands.filter(l => l.moves.length === ply);
      const nx = cands.filter(l => l.moves[ply] && strip(l.moves[ply].san) === sans[ply]);
      if (!nx.length) { if (ended.length) done = ended; break; }
      cands = nx;
    }
    if (!done && ply === sans.length) { const ended = cands.filter(l => l.moves.length === ply); if (ended.length) done = ended; }
    const pick = arr => arr.slice().sort((a, b) => (P.learned[b.id] ? 1 : 0) - (P.learned[a.id] ? 1 : 0))[0];
    const line = pick(done || cands);
    let kind, dev = null;
    if (ply < 2) kind = 'none';
    else if (done) kind = 'full';
    else if (ply >= sans.length) kind = 'short';
    else {
      kind = (ply % 2 === 0 ? 'w' : 'b') === side ? 'me' : 'opp';
      const book = [...new Set(cands.filter(l => l.moves[ply]).map(l => l.moves[ply].san))];
      dev = { ply, played: shown[ply], book };
    }
    return { side, ply, line, kind, dev };
  };
  let side = null;
  if (me) { if (lower(gm.tags.White) === lower(me)) side = 'w'; else if (lower(gm.tags.Black) === lower(me)) side = 'b'; }
  let r;
  if (side) r = match(side); else { const a = match('w'), b = match('b'); r = b.ply > a.ply ? b : a; r.guess = true; }
  r.tags = gm.tags; r.n = sans.length;
  return r;
}
function runPgn(text) {
  const games = parsePgn(text);
  if (!games.length) { PG.res = null; PG.msg = '기보를 찾지 못했어요. PGN 형식인지 확인하세요.'; return; }
  PG.games = games.slice(0, 200); PG.scan = {};
  PG.res = PG.games.map(gm => analyzeGame(gm, PREF.me)); PG.msg = '';
}
async function fetchGames(site) {
  const u = (site === 'li' ? PREF.liUser : PREF.ccUser || '').trim();
  if (!u) { PG.msg = '아이디를 먼저 적어 주세요.'; return renderPgn(); }
  PG.msg = '불러오는 중…'; renderPgn();
  try {
    let pgn = '';
    if (site === 'li') {
      const r = await fetch('https://lichess.org/api/games/user/' + encodeURIComponent(u) + '?max=30&clocks=false&evals=false&opening=false', { headers: { Accept: 'application/x-chess-pgn' } });
      if (!r.ok) throw new Error(r.status); pgn = await r.text();
    } else {
      const a = await fetch('https://api.chess.com/pub/player/' + encodeURIComponent(u.toLowerCase()) + '/games/archives');
      if (!a.ok) throw new Error(a.status);
      const arch = (await a.json()).archives || []; if (!arch.length) throw new Error('empty');
      const m = await fetch(arch[arch.length - 1]); if (!m.ok) throw new Error(m.status);
      pgn = ((await m.json()).games || []).slice(-30).map(x => x.pgn || '').join('\n\n');
    }
    if (!PREF.me) { PREF.me = u; savePref(); }
    PG.text = pgn; runPgn(pgn);
    if (!PG.res) PG.msg = '불러온 기보가 없어요.';
  } catch (e) { PG.msg = '불러오지 못했어요. 인터넷 연결과 아이디를 확인하세요. 안 되면 사이트에서 PGN을 내려받아 붙여 넣어도 돼요.'; }
  renderPgn();
}
function renderPgn() {
  let h = '<div class="rec"><section><div class="section-h"><h2>내 실전 기보</h2><span class="muted">배운 수순에서 어디서 벗어났는지</span></div><div class="pgnform">' +
    '<div class="pgnrow"><label for="pgMe">기보 속 내 이름(아이디). 비워 두면 더 길게 맞는 쪽으로 추측해요</label><input class="inp" id="pgMe" value="' + esc(PREF.me || '') + '" autocomplete="off" autocapitalize="off" spellcheck="false"></div>' +
    '<textarea class="ta" id="pgText" rows="5" placeholder="PGN을 여기에 붙여 넣으세요. 여러 판을 한꺼번에 넣어도 돼요." spellcheck="false">' + esc(PG.text) + '</textarea>' +
    '<div class="confirm"><button class="btn primary" id="pgGo" type="button">분석하기</button><button class="btn" id="pgPick" type="button">PGN 파일 고르기</button><input type="file" id="pgFile" accept=".pgn,text/plain" hidden></div>' +
    '<div class="pgnrow"><label>사이트에서 최근 30판 불러오기(인터넷 필요)</label><input class="inp" id="pgLi" placeholder="Lichess 아이디" value="' + esc(PREF.liUser || '') + '" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="btn" id="pgLiGo" type="button">Lichess</button></div>' +
    '<div class="pgnrow"><input class="inp" id="pgCc" placeholder="체스닷컴 아이디" value="' + esc(PREF.ccUser || '') + '" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="btn" id="pgCcGo" type="button">체스닷컴</button></div>' +
    (PG.msg ? '<p class="muted" id="pgMsg" style="margin:0">' + esc(PG.msg) + '</p>' : '') + '</div></section>';
  if (PG.res) {
    const R = PG.res, cnt = k => R.filter(x => x.kind === k).length;
    h += '<section><div class="section-h"><h2>결과</h2><span class="muted">' + R.length + '판</span></div><div class="gsum stats"><div><b>' + cnt('full') + '</b><span>끝까지 정석</span></div><div><b>' + cnt('me') + '</b><span>내가 벗어남</span></div><div><b>' + cnt('opp') + '</b><span>상대가 벗어남</span></div><div><b>' + (cnt('none') + cnt('short')) + '</b><span>해당 없음</span></div></div></section>';
    const agg = {};
    for (const x of R) if (x.kind === 'me') { const k = x.line.id + '|' + x.dev.ply; (agg[k] = agg[k] || { x, n: 0 }).n++; }
    const top = Object.values(agg).sort((a, b) => b.n - a.n).slice(0, 5);
    if (top.length) h += '<section><div class="section-h"><h2>내가 자주 벗어나는 곳</h2></div><table class="rtable"><thead><tr><th>오프닝</th><th>배운 수</th><th style="text-align:right">횟수</th></tr></thead><tbody>' +
      top.map(a => '<tr><td>' + esc(a.x.line.title) + '</td><td class="mono">' + esc(numLabel(a.x.dev.ply, a.x.dev.book.join(' / '))) + '</td><td class="num">' + a.n + '</td></tr>').join('') + '</tbody></table></section>';
    h += '<section><div class="section-h"><h2>판별 보기</h2></div><ul class="glist">';
    R.forEach((x, i) => {
      const T = x.tags, head = esc((T.White || '백') + ' – ' + (T.Black || '흑')) + (T.Result ? ' · ' + esc(T.Result) : '') + (T.Date || T.UTCDate ? ' · ' + esc(T.Date || T.UTCDate) : '') + ' · 나: ' + (x.side === 'w' ? '백' : '흑') + (x.guess ? '(추측)' : '');
      let body;
      if (x.kind === 'none') body = '<div class="gd muted">배운 오프닝과 겹치지 않아요.</div>';
      else {
        const mv = Math.ceil(x.ply / 2);
        body = '<div class="gt">' + esc(x.line.title) + ' <span class="muted" style="font-weight:500">· ' + mv + '수까지 일치</span></div>';
        if (x.kind === 'full') body += '<div class="gd">배운 수순을 끝까지 그대로 뒀어요.</div>';
        else if (x.kind === 'short') body += '<div class="gd muted">수순이 끝나기 전에 판이 끝났어요.</div>';
        else if (x.kind === 'me') body += '<div class="gd">내가 벗어남 · <b>' + esc(numLabel(x.dev.ply, x.dev.played)) + '</b> → 배운 수는 <b>' + esc(x.dev.book.join(' / ')) + '</b></div>';
        else body += '<div class="gd">상대가 벗어남 · <b>' + esc(numLabel(x.dev.ply, x.dev.played)) + '</b> (배운 수순은 <b>' + esc(x.dev.book.join(' / ')) + '</b>)</div>';
        body += '<button class="btn" type="button" data-goline="' + x.line.id + '">' + (P.learned[x.line.id] ? '이 오프닝 연습' : '이 오프닝 배우기') + '</button>';
      }
      h += '<li class="gcard ' + x.kind + '"><div class="gh">' + (i + 1) + '. ' + head + '</div>' + body + '<div class="scan" id="scan' + i + '">' + scanHtml(PG.scan[i], i) + '</div></li>';
    });
    h += '</ul></section>';
  }
  $app.innerHTML = h + '</div>';
  const keep = () => { PG.text = document.getElementById('pgText').value; PREF.me = document.getElementById('pgMe').value.trim(); PREF.liUser = document.getElementById('pgLi').value.trim(); PREF.ccUser = document.getElementById('pgCc').value.trim(); savePref(); };
  document.getElementById('pgGo').onclick = () => { keep(); runPgn(PG.text); renderPgn(); };
  document.getElementById('pgPick').onclick = () => document.getElementById('pgFile').click();
  document.getElementById('pgFile').onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { keep(); PG.text = String(r.result); runPgn(PG.text); renderPgn(); }; r.readAsText(f); };
  document.getElementById('pgLiGo').onclick = () => { keep(); fetchGames('li'); };
  document.getElementById('pgCcGo').onclick = () => { keep(); fetchGames('cc'); };
  $app.querySelectorAll('[data-goline]').forEach(b => b.onclick = () => go('intro', b.dataset.goline));
  $app.querySelectorAll('[data-scan]').forEach(b => b.onclick = () => scanGame(+b.dataset.scan));
}

function tagsHtml(t) { return t && t.length ? '<div class="tags">' + t.map(x => '<span class="tag">' + esc(x) + '</span>').join('') + '</div>' : ''; }
function scoresheetHtml() {
  const L = S.line, hist = S.game.history();
  let n = hist.length, wrong = null;
  if (S.fb && (S.fb.kind === 'bad' || S.fb.kind === 'alt') && !S.fb.next) { wrong = hist[n - 1]; n--; }
  const total = S.mode === 'learn' ? L.moves.length : Math.min(L.moves.length, n + 1);
  let h = '';
  for (let i = 0; i < total; i++) {
    if (i % 2 === 0) h += '<span class="no">' + (i / 2 + 1) + '.</span>';
    const mine = ((i % 2 === 0) ? 'w' : 'b') === L.side;
    if (i < n) h += '<span class="mv' + (mine ? ' mine' : '') + '">' + esc(hist[i]) + (S.marks && S.marks[i] ? '<i class="ann g">' + S.marks[i] + '</i>' : '') + '</span>';
    else if (i === n && !S.finished && (S.waiting || wrong)) h += '<span class="mv cur">' + (wrong ? '<s>' + esc(wrong) + '</s>' : '?') + '</span>';
    else if (S.mode === 'learn') h += '<span class="mv ghost">' + esc(L.moves[i].san) + '</span>';
  }
  return '<div class="strip" id="strip" aria-label="기보">' + h + '</div>';
}

function renderPlay() {
  if (S.mode === 'spar') return renderSpar();
  const L = S.line, ups = userPlies(L);
  const doneUser = S.mode === 'review' ? S.qi : ups.filter(p => p < S.ply).length;
  const total = S.mode === 'review' ? S.queue.length : ups.length;
  const modeName = { learn: '배우기', practice: '연습', review: '복습', fork: '갈림길' }[S.mode];
  const reviewDone = S.mode === 'review' && S.qi >= S.queue.length;
  let p = '<div class="phead"><span class="label">' + (S.mode === 'review' ? '오늘의 복습' : S.mode === 'fork' ? '배운 오프닝 ' + S.pool.length + '개를 섞어서' : lineLabel(L)) + '</span>' +
    '<div class="row"><h1>' + playTitle() + '</h1><span class="stamp">' + modeName + '</span></div>' +
    '<div class="prog"><span>' + (S.mode === 'review' ? '문제 ' : '내 수 ') + doneUser + ' / ' + total + '</span><span class="track"><i style="width:' + Math.round(doneUser / total * 100) + '%"></i></span></div></div>';
  if (S.toast) p += '<div class="toast">' + esc(S.toast) + '</div>';
  let bar = '';

  if (S.finished) {
    const acc = S.stats.asked ? Math.round(S.stats.clean / S.stats.asked * 100) : null;
    p += '<div class="done"><span class="label">끝</span><h2>' + (S.mode === 'learn' ? '다 배웠어요' : S.mode === 'fork' ? '도착 · ' + esc(L.title) : '연습 완료') + '</h2><p class="outro">' + esc(L.outro) + '</p>' +
      (acc !== null ? '<div class="stat"><div><b>' + acc + '%</b><span>한 번에 맞힌 비율</span></div><div><b>' + S.stats.asked + '</b><span>물어본 수</span></div></div>' : '') +
      (L.after ? '<div><h3 class="sheet-h">' + (L.group === 'trap' ? '그다음 흐름' : '오프닝 이후 전개') + '</h3><p class="after">' + esc(L.after) + '</p><p class="legend">읽는 법 · h3 = 폰을 h3 칸으로 · Nd2 = 나이트를 d2로 · ...Be6 = 흑이 비숍을 e6로 (N 나이트, B 비숍, R 룩, Q 퀸, K 킹)</p></div>' : '') +
      (S.game.moves().length ? '<button class="btn" id="spar" type="button">이 자리에서 엔진과 이어 두기</button>' : '') + '</div>';
    bar = (S.mode === 'learn' ? '<button class="btn primary" id="toPractice" type="button">이제 직접 두기</button><button class="btn" id="again" type="button">한 번 더</button>'
      : '<button class="btn primary" id="again" type="button">' + (S.mode === 'fork' ? '다른 길로 한 번 더' : '다시 연습') + '</button>') + '<button class="btn text" id="toHome" type="button">첫 화면</button>';
  } else if (reviewDone) {
    p += '<div class="done"><span class="label">끝</span><h2>복습 끝</h2><div class="stat"><div><b>' + S.rstats.right + '/' + S.rstats.total + '</b><span>한 번에 맞힌 문제</span></div></div>' +
      '<p class="muted" style="margin:0">틀린 수는 오늘 다시 나오고, 맞힌 수는 간격을 늘려 며칠 뒤에 나와요.' + (dueCount() ? ' 오늘 복습할 수가 ' + dueCount() + '개 남았어요.' : '') + '</p></div>';
    bar = (dueCount() ? '<button class="btn primary" id="more" type="button">이어서 복습</button><button class="btn text" id="toHome" type="button">첫 화면</button>' : '<button class="btn primary" id="toHome" type="button">첫 화면으로</button>');
  } else {
    const tgl = '<div class="tgls"><button class="tgl" id="tglInfl" type="button" aria-pressed="' + PREF.infl + '">공격·수비 표시</button><button class="tgl" id="tglSnd" type="button" aria-pressed="' + PREF.snd + '">효과음</button><button class="tgl" id="tglEng" type="button" aria-pressed="' + !!PREF.eng + '">엔진 평가</button>' +
      (S.mode === 'learn' ? '<button class="tgl" id="tglAuto" type="button" aria-pressed="' + !!PREF.auto + '">상대 수 자동 진행</button>' : '') + '</div>';
    if (S.quiz) {
      const Q = S.quiz, nums = ['㉠', '㉡', '㉢', '㉣'];
      if (S.fb && S.fb.kind === 'ok') p += '<div class="annot ok"><span class="mark">' + (S.marks[S.ply - 1] || '!') + '</span><span class="who">' + esc(S.fb.head) + '</span><div class="say">' + esc(S.fb.msg) + '</div></div>';
      p += '<div class="annot quiz"><span class="mark">문</span><span class="who">' + (Q.plan ? '오프닝 이후 · 다음 계획' : '이유 고르기') + '</span><div class="ask">' + esc(Q.q) + '</div>' +
        Q.order.map((i, k) => {
          let c = 'opt';
          if (Q.picked !== null && i === Q.a) c += ' right';
          if (Q.picked === i && i !== Q.a) c += ' wrongp';
          return '<button class="' + c + '" type="button" data-opt="' + i + '"' + (Q.picked !== null ? ' disabled' : '') + '><b>' + nums[k] + '</b><span>' + esc(Q.opts[i]) + '</span></button>';
        }).join('') +
        (Q.picked !== null ? '<div class="' + (Q.picked === Q.a ? 'toast' : 'muted') + '">' + (Q.picked === Q.a ? '맞아요.' : '정답은 "' + esc(Q.opts[Q.a]) + '"예요.') + '</div>' + (Q.sched ? '<div class="sched">' + esc(Q.sched) + '</div>' : '') : '') + '</div>';
      if (Q.picked !== null) bar = '<button class="btn primary" id="' + (Q.review ? 'next' : 'quizOk') + '" type="button">' + (Q.review ? '다음 문제' : '계속') + '</button>';
    } else if (S.fb) {
      const F = S.fb, mark = F.kind === 'ok' ? (S.marks[S.ply - 1] || '!') : F.kind === 'bad' ? '?' : '!?';
      p += '<div class="annot ' + F.kind + '" role="alert"><span class="mark">' + mark + '</span><div class="head">' + esc(F.head) + '</div><div class="say">' + esc(F.msg) + '</div>' + tagsHtml(F.tags) + (F.infl || '') + (F.route ? '<div class="sched">' + esc(F.route) + '</div>' : '') + (F.sched ? '<div class="sched">' + esc(F.sched) + '</div>' : '') + (F.eng ? '<div class="sched engline" id="engFb">' + esc(F.eng) + '</div>' : '') +
        (F.hintText ? '<div class="hintline"><b>힌트 ' + F.hintStep + '/3</b><span>' + esc(F.hintText) + ' 다시 두면 판에 표시해 줄게요.</span></div>' : '') + '</div>';
      if (F.next) bar = '<button class="btn primary" id="next" type="button">다음 문제</button>';
      else if (F.kind !== 'ok') bar = '<button class="btn primary" id="retry" type="button">다시 두기</button>';
      else if (!F.auto) bar = '<button class="btn" id="cont" type="button">계속</button>';
      else bar = '<span class="muted" style="font-size:13px">상대가 두는 중…</span>';
    } else if (S.coach) {
      const C = S.coach;
      p += '<div class="annot"><span class="mark" style="color:var(--pen)">' + (C.ask ? '?' : '…') + '</span><span class="who">' + esc(C.who || '') + '</span>' +
        (C.ask ? '<div class="ask">' + esc(C.ask) + '</div>' : C.wait ? '<div class="ask">상대는 왜 이렇게 뒀을까요?</div>' : '') +
        (C.say ? '<div class="say">' + esc(C.say) + '</div>' : '') + tagsHtml(C.tags) + (C.infl || '') + '</div>';
    } else if (S.busy) {
      p += '<div class="annot"><span class="mark">…</span><span class="who">상대 차례</span><div class="say muted">상대가 두는 중…</div></div>';
    }
    p += tgl;
    if (S.pause && !S.fb && !S.quiz) bar = '<button class="btn primary" id="oppOk" type="button">계속</button>';
    if (S.waiting && !S.fb && !S.quiz) {
      const hp = S.hintStep;
      if (hp) p += '<div class="hintline"><b>힌트 ' + hp + '/3</b><span>' + esc(hintText(hp)) + '</span></div>';
      bar = (S.mode !== 'learn' ? '<button class="btn" id="hint" type="button"' + (hp >= 3 ? ' disabled' : '') + '>힌트</button>' : '') +
        (S.mode !== 'review' ? '<button class="btn text" id="backOne" type="button"' + (S.ply < 2 ? ' disabled' : '') + '>한 수 뒤로</button><button class="btn text" id="restart" type="button">처음부터</button>'
          : '<button class="btn text" id="skip" type="button">정답 보고 넘기기</button>');
    } else if (!bar && S.busy) bar = '<span class="muted" style="font-size:13px">상대가 두는 중…</span>';
  }
  if (bar) p += '<div class="controls bar">' + bar + '</div>';

  const turnTxt = S.game.turn() === 'w' ? '백' : '흑';
  const mhead = '<div class="mhead"><button class="mback" id="mback" type="button" aria-label="뒤로">←</button><b>' + playTitle() + '</b><span class="stamp">' + modeName + '</span>' +
    '<span class="cnt">' + doneUser + '/' + total + '</span><span class="track"><i style="width:' + Math.round(doneUser / total * 100) + '%"></i></span></div>';
  $app.innerHTML = '<div class="play-wrap">' + mhead + '<button class="back" id="back" type="button">← ' + (S.mode === 'review' ? '첫 화면' : S.mode === 'fork' ? '나가기' : esc(L.title) + ' 소개') + '</button>' +
    '<div class="play"><div class="boardcol"><div class="turn"><span><b>' + (S.game.turn() === 'w' ? '○' : '●') + ' ' + turnTxt + ' 차례</b>' + (S.waiting && isUserTurn() ? ' · 내 차례' : '') + '</span><span>' + (L.side === 'w' ? '나: 백' : '나: 흑') + '</span></div>' +
    (reviewDone ? '' : evbarHtml()) + diagramHtml('board', L.side, false) + (reviewDone ? '' : scoresheetHtml()) + '</div><div class="sheetcol" aria-live="polite">' + p + '</div></div></div>';
  const stripEl = document.getElementById('strip');
  if (stripEl) { const c = stripEl.querySelector('.cur, .ghost') || stripEl.lastElementChild; if (c) stripEl.scrollLeft = c.offsetLeft - stripEl.clientWidth / 2; }
  renderBoardOnly();
  bindBoard();
  engTick();
  const on = (id, fn) => { const e = document.getElementById(id); if (e) e.onclick = fn; };
  on('spar', startSpar);
  on('tglEng', () => { PREF.eng = !PREF.eng; savePref(); render(); });
  on('back', () => { clearTimeout(S.autoAdvance); S.mode === 'review' ? go('home') : S.mode === 'fork' ? (S.forkFirst ? go('first', S.forkFirst) : go('home')) : go('intro', L.id); });
  on('mback', () => document.getElementById('back').click());
  on('retry', retry);
  on('tglInfl', () => { PREF.infl = !PREF.infl; savePref(); render(); });
  on('oppOk', contOpp);
  on('tglAuto', () => { PREF.auto = !PREF.auto; savePref(); if (PREF.auto && S.pause) contOpp(); else render(); });
  on('tglSnd', () => { PREF.snd = !PREF.snd; savePref(); if (PREF.snd) snd('ok'); render(); });
  on('hint', hint);
  on('backOne', backOne);
  on('restart', restart);
  on('again', () => S.mode === 'fork' ? startFork(S.forkSide, S.forkFirst) : startLine(L.id, S.mode));
  on('toPractice', () => startLine(L.id, 'practice'));
  on('toHome', () => go('home'));
  on('more', () => { homeQueue = null; startReview(); });
  on('cont', () => { if (S.busy) return; clearTimeout(S.autoAdvance); S.fb.auto = true; render(); step(); });
  on('quizOk', () => { S.quiz = null; S.fb = null; step(); });
  on('next', () => { S.qi++; if (S.qi >= S.queue.length) { homeQueue = null; render(); } else loadReviewItem(); });
  on('skip', () => {
    const it = S.item, m = L.moves[S.ply];
    addMiss(it.id, it.ply); setLv(it.id, it.ply, 1); sched(it.id, it.ply, false);
    const r = S.game.move(m.san); S.last = r; movedInfo(r); S.waiting = false;
    S.fb = { kind: 'alt', head: '정답 · ' + m.san, msg: m.note, tags: m.tags, next: true, infl: inflHtml(influence(S.game, S.focus), S.game) };
    render();
  });
  $app.querySelectorAll('[data-opt]').forEach(b => b.onclick = () => pickQuiz(+b.dataset.opt));
}

/* ---------- 체스 엔진(Stockfish): 평가 막대, 내 수와 배운 수 비교, 오프닝 뒤 이어 두기 ---------- */
const uciOf = g => g.history({ verbose: true }).map(m => m.from + m.to + (m.promotion || ''));
// 엔진 점수(둘 차례 기준) → 백 기준 센티폰. 메이트는 ±10000 근처로 바꿔요.
const evNum = (o, turn) => { const v = o.mate !== null ? (o.mate > 0 ? 1 : -1) * (10000 - Math.abs(o.mate)) : (o.cp || 0); return turn === 'w' ? v : -v; };
const evText = v => Math.abs(v) > 9000 ? (v > 0 ? '+' : '−') + '메이트 ' + (10000 - Math.abs(v)) : (v >= 0 ? '+' : '−') + (Math.abs(v) / 100).toFixed(1);
const evWord = mv => { const a = Math.abs(mv); return a < 30 ? '비슷해요' : '내가 ' + (a < 100 ? '조금 ' : a < 300 ? '' : '크게 ') + (mv > 0 ? '유리해요' : '불리해요'); };
const engErr = e => e && e.message === 'file' ? '엔진은 설치한 앱(인터넷 주소로 연 앱)에서만 돼요. 파일을 직접 열면 쓸 수 없어요.' : '엔진을 불러오지 못했어요. 처음 한 번은 인터넷이 필요해요.';
const EV = {};
function evalPos(moves, turn) {
  const k = moves.join(' ');
  if (!EV[k]) { EV[k] = SF.go(moves, { movetime: 400 }).then(o => ({ v: evNum(o, turn), best: o.best })); EV[k].catch(() => { delete EV[k]; }); }
  return EV[k];
}
function evbarHtml() {
  return PREF.eng ? '<div class="evbar" id="evbar"><span class="evtrack"><i></i></span><b>…</b><span class="evw">엔진이 보는 중</span></div>' : '';
}
function engTick() { // 지금 판의 엔진 평가를 막대에 그려요
  const el = document.getElementById('evbar'); if (!el || !S || !S.game) return;
  const me = S, moves = uciOf(S.game), k = moves.join(' '), side = S.line.side;
  const paint = (num, word, pct) => { el.querySelector('b').textContent = num; el.querySelector('.evw').textContent = word; if (pct !== null) el.querySelector('i').style.width = pct + '%'; };
  if (!S.game.moves().length) return paint('', S.game.in_checkmate() ? '체크메이트' : '둘 수가 없어요', S.game.in_checkmate() ? (S.game.turn() === 'w' ? 0 : 100) : 50);
  evalPos(moves, S.game.turn()).then(r => {
    if (S !== me || !el.isConnected || uciOf(S.game).join(' ') !== k) return;
    const mv = side === 'w' ? r.v : -r.v;
    paint(evText(mv), evWord(mv), Math.round(100 / (1 + Math.exp(-r.v / 220))));
  }, e => { if (el.isConnected) paint('', engErr(e), null); });
}
function engCompare(r, bookSan) { // 틀린 수(또는 다른 좋은 수)를 둔 직후: 배운 수와 엔진 평가를 비교해요
  if (!PREF.eng) return;
  const fb = S.fb, me = S, s = S.line.side === 'w' ? 1 : -1, mine = uciOf(S.game), turn = S.game.turn();
  S.game.undo();
  const bk = S.game.moves({ verbose: true }).find(x => strip(x.san) === strip(bookSan));
  S.game.move({ from: r.from, to: r.to, promotion: 'q' });
  if (!bk) return;
  fb.eng = '엔진이 배운 수와 비교하는 중…';
  Promise.all([evalPos(mine, turn), evalPos(mine.slice(0, -1).concat(bk.from + bk.to + (bk.promotion || '')), turn)]).then(a => {
    const ma = a[0].v * s, mb = a[1].v * s, d = mb - ma;
    fb.eng = '엔진 평가 · 내 수 ' + evText(ma) + ' / 배운 수 ' + evText(mb) + ' → ' +
      (d >= 150 ? '실제로도 많이 손해예요.' : d >= 50 ? '조금 손해예요.' : d > -50 ? '엔진이 보기엔 비슷한 수예요.' : '엔진은 이 수를 더 좋게 봐요.');
  }, e => { fb.eng = engErr(e); }).then(() => {
    const el = document.getElementById('engFb');
    if (S === me && S.fb === fb && el) el.textContent = fb.eng;
  });
}
const SPAR_LV = [{ n: '쉬움', skill: 0, depth: 1 }, { n: '보통', skill: 3, depth: 5 }, { n: '강함', skill: 9, depth: 9 }, { n: '최강', skill: 20, movetime: 700 }];
const sparLv = () => SPAR_LV[PREF.sfLv] ? PREF.sfLv : 1;
function startSpar() { // 오프닝이 끝난 자리에서 엔진을 상대로 계속 둬요. 기록(숙련도·복습)에는 영향이 없어요.
  clearTimeout(S.autoAdvance);
  Object.assign(S, { mode: 'spar', finished: false, fb: null, quiz: null, coach: null, arrow: null, bad: null, sel: null, targets: null, hintStep: 0,
    pause: false, busy: false, waiting: false, toast: '', bookLen: S.game.history().length, sp: { over: '', err: '' } });
  window.scrollTo(0, 0);
  sparStep();
}
function sparOver() {
  const g = S.game; if (g.moves().length) return '';
  return g.in_checkmate() ? (isUserTurn() ? '체크메이트. 이번에는 엔진이 이겼어요.' : '체크메이트! 내가 이겼어요.') : '둘 수가 없어서 비겼어요(스테일메이트).';
}
async function sparStep() {
  const me = S; S.sp.err = ''; S.sp.over = sparOver();
  if (S.sp.over) { S.waiting = false; S.busy = false; snd('done'); return render(); }
  if (isUserTurn()) { S.waiting = true; S.busy = false; return render(); }
  S.waiting = false; S.busy = true; render();
  try {
    const got = await Promise.all([SF.go(uciOf(S.game), SPAR_LV[sparLv()]), delay(450)]), b = got[0].best;
    if (S !== me || S.mode !== 'spar') return;
    const mv = b && S.game.move({ from: b.slice(0, 2), to: b.slice(2, 4), promotion: b[4] || 'q' });
    if (!mv) throw new Error('move');
    S.last = mv; movedInfo(mv); S.arrow = null; snd(mv.captured ? 'cap' : 'move');
  } catch (e) { if (S !== me) return; S.busy = false; S.sp.err = engErr(e); return render(); }
  sparStep();
}
function sparMove(from, to) {
  const r = S.game.move({ from, to, promotion: 'q' }); S.sel = null; S.targets = null;
  if (!r) { renderBoardOnly(); return; }
  S.last = r; movedInfo(r); S.arrow = null; S.waiting = false; snd(r.captured ? 'cap' : 'move');
  sparStep();
}
function sparUndo() {
  if (S.busy) return;
  do { if (S.game.history().length <= S.bookLen) break; S.game.undo(); } while (!isUserTurn());
  const h = S.game.history({ verbose: true }); S.last = h.length ? h[h.length - 1] : null;
  S.focus = S.last ? S.last.to : null; S.arrow = null; S.sel = null; S.targets = null;
  sparStep();
}
function sparHint() {
  if (!S.waiting) return;
  const me = S, k = uciOf(S.game).join(' ');
  evalPos(uciOf(S.game), S.game.turn()).then(r => {
    if (S !== me || !r.best || uciOf(S.game).join(' ') !== k) return;
    S.arrow = { from: r.best.slice(0, 2), to: r.best.slice(2, 4) }; renderBoardOnly();
  }, e => { if (S === me) { S.sp.err = engErr(e); render(); } });
}
function renderSpar() {
  const L = S.line, lv = sparLv(), over = S.sp.over;
  let strip_ = '';
  S.game.history().forEach((san, i) => {
    if (i % 2 === 0) strip_ += '<span class="no">' + (i / 2 + 1) + '.</span>';
    strip_ += '<span class="mv' + (((i % 2 === 0) ? 'w' : 'b') === L.side ? ' mine' : '') + (i < S.bookLen ? ' ghost' : '') + '">' + esc(san) + '</span>';
  });
  let p = '<div class="phead"><span class="label">' + esc(L.title) + ' · 오프닝 이후</span><div class="row"><h1>엔진과 이어 두기</h1><span class="stamp">실전</span></div></div>' +
    '<div class="annot' + (over ? ' ok' : '') + '"><span class="mark" style="color:var(--pen)">' + (over ? '끝' : S.busy ? '…' : '?') + '</span><span class="who">Stockfish · ' + SPAR_LV[lv].n + '</span>' +
    '<div class="ask">' + esc(S.sp.err || over || (S.busy ? '엔진이 생각하는 중…' : '내 차례예요. 오프닝에서 세운 계획대로 둬 보세요.')) + '</div>' +
    (L.after && !over ? '<div class="say">' + esc(L.after) + '</div>' : '') + '<div class="sched">여기서 두는 수는 복습 기록에 들어가지 않아요.</div></div>' +
    '<div class="lvsel" role="group" aria-label="엔진 세기">' + SPAR_LV.map((x, i) => '<button type="button" data-lv="' + i + '" aria-pressed="' + (i === lv) + '">' + x.n + '</button>').join('') + '</div>' +
    '<div class="tgls"><button class="tgl" id="tglEng" type="button" aria-pressed="' + !!PREF.eng + '">엔진 평가</button><button class="tgl" id="tglSnd" type="button" aria-pressed="' + PREF.snd + '">효과음</button></div>' +
    '<div class="controls bar">' + (over ? '<button class="btn primary" id="again" type="button">오프닝 다시 연습</button>' : '<button class="btn" id="spHint" type="button"' + (S.waiting ? '' : ' disabled') + '>추천 수</button>') +
    '<button class="btn text" id="spUndo" type="button"' + (S.busy || S.game.history().length <= S.bookLen ? ' disabled' : '') + '>한 수 무르기</button><button class="btn text" id="back2" type="button">그만하기</button></div>';
  $app.innerHTML = '<div class="play-wrap"><div class="mhead"><button class="mback" id="mback" type="button" aria-label="뒤로">←</button><b>' + esc(L.title) + '</b><span class="stamp">실전</span></div>' +
    '<button class="back" id="back" type="button">← ' + esc(L.title) + ' 소개</button>' +
    '<div class="play"><div class="boardcol"><div class="turn"><span><b>' + (S.game.turn() === 'w' ? '○ 백' : '● 흑') + ' 차례</b>' + (S.waiting ? ' · 내 차례' : '') + '</span><span>' + (L.side === 'w' ? '나: 백' : '나: 흑') + '</span></div>' +
    evbarHtml() + diagramHtml('board', L.side, false) + '<div class="strip" id="strip" aria-label="기보">' + strip_ + '</div></div><div class="sheetcol" aria-live="polite">' + p + '</div></div></div>';
  const st = document.getElementById('strip'); st.scrollLeft = st.scrollWidth;
  renderBoardOnly(); bindBoard(); engTick();
  const on = (id, fn) => { const e = document.getElementById(id); if (e) e.onclick = fn; };
  on('back', () => go('intro', L.id)); on('mback', () => go('intro', L.id)); on('back2', () => go('intro', L.id));
  on('again', () => startLine(L.id, 'practice'));
  on('spHint', sparHint); on('spUndo', sparUndo);
  on('tglEng', () => { PREF.eng = !PREF.eng; savePref(); render(); });
  on('tglSnd', () => { PREF.snd = !PREF.snd; savePref(); if (PREF.snd) snd('ok'); render(); });
  $app.querySelectorAll('[data-lv]').forEach(b => b.onclick = () => { PREF.sfLv = +b.dataset.lv; savePref(); render(); });
}

/* ---------- play session ---------- */
function newSession(base) {
  return Object.assign({ game: new Chess(), ply: 0, sel: null, targets: null, hintStep: 0, firstTry: true, usedHint: false,
    waiting: false, busy: false, pause: false, fb: null, coach: null, last: null, arrow: null, bad: null, quiz: null, finished: false,
    stats: { asked: 0, clean: 0 }, toast: '', marks: {} }, base);
}
function startLine(id, mode) {
  const L = byId(id);
  S = newSession({ line: L, mode });
  view = 'play';
  if (mode === 'practice') {
    const ups = userPlies(L);
    const firstWeak = ups.find(p => lvOf(L.id, p) < 2);
    S.autoUntil = firstWeak === undefined ? 0 : firstWeak; // all mastered → ask everything
    const skipped = ups.filter(p => p < S.autoUntil).length;
    if (skipped) S.toast = '익힌 수 ' + skipped + '개는 자동으로 뒀어요. 약한 수부터 물어볼게요.';
  }
  render(); window.scrollTo(0, 0);
  step();
}
/* ---------- 갈림길 연습: 배운 오프닝들을 한 나무로 묶어, 상대가 고르는 길에 맞춰 둬요 ---------- */
function forkPool(side, first) { return LINES.filter(l => P.learned[l.id] && l.side === side && (!first || firstKey(l) === first)); }
function forkOptions() { // 지금 자리에서 후보 오프닝들이 두는 수 → 그 수를 두는 오프닝들
  const o = {};
  for (const l of S.cands) { const m = l.moves[S.ply]; if (m) (o[strip(m.san)] = o[strip(m.san)] || []).push(l); }
  return o;
}
function forkNarrow(san) { const o = forkOptions()[strip(san)]; if (!o) return false; S.cands = o; S.line = o[0]; return true; }
function forkSync() { // 기보에 맞는 후보를 다시 계산해요(한 수 뒤로 갈 때)
  const h = S.game.history().map(strip);
  S.cands = S.pool.filter(l => h.every((x, i) => l.moves[i] && strip(l.moves[i].san) === x));
  if (!S.cands.length) S.cands = S.pool.slice();
  S.line = S.cands[0];
}
function startFork(side, first) {
  const pool = forkPool(side, first);
  if (pool.length < 2) return;
  S = newSession({ mode: 'fork', pool, cands: pool.slice(), line: pool[0], forkSide: side, forkFirst: first || null, forked: 0 });
  view = 'play'; render(); window.scrollTo(0, 0); step();
}
function playTitle() {
  if (S.mode === 'review') return '복습';
  if (S.mode === 'fork' && S.cands.length > 1 && !S.finished) return '갈림길 연습';
  return esc(S.line.title);
}
function startReview(early) {
  const q = early ? buildQueue(true) : (homeQueue && homeQueue.length ? homeQueue : buildQueue());
  if (!q.length) return;
  S = newSession({ mode: 'review', queue: q, qi: 0, rstats: { right: 0, total: q.length } });
  view = 'play';
  loadReviewItem();
}
function loadReviewItem() {
  const it = S.queue[S.qi];
  const L = byId(it.id);
  Object.assign(S, newSession({ mode: 'review', queue: S.queue, qi: S.qi, rstats: S.rstats, line: L, item: it }));
  for (let i = 0; i < it.ply; i++) S.last = S.game.move(L.moves[i].san);
  S.ply = it.ply;
  S.focus = S.last ? S.last.to : null;
  if (it.type === 'why') {
    const m = L.moves[it.ply];
    S.last = S.game.move(m.san); movedInfo(S.last);
    S.quiz = makeQuiz(m.why, true);
    S.coach = { who: L.title + ' · ' + moveLabel(L, it.ply), ask: m.why.q };
  } else {
    const prev = it.ply > 0 ? L.moves[it.ply - 1] : null;
    S.coach = { who: L.title + ' · ' + (Math.floor(it.ply / 2) + 1) + '수째, ' + (L.side === 'w' ? '백' : '흑') + ' 차례', ask: '이 자리, 다음 수는?', say: prev ? '직전 수 ' + moveLabel(L, it.ply - 1) + ': ' + prev.note : '', infl: prev ? inflHtml(influence(S.game, S.focus), S.game) : '' };
    S.waiting = true;
  }
  render(); window.scrollTo(0, 0);
}
function makeQuiz(why, review) {
  const order = why.opts.map((t, i) => i).sort(() => Math.random() - .5);
  return { q: why.q, order, opts: why.opts, a: why.a, picked: null, review };
}
const isUserTurn = () => S.game.turn() === S.line.side;

async function step() {
  const me = S;
  while (S.ply < S.line.moves.length && S.mode !== 'review') {
    if (S.mode === 'fork' && !isUserTurn()) { // 상대가 갈 길을 고른다
      const o = forkOptions(), keys = Object.keys(o), k = keys[Math.floor(Math.random() * keys.length)];
      S.forked = keys.length > 1 ? keys.length : 0; S.cands = o[k]; S.line = o[k][0];
    }
    const L = S.line, m = L.moves[S.ply];
    if (!isUserTurn()) {
      S.waiting = false; S.busy = true; render();
      await delay(S.ply < (S.autoUntil || 0) ? 220 : 520);
      if (S !== me) return;
      S.last = S.game.move(m.san); movedInfo(S.last); S.fb = null; snd(S.last.captured ? 'cap' : 'move');
      S.coach = { who: '상대 수 · ' + moveLabel(L, S.ply) + (S.mode === 'fork' && S.forked ? ' · ' + S.forked + '갈래 중 하나' : ''), say: m.note, infl: inflHtml(influence(S.game, S.focus), S.game) };
      S.ply++; S.busy = false;
      // 배우기: 상대가 왜 그렇게 뒀는지 읽을 시간을 줘요. '상대 수 자동 진행'을 켜면 바로 넘어가요.
      if (S.mode === 'learn' && !PREF.auto && m.note) { S.coach.wait = true; S.pause = true; render(); return; }
      continue;
    }
    if (S.mode === 'practice' && S.ply < (S.autoUntil || 0)) {
      S.busy = true; render();
      await delay(220);
      if (S !== me) return;
      S.last = S.game.move(m.san); movedInfo(S.last); S.ply++; S.busy = false;
      continue;
    }
    // wait for the user
    S.fb = null;
    S.hintStep = 0; S.firstTry = true; S.usedHint = false; S.sel = null; S.targets = null; S.bad = null;
    S.arrow = S.mode === 'learn' ? sanToFromTo(m.san) : null;
    const prevNote = S.coach && S.coach.say, prevInfl = (S.coach && S.coach.infl) || '';
    S.coach = S.mode === 'learn'
      ? { who: '배우기 · ' + moveLabel(L, S.ply), ask: '화살표대로 ' + eul(m.san) + ' 둬요', say: m.note, tags: m.tags, infl: prevInfl }
      : { who: prevNote ? S.coach.who : '시작', infl: prevNote ? S.coach.infl : '', say: prevNote || (L.side === 'w' ? '백이 먼저 둬요.' : ''), ask: (S.ply === 0 ? '첫 수는?' : '다음 수는?') + (S.mode === 'fork' && Object.keys(forkOptions()).length > 1 ? ' 배운 수가 ' + Object.keys(forkOptions()).length + '가지 있어요' : '') };
    S.waiting = true;
    render();
    return;
  }
  if (S.mode !== 'review' && S.ply >= S.line.moves.length) finishLine();
}
function contOpp() { if (!S || !S.pause) return; S.pause = false; step(); }
function movedInfo(r) {
  const anim = [{ from: r.from, to: r.to }]; let focus = r.to;
  if (/[kq]/.test(r.flags)) {
    const rank = r.color === 'w' ? '1' : '8', rf = r.flags.includes('k') ? ['h', 'f'] : ['a', 'd'];
    anim.push({ from: rf[0] + rank, to: rf[1] + rank }); focus = rf[1] + rank;
  }
  S.anim = anim; S.focus = focus;
}
function sanToFromTo(san) {
  const mv = S.game.moves({ verbose: true }).find(x => strip(x.san) === strip(san));
  return mv ? { from: mv.from, to: mv.to } : null;
}
function finishLine() {
  const L = S.line;
  if (L.plan && !S.planDone && S.mode !== 'review') { // 끝나기 전에 '오프닝 이후' 계획을 하나 물어요
    S.planDone = true; S.waiting = false; S.fb = null; S.coach = null; S.arrow = null;
    S.quiz = makeQuiz(L.plan, false); S.quiz.plan = true; render(); return;
  }
  S.finished = true; S.waiting = false;
  if (S.mode === 'learn') {
    P.learned[L.id] = true;
    for (const p of userPlies(L)) if (lvOf(L.id, p) < 1) setLv(L.id, p, 1);
  }
  P.done[L.id] = (P.done[L.id] || 0) + 1; initSched(); save(); homeQueue = null; setTimeout(() => snd('done'), 250);
  render();
}

function onSquare(sq) {
  if (!S || !S.waiting || S.busy || S.fb || S.quiz) return;
  const p = S.game.get(sq);
  if (S.sel && S.targets && S.targets.includes(sq)) { attempt(S.sel, sq); return; }
  if (p && p.color === S.game.turn()) {
    S.sel = sq; S.targets = S.game.moves({ square: sq, verbose: true }).map(m => m.to);
  } else { S.sel = null; S.targets = null; }
  renderBoardOnly();
}
function attempt(from, to) {
  if (S.mode === 'spar') return sparMove(from, to);
  const L = S.line, m = L.moves[S.ply];
  const r = S.game.move({ from, to, promotion: 'q' });
  S.sel = null; S.targets = null;
  if (!r) { renderBoardOnly(); return; }
  const san = strip(r.san), key = strip(m.san);
  if (S.mode === 'fork' && forkOptions()[san]) { forkNarrow(san); return onCorrect(r); } // 배운 다른 오프닝의 수도 정답
  if (san === key) return onCorrect(r);
  // not the line move: show it, explain, then take back
  S.last = { from: r.from, to: r.to }; S.anim = [{ from: r.from, to: r.to }]; S.focus = null;
  const altMsg = m.alt && Object.keys(m.alt).find(k => strip(k) === san);
  const wrongMsg = m.wrong && Object.keys(m.wrong).find(k => strip(k) === san);
  if (altMsg) {
    S.fb = { kind: 'alt', head: '좋은 수예요 · ' + r.san, msg: m.alt[altMsg] }; snd(r.captured ? 'cap' : 'move');
  } else {
    S.fb = { kind: 'bad', head: '이 라인의 수가 아니에요 · ' + r.san, msg: wrongMsg ? m.wrong[wrongMsg] : (m.wrongDefault || '실전에서는 둘 수 있는 수지만, 이 오프닝의 계획과는 달라요.') };
    S.bad = [r.to]; snd(r.captured ? 'cap' : 'move');
    if (S.mode !== 'learn') {
      S.game.undo(); // compute hint on the position before the wrong move
      const hs = Math.min(3, S.hintStep + 1);
      S.fb.hintStep = hs; S.fb.hintText = hintText(hs);
      S.game.move({ from: r.from, to: r.to, promotion: 'q' });
    } else S.fb.msg += ' 화살표를 따라 둬 보세요.';
    if (S.firstTry && S.mode !== 'learn') { addMiss(L.id, S.ply); if (lvOf(L.id, S.ply) > 1) setLv(L.id, S.ply, 1); sched(L.id, S.ply, false); }
    S.firstTry = false;
  }
  engCompare(r, m.san);
  render();
}
function retry() {
  if (S.fb && S.fb.hintStep) { S.hintStep = S.fb.hintStep; S.usedHint = true; }
  S.game.undo(); S.fb = null; S.bad = null;
  const h = S.game.history({ verbose: true }); S.last = h.length ? h[h.length - 1] : null;
  S.focus = S.last ? S.last.to : null;
  render();
}
function onCorrect(r) {
  const L = S.line, m = L.moves[S.ply], ply = S.ply;
  S.last = r; movedInfo(r); S.arrow = null; S.waiting = false; S.bad = null; S.hintStep = 0; snd(r.captured ? 'cap' : 'move');
  const before = lvOf(L.id, ply);
  if (S.mode !== 'learn') {
    S.stats.asked++;
    if (S.firstTry && !S.usedHint) { S.stats.clean++; setLv(L.id, ply, before + 1); S.marks[ply] = (m.tags || []).includes('함정') ? '!!' : '!'; }
  }
  S.fb = { kind: 'ok', head: S.firstTry && !S.usedHint ? '정답 · ' + r.san : '맞아요 · ' + r.san, msg: m.note, tags: m.tags, infl: inflHtml(influence(S.game, S.focus), S.game) };
  if (S.mode !== 'learn') {
    const cleanTry = S.firstTry && !S.usedHint, days = sched(L.id, ply, cleanTry);
    if (P.learned[L.id]) S.fb.sched = cleanTry ? '다음 복습 · ' + dayLabel(days) : '다음 복습 · 오늘 한 번 더';
  }
  if (S.mode === 'fork') S.fb.route = S.cands.length === 1 ? '이 길은 ' + L.title : '아직 ' + S.cands.length + '가지 오프닝이 가능해요: ' + S.cands.slice(0, 3).map(l => l.title).join(', ') + (S.cands.length > 3 ? ' 외' : '');
  bump();
  if (S.mode === 'review') {
    if (S.firstTry && !S.usedHint) S.rstats.right++;
    S.fb.next = true; render(); return;
  }
  if (S.mode === 'practice' && m.why && before >= 1 && Math.random() < .4) {
    S.quiz = makeQuiz(m.why, false);
  }
  S.ply++;
  render();
  if (!S.quiz) { S.autoAdvance = setTimeout(() => { if (S && S.fb && S.fb.kind === 'ok' && !S.quiz && !S.busy) { S.fb.auto = true; step(); } }, S.mode === 'learn' ? 2800 : 2300); }
}
function pickQuiz(i) {
  const Q = S.quiz; if (Q.picked !== null) return;
  Q.picked = i;
  const right = i === Q.a; snd(right ? 'ok' : 'bad'); bump();
  if (Q.review) {
    const it = S.item;
    if (right) S.rstats.right++; else { addMiss(it.id, it.ply); setLv(it.id, it.ply, lvOf(it.id, it.ply) - 1); }
    Q.sched = '다음 복습 · ' + (right ? dayLabel(sched(it.id, it.ply, true)) : (sched(it.id, it.ply, false), '오늘 한 번 더'));
  }
  render();
}
function hint() {
  if (!S.waiting || S.fb || S.quiz) return;
  const m = S.line.moves[S.ply], ft = sanToFromTo(m.san);
  if (!ft) return;
  S.hintStep = Math.min(3, S.hintStep + 1); S.usedHint = true;
  render();
}
function backOne() {
  if (S.busy || S.mode === 'review') return;
  clearTimeout(S.autoAdvance);
  S.fb = null; S.quiz = null; S.finished = false; S.autoUntil = 0;
  // go back to the previous user move
  let n = 0;
  do { if (!S.game.undo()) break; S.ply--; n++; } while (S.ply > 0 && !isUserTurn());
  if (!isUserTurn() && S.ply === 0) {} // at start with opponent to move
  const h = S.game.history({ verbose: true }); S.last = h.length ? h[h.length - 1] : null;
  S.focus = S.last ? S.last.to : null;
  S.coach = null;
  if (S.mode === 'fork') forkSync();
  step();
  render();
}
function restart() { clearTimeout(S.autoAdvance); if (S.mode === 'fork') return startFork(S.forkSide, S.forkFirst); startLine(S.line.id, S.mode === 'learn' ? 'learn' : 'practice'); }

function hintText(step) {
  const m = S.line.moves[S.ply], ft = sanToFromTo(m.san);
  if (step === 1) {
    if (m.hint) return m.hint;
    const pc = ft && S.game.get(ft.from);
    return pc ? ft.from + ' ' + PNAME[pc.type] + (pc.type === 'n' ? '를' : '을') + ' 움직여 보세요.' : '표시된 기물을 움직여 보세요.';
  }
  if (step === 2) return '도착 칸은 표시된 곳 근처예요.';
  return '정답은 ' + m.san + '예요. 화살표대로 둬 보세요.';
}
function hintParts() {
  if (!S.hintStep || !S.waiting) return {};
  const m = S.line.moves[S.ply], ft = sanToFromTo(m.san);
  if (!ft) return {};
  const o = {};
  if (S.hintStep >= 1) o.hint = [ft.from];
  if (S.hintStep >= 2) {
    const f = FILES.indexOf(ft.to[0]), r = +ft.to[1];
    o.near = [];
    for (let df = -1; df <= 1; df++) for (let dr = -1; dr <= 1; dr++) { const ff = f + df, rr = r + dr; if (ff >= 0 && ff < 8 && rr >= 1 && rr <= 8) o.near.push(FILES[ff] + rr); }
  }
  if (S.hintStep >= 3) o.arrow = ft;
  return o;
}
function renderBoardOnly() {
  const el = document.getElementById('board'); if (!el) return;
  const hp = hintParts(), orient = S.line.side, anim = S.anim; S.anim = null;
  const showInfl = PREF.infl && S.focus && !S.sel && !(S.fb && S.fb.kind === 'bad');
  drawBoard(el, S.game, { orient, last: S.last, sel: S.sel, targets: S.targets, hint: hp.hint, near: hp.near, bad: S.bad, arrow: hp.arrow || S.arrow,
    infl: showInfl ? influence(S.game, S.focus) : null, fresh: !!anim, land: anim ? [anim[0].to] : null,
    badge: S.fb && S.last && S.last.to && !S.quiz && (S.fb.kind === 'ok' || ((S.fb.kind === 'bad' || S.fb.kind === 'alt') && !S.fb.next)) ? { sq: S.last.to, kind: S.fb.kind } : null });
  if (anim) {
    const size = el.clientWidth / 8;
    for (const a of anim) {
      const pe = el.querySelector('[data-sq="' + a.to + '"] .pc'); if (!pe) continue;
      const A = sqXY(a.from, orient), B = sqXY(a.to, orient);
      pe.classList.add('moving');
      pe.style.transition = 'none';
      pe.style.transform = 'translate(' + (A.x - B.x) * size + 'px,' + (A.y - B.y) * size + 'px)';
      pe.getBoundingClientRect();
      pe.style.transition = 'transform .28s cubic-bezier(.2,.75,.3,1)';
      pe.style.transform = 'translate(0,0)';
    }
  }
}
/* tap or drag to move */
function bindBoard() {
  const wrap = document.getElementById('board'); if (!wrap) return;
  let drag = null;
  const sqAt = (x, y) => { const el = document.elementFromPoint(x, y); const s = el && el.closest('#board [data-sq]'); return s ? s.dataset.sq : null; };
  const endDrag = () => { if (!drag) return; drag.ghost.remove(); const src = wrap.querySelector('[data-sq="' + drag.from + '"] .pc'); if (src) src.classList.remove('lifted'); drag = null; };
  const place = e => { const g = drag.size * 1.25, lift = e.pointerType === 'touch' ? drag.size * .55 : 0; drag.ghost.style.transform = 'translate(' + (e.clientX - g / 2) + 'px,' + (e.clientY - g / 2 - lift) + 'px)'; };
  wrap.onpointerdown = e => {
    const sq = sqAt(e.clientX, e.clientY); if (!sq) return;
    endDrag();
    if (S && S.pause) { contOpp(); return; }
    let from = null;
    if (S && S.waiting && !S.fb && !S.quiz && !(S.sel && S.targets && S.targets.includes(sq))) {
      const p = S.game.get(sq); if (p && p.color === S.game.turn()) from = sq;
    }
    onSquare(sq);
    if (!from || S.sel !== from) return;
    const src = wrap.querySelector('[data-sq="' + from + '"] .pc'); if (!src) return;
    const size = wrap.clientWidth / 8, ghost = src.cloneNode(true);
    ghost.classList.add('dragging'); ghost.style.width = ghost.style.height = size * 1.25 + 'px'; ghost.style.display = 'none';
    document.body.appendChild(ghost);
    drag = { from, ghost, size, x0: e.clientX, y0: e.clientY, moved: false };
    try { wrap.setPointerCapture(e.pointerId); } catch (err) {}
  };
  wrap.onpointermove = e => {
    if (!drag) return;
    if (!drag.moved) {
      if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 6) return;
      drag.moved = true; drag.ghost.style.display = 'block';
      const src = wrap.querySelector('[data-sq="' + drag.from + '"] .pc'); if (src) src.classList.add('lifted');
    }
    place(e);
  };
  wrap.onpointerup = e => {
    if (!drag) return;
    const from = drag.from, moved = drag.moved; endDrag();
    if (!moved) return;
    const sq = sqAt(e.clientX, e.clientY);
    if (sq && sq !== from && S.sel === from && S.targets && S.targets.includes(sq)) attempt(from, sq);
  };
  wrap.onpointercancel = endDrag;
}

initSched();
go('home');
initCloud();
// 웹에 올렸을 때만: 오프라인 캐시(서비스 워커) 등록, 저장 기록을 브라우저가 지우지 않게 요청
if (/^https?:$/.test(location.protocol)) {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
}
})();
