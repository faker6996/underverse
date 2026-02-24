import assert from "node:assert/strict";
import test from "node:test";

import {
  createOverlayScrollbarController,
  DEFAULT_OVERLAY_SCROLLBAR_SELECTOR,
  DEFAULT_OVERLAY_SCROLLBAR_EXCLUDE,
} from "../../../components/ui/overlay-scrollbar-controller.ts";

class FakeClassList {
  constructor(owner) {
    this.owner = owner;
    this.values = new Set();
  }

  contains(token) {
    return this.values.has(token);
  }

  add(...tokens) {
    tokens.forEach((token) => {
      if (token) this.values.add(token);
    });
    this.owner._syncClassAttribute();
    this.owner._notifyAttributesMutation();
  }

  remove(...tokens) {
    tokens.forEach((token) => {
      this.values.delete(token);
    });
    this.owner._syncClassAttribute();
    this.owner._notifyAttributesMutation();
  }

  setFromString(value) {
    this.values = new Set(String(value || "").split(/\s+/).filter(Boolean));
    this.owner._syncClassAttribute();
  }
}

class FakeMutationObserver {
  constructor(callback, registry) {
    this.callback = callback;
    this.registry = registry;
    this.observations = [];
    registry.add(this);
  }

  observe(target, options) {
    this.observations.push({ target, options });
  }

  disconnect() {
    this.observations = [];
    this.registry.delete(this);
  }
}

class FakeElement {
  constructor(tagName, observerBus) {
    this.tagName = String(tagName || "div").toUpperCase();
    this.attributes = new Map();
    this.children = [];
    this.parentElement = null;
    this.isConnected = false;
    this._observerBus = observerBus;
    this.classList = new FakeClassList(this);
  }

  appendChild(child) {
    if (child.parentElement) child.parentElement.removeChild(child);
    child.parentElement = this;
    this.children.push(child);
    child._setConnected(this.isConnected);
    this._observerBus.notify({ target: this, addedNodes: [child] });
    return child;
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index === -1) throw new Error("Child not found");
    this.children.splice(index, 1);
    child.parentElement = null;
    child._setConnected(false);
    this._observerBus.notify({ target: this, addedNodes: [] });
    return child;
  }

  setAttribute(name, value = "") {
    const attr = String(name);
    const attrValue = String(value);
    this.attributes.set(attr, attrValue);
    if (attr === "class") this.classList.setFromString(attrValue);
    this._notifyAttributesMutation();
  }

  getAttribute(name) {
    return this.attributes.get(String(name)) ?? null;
  }

  hasAttribute(name) {
    return this.attributes.has(String(name));
  }

  matches(selectorList) {
    const selectors = String(selectorList)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    return selectors.some((selector) => this._matchesSingle(selector));
  }

  closest(selectorList) {
    let cursor = this;
    while (cursor) {
      if (cursor.matches(selectorList)) return cursor;
      cursor = cursor.parentElement;
    }
    return null;
  }

  querySelectorAll(selectorList) {
    const results = [];
    const visit = (node) => {
      node.children.forEach((child) => {
        if (child.matches(selectorList)) results.push(child);
        visit(child);
      });
    };
    visit(this);
    return results;
  }

  _matchesSingle(selector) {
    if (!selector) return false;

    if (selector.startsWith(".")) {
      return this.classList.contains(selector.slice(1));
    }

    if (selector.startsWith("[") && selector.endsWith("]")) {
      const inner = selector.slice(1, -1).trim();
      const eq = inner.indexOf("=");
      if (eq === -1) return this.hasAttribute(inner);
      const name = inner.slice(0, eq).trim();
      const rawValue = inner.slice(eq + 1).trim();
      const value = rawValue.replace(/^['"]|['"]$/g, "");
      return this.getAttribute(name) === value;
    }

    return this.tagName.toLowerCase() === selector.toLowerCase();
  }

  _syncClassAttribute() {
    const value = Array.from(this.classList.values).join(" ");
    if (value) this.attributes.set("class", value);
    else this.attributes.delete("class");
  }

  _notifyAttributesMutation() {
    this._observerBus.notify({ target: this, addedNodes: [] });
  }

  _setConnected(next) {
    this.isConnected = next;
    this.children.forEach((child) => child._setConnected(next));
  }
}

function createFakeObserverBus() {
  const observers = new Set();
  return {
    observers,
    createObserver(callback) {
      return new FakeMutationObserver(callback, observers);
    },
    notify(record) {
      observers.forEach((observer) => {
        observer.observations.forEach(({ target, options }) => {
          const sameTarget = target === record.target;
          const inSubtree = options?.subtree && isDescendant(record.target, target);
          if (!sameTarget && !inSubtree) return;
          observer.callback([record], observer);
        });
      });
    },
  };
}

function isDescendant(node, possibleAncestor) {
  let cursor = node;
  while (cursor) {
    if (cursor === possibleAncestor) return true;
    cursor = cursor.parentElement ?? null;
  }
  return false;
}

function createFakeDom() {
  const observerBus = createFakeObserverBus();
  const html = new FakeElement("html", observerBus);
  const body = new FakeElement("body", observerBus);
  html._setConnected(true);
  html.appendChild(body);

  return {
    html,
    body,
    createElement(tagName, attrs = {}) {
      const element = new FakeElement(tagName, observerBus);
      Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
      return element;
    },
    createObserver: observerBus.createObserver,
  };
}

function createRaf() {
  let id = 0;
  const timers = new Map();
  return {
    raf(callback) {
      id += 1;
      const timeout = setTimeout(() => {
        timers.delete(id);
        callback(Date.now());
      }, 0);
      timers.set(id, timeout);
      return id;
    },
    caf(nextId) {
      const timeout = timers.get(nextId);
      if (timeout) clearTimeout(timeout);
      timers.delete(nextId);
    },
  };
}

async function flush() {
  await new Promise((resolve) => setTimeout(resolve, 5));
}

async function withFakeHTMLElement(run) {
  const prevHTMLElement = globalThis.HTMLElement;
  globalThis.HTMLElement = FakeElement;
  try {
    return await run();
  } finally {
    globalThis.HTMLElement = prevHTMLElement;
  }
}

test("init by selector only", async () =>
  withFakeHTMLElement(async () => {
    const dom = createFakeDom();
    const raf = createRaf();
    const created = [];

    const marked = dom.createElement("div", { id: "marked", "data-os-scrollbar": "true" });
    const plain = dom.createElement("div", { id: "plain", class: "overflow-auto" });
    dom.body.appendChild(marked);
    dom.body.appendChild(plain);

    const controller = createOverlayScrollbarController({
      selector: "[data-os-scrollbar]",
      exclude: DEFAULT_OVERLAY_SCROLLBAR_EXCLUDE,
      options: {},
      root: dom.body,
      createObserver: dom.createObserver,
      requestAnimationFrameImpl: raf.raf,
      cancelAnimationFrameImpl: raf.caf,
      createInstance: (element) => {
        created.push(element.getAttribute("id"));
        return { destroy() {} };
      },
    });

    await flush();
    assert.deepEqual(created, ["marked"]);

    controller.destroy();
  }));

test("default selector covers overflow classes without manual marker", async () =>
  withFakeHTMLElement(async () => {
    const dom = createFakeDom();
    const raf = createRaf();
    const created = [];

    const overflowNode = dom.createElement("div", { id: "overflow", class: "overflow-auto" });
    dom.body.appendChild(overflowNode);

    const controller = createOverlayScrollbarController({
      selector: DEFAULT_OVERLAY_SCROLLBAR_SELECTOR,
      exclude: DEFAULT_OVERLAY_SCROLLBAR_EXCLUDE,
      options: {},
      root: dom.body,
      createObserver: dom.createObserver,
      requestAnimationFrameImpl: raf.raf,
      cancelAnimationFrameImpl: raf.caf,
      createInstance: (element) => {
        created.push(element.getAttribute("id"));
        return { destroy() {} };
      },
    });

    await flush();
    assert.deepEqual(created, ["overflow"]);
    controller.destroy();
  }));

test("skip by exclude selector", async () =>
  withFakeHTMLElement(async () => {
    const dom = createFakeDom();
    const raf = createRaf();
    const created = [];

    dom.body.appendChild(dom.createElement("div", { id: "ok", "data-os-scrollbar": "true" }));
    dom.body.appendChild(dom.createElement("div", { id: "ignored", "data-os-scrollbar": "true", "data-os-ignore": "true" }));

    const dialog = dom.createElement("div", { role: "dialog" });
    dialog.appendChild(dom.createElement("div", { id: "dialog-child", "data-os-scrollbar": "true" }));
    dom.body.appendChild(dialog);

    const controller = createOverlayScrollbarController({
      selector: "[data-os-scrollbar]",
      exclude: DEFAULT_OVERLAY_SCROLLBAR_EXCLUDE,
      options: {},
      root: dom.body,
      createObserver: dom.createObserver,
      requestAnimationFrameImpl: raf.raf,
      cancelAnimationFrameImpl: raf.caf,
      createInstance: (element) => {
        created.push(element.getAttribute("id"));
        return { destroy() {} };
      },
    });

    await flush();
    assert.deepEqual(created, ["ok"]);
    controller.destroy();
  }));

test("dynamic node add/remove with cleanup", async () =>
  withFakeHTMLElement(async () => {
    const dom = createFakeDom();
    const raf = createRaf();
    const created = [];
    const destroyed = [];

    const controller = createOverlayScrollbarController({
      selector: "[data-os-scrollbar]",
      exclude: DEFAULT_OVERLAY_SCROLLBAR_EXCLUDE,
      options: {},
      root: dom.body,
      createObserver: dom.createObserver,
      requestAnimationFrameImpl: raf.raf,
      cancelAnimationFrameImpl: raf.caf,
      createInstance: (element) => {
        created.push(element);
        return {
          destroy() {
            destroyed.push(element);
          },
        };
      },
    });

    const dynamic = dom.createElement("div", { id: "dynamic", "data-os-scrollbar": "true" });
    dom.body.appendChild(dynamic);
    await flush();
    assert.equal(created.length, 1);
    assert.equal(controller.getInstanceCount(), 1);

    dom.body.removeChild(dynamic);
    await flush();
    assert.equal(destroyed.length, 1);
    assert.equal(controller.getInstanceCount(), 0);
    controller.destroy();
  }));

test("portal safety with wide selector", async () =>
  withFakeHTMLElement(async () => {
    const dom = createFakeDom();
    const raf = createRaf();
    const created = [];

    const normal = dom.createElement("div", { id: "normal", class: "overflow-auto" });
    dom.body.appendChild(normal);

    const portalRoot = dom.createElement("div", { "data-radix-portal": "true" });
    portalRoot.appendChild(dom.createElement("div", { id: "portal-child", class: "overflow-auto" }));
    dom.body.appendChild(portalRoot);

    const dialogRoot = dom.createElement("div", { role: "dialog" });
    dialogRoot.appendChild(dom.createElement("div", { id: "dialog-child", class: "overflow-y-auto" }));
    dom.body.appendChild(dialogRoot);

    const controller = createOverlayScrollbarController({
      selector: ".overflow-auto, .overflow-y-auto, .overflow-x-auto, [data-os-scrollbar]",
      exclude: DEFAULT_OVERLAY_SCROLLBAR_EXCLUDE,
      options: {},
      root: dom.body,
      createObserver: dom.createObserver,
      requestAnimationFrameImpl: raf.raf,
      cancelAnimationFrameImpl: raf.caf,
      createInstance: (element) => {
        created.push(element.getAttribute("id"));
        return { destroy() {} };
      },
    });

    await flush();
    assert.deepEqual(created, ["normal"]);
    assert.doesNotThrow(() => {
      dom.body.removeChild(portalRoot);
      dom.body.removeChild(dialogRoot);
    });
    controller.destroy();
  }));

test("destroy cleanup prevents memory leaks", async () =>
  withFakeHTMLElement(async () => {
    const dom = createFakeDom();
    const raf = createRaf();
    const destroyed = [];
    let createCount = 0;

    const one = dom.createElement("div", { "data-os-scrollbar": "true" });
    const two = dom.createElement("div", { "data-os-scrollbar": "true" });
    dom.body.appendChild(one);
    dom.body.appendChild(two);

    const controller = createOverlayScrollbarController({
      selector: "[data-os-scrollbar]",
      exclude: DEFAULT_OVERLAY_SCROLLBAR_EXCLUDE,
      options: {},
      root: dom.body,
      createObserver: dom.createObserver,
      requestAnimationFrameImpl: raf.raf,
      cancelAnimationFrameImpl: raf.caf,
      createInstance: (element) => {
        createCount += 1;
        return {
          destroy() {
            destroyed.push(element);
          },
        };
      },
    });

    await flush();
    assert.equal(createCount, 2);
    assert.equal(controller.getInstanceCount(), 2);

    controller.destroy();
    assert.equal(destroyed.length, 2);
    assert.equal(controller.getInstanceCount(), 0);

    dom.body.appendChild(dom.createElement("div", { "data-os-scrollbar": "true" }));
    await flush();
    assert.equal(createCount, 2);
  }));
