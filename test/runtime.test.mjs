import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync('assets/js/blueprint.js', 'utf8');

class FakeNode {
  constructor(id = '') {
    this.id = id;
    this.dataset = {};
    this.attributes = new Map();
    this.listeners = new Map();
    this.classNames = new Set();
    this.classList = {
      add: name => this.classNames.add(name),
      remove: name => this.classNames.delete(name),
      contains: name => this.classNames.has(name),
    };
    this.textContent = '';
    this.innerHTML = '';
    this.tabIndex = -1;
  }
  addEventListener(type, listener) { this.listeners.set(type, listener); }
  removeAttribute(name) { this.attributes.delete(name); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  focus() { this.ownerDocument.activeElement = this; }
  dispatch(type, init = {}) {
    const event = { preventDefault() {}, ...init };
    this.listeners.get(type)?.(event);
  }
}

function fixture({ failSelector } = {}) {
  const root = new FakeNode('root');
  const sheet = new FakeNode('a001');
  const tablist = new FakeNode('assembly-tabs');
  const panel = new FakeNode('specpanel');
  const title = new FakeNode('spec-t');
  const paragraph = new FakeNode('spec-p');
  const fields = new FakeNode('spec-d');
  const parts = ['background', 'now', 'engineering', 'athletics'].map(key => {
    const node = new FakeNode(`tab-${key}`);
    node.dataset.part = key;
    node.dataset.selected = String(key === 'now');
    return node;
  });
  const ids = new Map([sheet, panel, title, paragraph, fields].map(node => [node.id, node]));
  const document = {
    activeElement: null,
    documentElement: root,
    getElementById: id => ids.get(id) ?? null,
    querySelector: selector => selector === '#a001 .assembly-tabs' ? tablist : null,
    querySelectorAll(selector) {
      if (selector === failSelector) throw new Error(`forced failure at ${selector}`);
      if (selector === '[data-draw]') return [sheet];
      if (selector === '#a001 .part') return parts;
      return [];
    },
  };
  for (const node of [root, sheet, tablist, panel, title, paragraph, fields, ...parts]) {
    node.ownerDocument = document;
  }
  const context = {
    document,
    window: {},
    Set,
    matchMedia: () => ({ matches: false }),
    localStorage: { setItem() {} },
  };
  return { context, doc: document, root, tablist, panel, parts };
}

test('runtime failure never earns the reveal gate', () => {
  const f = fixture({ failSelector: '.mod' });
  assert.throws(() => vm.runInNewContext(source, f.context), /forced failure/);
  assert.equal(f.root.classList.contains('runtime-ready'), false);
  assert.deepEqual(f.parts.map(part => part.getAttribute('role')), [null, null, null, null]);
  assert.equal(f.panel.getAttribute('role'), null);
});

test('successful runtime progressively enhances one working roving tablist', () => {
  const f = fixture();
  vm.runInNewContext(source, f.context);

  assert.equal(f.root.classList.contains('runtime-ready'), true);
  assert.equal(f.tablist.getAttribute('role'), 'tablist');
  assert.equal(f.panel.getAttribute('role'), 'tabpanel');
  assert.deepEqual(f.parts.map(part => part.getAttribute('role')), ['tab', 'tab', 'tab', 'tab']);
  assert.deepEqual(f.parts.map(part => part.tabIndex), [-1, 0, -1, -1]);
  assert.deepEqual(f.parts.map(part => part.getAttribute('aria-selected')), ['false', 'true', 'false', 'false']);

  f.parts[1].focus();
  f.parts[1].dispatch('keydown', { key: 'ArrowDown' });
  assert.equal(f.doc.activeElement, f.parts[2]);
  assert.deepEqual(f.parts.map(part => part.tabIndex), [-1, -1, 0, -1]);
  assert.equal(f.panel.getAttribute('aria-labelledby'), 'tab-engineering');
});
