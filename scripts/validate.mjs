import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../shared/switcher.js', import.meta.url), 'utf8');
function boot(pathname, readyState = 'complete') {
  const events = {};
  const location = { pathname, href: pathname };
  const node = tag => ({ tagName: tag.toUpperCase(), children: [], attrs: {}, appendChild(child) { this.children.push(child); }, setAttribute(name, value) { this.attrs[name] = value; } });
  const body = node('body');
  const document = {
    readyState, body, dialogOpen: false,
    currentScript: { src: 'https://example.test/ophelia-landing-pages/shared/switcher.js' },
    createElement: node,
    addEventListener(type, fn) { (events[type] ||= []).push(fn); },
    querySelector(selector) { return selector === 'dialog[open]' ? this.dialogOpen : body.children.find(child => child.className === 'iter-switcher'); }
  };
  vm.runInNewContext(source, { document, location, URL });
  const emit = (type, event = {}) => (events[type] || []).forEach(fn => fn(event));
  return { body, document, location, emit };
}
let routes = 0;
for (const state of ['loading', 'interactive', 'complete']) {
  for (let n = 1; n <= 6; n++) {
    for (const path of [`/ophelia-landing-pages/${n}`, `/ophelia-landing-pages/${n}.html`, `/ophelia-landing-pages/${n}.htm`, `/ophelia-landing-pages/${n}/`]) {
      const app = boot(path, state);
      if (state === 'loading') { assert.equal(app.body.children.length, 0); app.emit('DOMContentLoaded'); }
      assert.equal(app.body.children.length, 1);
      app.emit('DOMContentLoaded'); assert.equal(app.body.children.length, 1, 'No duplicate picker');
      const picker = app.body.children[0];
      assert(picker.children[0].textContent.startsWith(`${n} ·`), `Correct label at ${path}`);
      const links = picker.children[1].children;
      assert.equal(links.length, 6);
      links.forEach((link, i) => {
        assert.equal(link.href, `/ophelia-landing-pages/${i + 1}.html`);
        assert.equal(link.attrs['aria-current'], i + 1 === n ? 'page' : undefined);
        const destination = new URL(link.href, 'https://example.test' + path);
        assert.equal(destination.pathname, `/ophelia-landing-pages/${i + 1}.html`, 'Links never nest under a version');
      });
      for (let target = 1; target <= 6; target++) {
        app.location.href = path;
        app.emit('keydown', { key: String(target), target: { tagName: 'BODY' } });
        assert.equal(app.location.href, target === n ? path : `/ophelia-landing-pages/${target}.html`);
      }
      routes++;
    }
  }
}
for (const path of ['/ophelia-landing-pages/', '/ophelia-landing-pages/index.html']) {
  assert(boot(path).body.children[0].children[0].textContent.startsWith('6 ·'));
}
const app = boot('/1');
for (const event of [
  { key: '2', ctrlKey: true }, { key: '2', metaKey: true }, { key: '2', altKey: true },
  { key: '2', defaultPrevented: true }, { key: '2', isComposing: true },
  ...['INPUT', 'TEXTAREA', 'SELECT'].map(tagName => ({ key: '2', target: { tagName } })),
  { key: '2', target: { isContentEditable: true } }, { key: '20' }, { key: '0' }, { key: '7' }
]) { app.emit('keydown', event); assert.equal(app.location.href, '/1'); }
app.document.dialogOpen = true; app.emit('keydown', { key: '2' }); assert.equal(app.location.href, '/1');
console.log(`PASS: ${routes} route/loading combinations, all six links and shortcuts, root default, late mounting and editing guards.`);

import { existsSync } from 'node:fs';
for (const file of ['index.html','1.html','2.html','3.html','4.html','5.html','6.html']) {
  const html = readFileSync(new URL('../' + file, import.meta.url),'utf8');
  for (const [, path] of html.matchAll(/(?:src|href)=["']([^"'#]+)["']/g)) {
    if (!/^(https?:|mailto:|data:)/.test(path)) assert(existsSync(new URL('../' + path, import.meta.url)), file + ': missing ' + path);
  }
  assert.match(html, /More eye contact/);
}
assert.equal(readFileSync(new URL('../index.html', import.meta.url),'utf8'), readFileSync(new URL('../6.html', import.meta.url),'utf8'));
assert(existsSync(new URL('../.nojekyll', import.meta.url)));
console.log('PASS: all page assets and default version 6.');
