// 사자성어 데이터 검증: node tools/validate.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const dir = path.join(__dirname, '..', 'data');
const ctx = { window: {} }; vm.createContext(ctx);
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort())
  vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename: f });
const list = ctx.window.IDIOMS, cats = 'LSRPTGCJ';
// 두음법칙 대응
const B = c => { const code = c.charCodeAt(0) - 0xAC00; if (code < 0 || code > 11171) return c;
  const ini = Math.floor(code / 588), rest = code % 588; const med = Math.floor(rest / 28);
  const out = [c];
  const mk = i => String.fromCharCode(0xAC00 + i * 588 + rest);
  if (ini === 5) { out.push(mk(2)); out.push(mk(11)); } // ㄹ -> ㄴ, ㅇ
  if (ini === 2) out.push(mk(11)); // ㄴ -> ㅇ
  return out; };
const seen = new Map(); let err = 0;
list.forEach((e, i) => {
  const [ko, hj, ch, m, s, b, c] = e, at = `#${i + 1} ${ko}`;
  const bad = msg => { err++; console.log(at, msg); };
  if (e.length !== 7) bad('필드 수 ' + e.length);
  if ([...ko].length !== 4) bad('한글 4자 아님');
  if ([...hj].length !== 4) bad('한자 4자 아님');
  const parts = ch.split('|'); if (parts.length !== 4) bad('훈음 4개 아님');
  parts.forEach((p, k) => { const eum = p.trim().slice(-1); const want = ko[k];
    if (!B(eum).includes(want) && !B(want).includes(eum)) bad(`음 불일치 ${k + 1}: ${p} vs ${want}`); });
  if (!cats.includes(c)) bad('분류 ' + c);
  if (!m || !s || !b) bad('빈 필드');
  if (seen.has(ko)) bad('중복 (#' + seen.get(ko) + ')'); seen.set(ko, i + 1);
});
const byCat = {}; list.forEach(e => byCat[e[6]] = (byCat[e[6]] || 0) + 1);
console.log('총', list.length, '개 / 오류', err, '/ 분류', JSON.stringify(byCat));
process.exit(err ? 1 : 0);
