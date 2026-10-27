// German interface checks. Mock only the public Tizen boundary; never contact a TV.
import { mkdirSync, writeFileSync } from 'node:fs';
import { openPreview, root } from './browser.mjs';

const out = root + '.local/qa/';
mkdirSync(out, { recursive: true });
const CATALOG = [
  ['org.tizen.netflix-app', 'Netflix'], ['9Ur5IzDKqV.TizenYouTube', 'YouTube'], ['MCmYXNxgcu.DisneyPlus', 'Disney+'],
  ['org.tizen.primevideo', 'Prime Video'], ['com.samsung.tv.aria-video', 'Apple TV'], ['AbCdEf1234.ARDMediathek', 'ARD Mediathek'],
  ['AbCdEf1235.ZDFmediathek', 'ZDFmediathek'], ['AbCdEf1236.Joyn', 'Joyn'], ['rJeHak5zRg.Spotify', 'Spotify']
].map(([id, name]) => ({ id, name, show: true, iconPath: '' }));
// Visible English that should never remain in the German interface. App and font names are exempt.
const ENGLISH = /\b(Settings|Background|Wallpaper|Typography|Apps on Home|All apps|Try again|Remove from Home|Add to Home|Not on Home|Recently removed|Loading|Undo|Done|Back|Stay|Leave Home|Open selected|Apply selected|Every hour|Fixed|Light|Dark|Photo|Icons|Both)\b/;
const report = { scope: 'German interface in Chromium; mock public Tizen API only; no TV contacted.', checks: [], failures: [] };
let preview, page;

function check(name, pass, detail) {
  report.checks.push({ name, passed: !!pass, ...(pass ? {} : { detail }) });
  if (!pass) { report.failures.push({ name, detail }); console.error('FAILED ' + name + ': ' + JSON.stringify(detail).slice(0, 600)); }
}
function mock(catalog) {
  window.ShoreQA = { lang: 'de' };
  window.tizen = {
    ApplicationControlData: function () {}, ApplicationControl: function () {},
    application: {
      getAppsInfo(ok) { setTimeout(() => ok(catalog.map(a => ({ ...a }))), 0); },
      launch(id, ok) { setTimeout(ok, 0); }, launchAppControl(c, id, ok) { setTimeout(ok, 0); }
    }
  };
}
const settle = () => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const call = (method, ...args) => page.evaluate(([m, a]) => ShoreQA[m](...a), [method, args]);
async function ready() { await page.waitForFunction(() => window.ShoreQA && ShoreQA.ready && ShoreQA.ready(), null, { timeout: 15000 }); await settle(); }
async function act(action) { if (!(await call('activate', action))) throw Error('Action unavailable: ' + action); await settle(); }

// Every visible text element must fit its box and stay on the stage.
async function inspect(label) {
  const result = await page.evaluate(english => {
    const stage = document.getElementById('stage').getBoundingClientRect(), problems = [], leftovers = [];
    [...document.querySelectorAll('#stage *')].forEach(e => {
      if (!e.getClientRects().length) return;
      const css = getComputedStyle(e);
      if (css.visibility === 'hidden' || +css.opacity === 0) return;
      let hidden = false;
      for (let p = e; p && p.id !== 'stage'; p = p.parentElement) if (getComputedStyle(p).visibility === 'hidden' || +getComputedStyle(p).opacity === 0 || p.hidden) { hidden = true; break; }
      if (hidden) return;
      const own = [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
      if (!own) return;
      const r = e.getBoundingClientRect();
      if (english.test(own)) leftovers.push(own);
      const clipped = (css.overflowX === 'hidden' || css.textOverflow === 'ellipsis') && e.scrollWidth > e.clientWidth + 1;
      const outside = r.right > stage.right + 1 || r.left < stage.left - 1;
      if (clipped || outside) problems.push({ text: own, clipped, outside, width: e.clientWidth, needed: e.scrollWidth });
    });
    return { problems, leftovers };
  }, ENGLISH);
  check(label + ': text fits', result.problems.length === 0, result.problems);
  check(label + ': no English leftovers', result.leftovers.length === 0, result.leftovers);
  await page.screenshot({ path: out + 'de-' + label + '.jpg', quality: 88 });
}

try {
  preview = await openPreview();
  for (const width of [1920, 1280]) {
    page = await preview.browser.newPage({ viewport: { width, height: width * 9 / 16 }, locale: 'de-DE' });
    page.on('pageerror', error => check('no page errors', false, error.message));
    await page.addInitScript(mock, CATALOG);
    await page.goto(preview.baseURL + '/home/');
    await ready();
    const suffix = '-' + width;
    if (width === 1920) {
      const lang = await page.evaluate(() => ({ html: document.documentElement.lang, clock: document.querySelector('.clock').textContent, hour: new Date().getHours(), minute: new Date().getMinutes() }));
      check('Document language is German', lang.html === 'de', lang);
      const [h, m] = lang.clock.split(':').map(Number);
      check('Clock uses the 24-hour format', /^\d{1,2}:\d\d$/.test(lang.clock) && h === lang.hour && Math.abs(m - lang.minute) <= 1, lang);
    }
    await inspect('home-dock' + suffix);
    await call('look', { layout: 'list' }); await ready();
    await inspect('home-list' + suffix);
    await call('look', { layout: 'dock' }); await ready();
    await call('nav', ['back']); await settle();
    await inspect('leave' + suffix);
    await call('scene', 'settings'); await settle();
    await inspect('settings' + suffix);
    for (const group of ['background', 'layout', 'typography', 'focus', 'samsung']) {
      await call('scene', 'settings'); await settle();
      await act('settings.group.' + group);
      await inspect('settings-' + group + suffix);
    }
    await act('settings.back');
    await call('scene', 'settings'); await act('settings.group.background'); await act('background.rotation');
    await inspect('settings-rotation' + suffix);
    await call('scene', 'appearance'); await act('background.wallpaper');
    await inspect('wallpaper' + suffix);
    await call('scene', 'apps'); await page.waitForFunction(() => !ShoreQA.state().catalog.loading); await settle();
    await inspect('apps' + suffix);
    await call('scene', 'editor'); await page.waitForFunction(() => !ShoreQA.state().catalog.loading); await settle();
    await call('nav', ['right']); await settle();
    await inspect('editor' + suffix);
    await page.close();
  }
} catch (error) {
  check('German checks completed', false, error.stack);
} finally {
  if (preview) await preview.close();
  report.finishedAt = new Date().toISOString();
  writeFileSync(out + 'german.json', JSON.stringify(report, null, 2) + '\n');
  const passed = report.checks.filter(c => c.passed).length;
  console.log(passed + ' German checks passed; ' + report.failures.length + ' failure(s). Report: .local/qa/german.json');
  process.exitCode = report.failures.length ? 1 : 0;
}
