const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  const html = require('fs').readFileSync('/home/user/dojo-nihongo/index.html', 'utf8');
  await page.setContent(html, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  // Datos
  const stats = await page.evaluate(() => ({ items: ITEMS.size, k: KANJI_ALL.length, v: VOCAB_ALL.length, g: GRAMMAR_ALL.length, lv1: itemsOfLevel(1).length, lv14: itemsOfLevel(14).length, kana: toKana('nihongo') + ' ' + toKana('kitte') + ' ' + toKana('shinbun') + ' ' + toKana('kyou') + ' ' + toKana('ten', true) + ' ' + toKana('ten') + ' ' + toKana('tenki'), es: matchEs('la persona', ['persona']) + ' ' + matchEs('comprar', ['comprar']) + ' ' + matchEs('comrpar', ['comprar']) + ' ' + matchEs('agua', ['fuego']), cloze: CLOZE_KANA['読めます'] }));
  console.log(JSON.stringify(stats));
  await page.screenshot({ path: '/tmp/web-shot-hoy.png' });
  // Lección: empezar y recorrer
  await page.click('text=Lecciones');
  await page.waitForTimeout(200);
  await page.click('button:has-text("Lección de")');
  for (let i = 0; i < 4; i++) { await page.waitForTimeout(100); await page.click('button:has-text("Siguiente →")'); }
  await page.screenshot({ path: '/tmp/web-shot-lesson.png' });
  await page.click('button:has-text("Empezar el test")');
  // Responder el test automáticamente
  for (let n = 0; n < 60; n++) {
    await page.waitForTimeout(80);
    const state = await page.evaluate(() => SESSION ? { busy: !!(document.querySelector('#ans')&&document.querySelector('#ans').disabled), phase: SESSION.phase, f: SESSION.cur.f, correct: SESSION.cur.p.correct, r: SESSION.cur.p.it.r, m: SESSION.cur.p.it.m, pickc: SESSION.cur.p.pick && SESSION.cur.p.pick.correct, answers: SESSION.cur.p.cloze && SESSION.cur.p.cloze.answers } : null);
    if (!state) break;
    if (state.busy) continue;
    if (state.phase === 'ask') {
      let ans;
      if (state.f === 'km' || state.f === 'vm') ans = state.m[0];
      else if (state.f === 'kr') ans = state.correct.split('・')[0];
      else if (state.f === 'vr' || state.f === 'vp') ans = state.r;
      else ans = state.answers[0];
      await page.fill('#ans', ans); await page.press('#ans', 'Enter');
    } else if (state.phase === 'pick') { await page.click(`.choices button:text-is("${state.pickc}")`); }
    else if (state.phase === 'feedback') { await page.keyboard.press('Enter'); }
  }
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/web-shot-after-lesson.png' });
  const after = await page.evaluate(() => ({ learned: learnedKeys().length, day: day(), level: S.level }));
  console.log('after lesson', JSON.stringify(after));
  // Forzar repasos vencidos y hacer uno fallando
  await page.evaluate(() => { for (const k in S.items) S.items[k].due = now() - 1000; save(); go('repasos'); });
  await page.waitForTimeout(200);
  await page.click('button:has-text("Repasar")');
  await page.waitForTimeout(200);
  await page.fill('#ans', 'xxxx'); await page.press('#ans', 'Enter');
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/web-shot-review-wrong.png' });
  // Examen: forzar material y lanzar semanal
  await page.evaluate(() => { for (const it of [...ITEMS.values()].filter(i => i.lv <= 4)) { const k = keyOf(it); S.items[k] = { s: 3, due: now() + 1e7, c: 2, w: 1 }; } S.weekly.last = now() - 8 * D; save(); SESSION = null; go('examenes'); });
  await page.waitForTimeout(200);
  await page.screenshot({ path: '/tmp/web-shot-exams.png' });
  await page.click('button:has-text("Hacer examen semanal")');
  await page.waitForTimeout(300);
  const exam = await page.evaluate(() => EXAM ? { n: EXAM.qs.length, secs: EXAM.qs.map(q => q.sec).reduce((a, s) => (a[s] = (a[s] || 0) + 1, a), {}) } : null);
  console.log('exam', JSON.stringify(exam));
  await page.screenshot({ path: '/tmp/web-shot-exam-q.png' });
  for (let n = 0; n < 80; n++) { await page.waitForTimeout(40); const st = await page.evaluate(() => EXAM ? { type: EXAM.qs[EXAM.i].type, ans: EXAM.qs[EXAM.i].answer, i: EXAM.i } : null); if (!st) break; if (st.type === 'typed') { await page.fill('#ans', 'x'); await page.press('#ans', 'Enter'); } else { const btns = await page.$$('.choices button'); await btns[0].click(); } }
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/web-shot-exam-result.png' });
  // Lectura
  await page.evaluate(() => go('lectura'));
  await page.click('.list .item');
  await page.waitForTimeout(200);
  await page.click('.reader .tok');
  await page.screenshot({ path: '/tmp/web-shot-reading.png' });
  // Progreso y ajustes
  await page.evaluate(() => go('progreso')); await page.waitForTimeout(100); await page.screenshot({ path: '/tmp/web-shot-progress.png' });
  await page.evaluate(() => go('ajustes')); await page.waitForTimeout(100); await page.screenshot({ path: '/tmp/web-shot-settings.png' });
  // Nivel 14 generación
  await page.evaluate(() => { S.level = 14; go('lecciones'); }); await page.waitForTimeout(100); await page.screenshot({ path: '/tmp/web-shot-gen.png' });
  // Móvil
  const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
  m.on('pageerror', e => errors.push('MOBILE PAGEERROR ' + e.message));
  await m.setContent(html, { waitUntil: 'load' });
  await m.waitForTimeout(300);
  const sw = await m.evaluate(() => document.documentElement.scrollWidth);
  console.log('mobile scrollWidth', sw);
  await m.screenshot({ path: '/tmp/web-shot-mobile.png' });
  await m.evaluate(() => { S.level = 1; const its = itemsOfLevel(1).slice(0, 3); its.forEach(it => S.items[keyOf(it)] = { s: 2, due: now() - 1, c: 1, w: 0 }); startReviews(); });
  await m.waitForTimeout(200);
  await m.screenshot({ path: '/tmp/web-shot-mobile-review.png' });
  console.log('ERRORS', JSON.stringify(errors));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
