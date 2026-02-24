import assert from "node:assert/strict";
import test from "node:test";

import {
  createOverlayScrollbarController,
  DEFAULT_OVERLAY_SCROLLBAR_EXCLUDE,
  shouldSkipOverlayScrollbarElement,
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
  }

  setFromString(value) {
    this.values = new Set(String(value || "").split(/\s+/).filter(Boolean));
    this.owner._syncClassAttribute();
  }
}

class FakeElement {
  constructor(tagName = "div") {
    this.tagName = String(tagName || "div").toUpperCase();
    this.attributes = new Map();
    this.parentElement = null;
    this.children = [];
    this.isConnected = true;
    this._visible = true;
    this.classList = new FakeClassList(this);
  }

  appendChild(child) {
    if (child.parentElement) child.parentElement.removeChild(child);
    child.parentElement = this;
    this.children.push(child);
    child._setConnected(this.isConnected);
    return child;
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index === -1) throw new Error("Child not found");
    this.children.splice(index, 1);
    child.parentElement = null;
    child._setConnected(false);
    return child;
  }

  setAttribute(name, value = "") {
    const attr = String(name);
    const attrValue = String(value);
    this.attributes.set(attr, attrValue);
    if (attr === "class") this.classList.setFromString(attrValue);
  }

  hasAttribute(name) {
    return this.attributes.has(String(name));
  }

  getAttribute(name) {
    return this.attributes.get(String(name)) ?? null;
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

  getClientRects() {
    return this._visible ? [{ width: 1, height: 1 }] : [];
  }

  setVisible(next) {
    this._visible = Boolean(next);
  }

  _setConnected(next) {
    this.isConnected = next;
    this.children.forEach((child) => child._setConnected(next));
  }

  _syncClassAttribute() {
    const value = Array.from(this.classList.values).join(" ");
    if (value) this.attributes.set("class", value);
    else this.attributes.delete("class");
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
}

class FakeIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
    this.disconnected = false;
    this.observed = [];
  }

  observe(target) {
    this.observed.push(target);
  }

  disconnect() {
    this.disconnected = true;
    this.observed = [];
  }

  emit(entries) {
    this.callback(entries);
  }
}

function createImmediateRaf() {
  let id = 0;
  const cancelled = new Set();

  return {
    raf(callback) {
      id += 1;
      const currentId = id;
      Promise.resolve().then(() => {
        if (cancelled.has(currentId)) return;
        callback(Date.now());
      });
      return currentId;
    },
    caf(currentId) {
      cancelled.add(currentId);
    },
  };
}

async function flush() {
  await Promise.resolve();
  await Promise.resolve();
}

test("shouldSkipOverlayScrollbarElement blocks root and excluded trees", () => {
  const html = new FakeElement("html");
  const body = new FakeElement("body");
  const dialog = new FakeElement("div");
  const child = new FakeElement("div");
  dialog.setAttribute("role", "dialog");
  dialog.appendChild(child);

  assert.equal(shouldSkipOverlayScrollbarElement(html, DEFAULT_OVERLAY_SCROLLBAR_EXCLUDE), true);
  assert.equal(shouldSkipOverlayScrollbarElement(body, DEFAULT_OVERLAY_SCROLLBAR_EXCLUDE), true);
  assert.equal(shouldSkipOverlayScrollbarElement(child, DEFAULT_OVERLAY_SCROLLBAR_EXCLUDE), true);
});

test("controller initializes only when enabled and visible", async () => {
  const target = new FakeElement("div");
  target.setVisible(false);

  const raf = createImmediateRaf();
  const created = [];
  const destroyed = [];
  let observer = null;

  const controller = createOverlayScrollbarController({
    element: target,
    enabled: true,
    exclude: DEFAULT_OVERLAY_SCROLLBAR_EXCLUDE,
    options: {},
    isVisible: (element) => element.getClientRects().length > 0,
    createIntersectionObserver: (callback) => {
      observer = new FakeIntersectionObserver(callback);
      return observer;
    },
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

  await flush();
  assert.equal(created.length, 0);

  target.setVisible(true);
  observer.emit([{ isIntersecting: true, intersectionRatio: 1 }]);
  await flush();

  assert.equal(created.length, 1);
  assert.equal(controller.getInstanceCount(), 1);

  controller.destroy();
  assert.equal(destroyed.length, 1);
  assert.equal(controller.getInstanceCount(), 0);
});

test("controller skips portal / dialog / toaster trees", async () => {
  const portalRoot = new FakeElement("div");
  portalRoot.setAttribute("data-radix-portal", "true");
  const target = new FakeElement("div");
  portalRoot.appendChild(target);

  const raf = createImmediateRaf();
  let created = 0;

  const controller = createOverlayScrollbarController({
    element: target,
    enabled: true,
    exclude: DEFAULT_OVERLAY_SCROLLBAR_EXCLUDE,
    options: {},
    requestAnimationFrameImpl: raf.raf,
    cancelAnimationFrameImpl: raf.caf,
    createInstance: () => {
      created += 1;
      return { destroy() {} };
    },
  });

  await flush();
  assert.equal(created, 0);
  assert.equal(controller.getInstanceCount(), 0);

  controller.destroy();
});

test("controller respects disabled flag", async () => {
  const target = new FakeElement("div");
  const raf = createImmediateRaf();
  let created = 0;

  const controller = createOverlayScrollbarController({
    element: target,
    enabled: false,
    exclude: DEFAULT_OVERLAY_SCROLLBAR_EXCLUDE,
    options: {},
    requestAnimationFrameImpl: raf.raf,
    cancelAnimationFrameImpl: raf.caf,
    createInstance: () => {
      created += 1;
      return { destroy() {} };
    },
  });

  await flush();
  assert.equal(created, 0);
  assert.equal(controller.getInstanceCount(), 0);

  controller.destroy();
});

test("controller skips data-os-ignore and scrollbar-none", async () => {
  const ignored = new FakeElement("div");
  ignored.setAttribute("data-os-ignore", "true");

  const hiddenScrollbar = new FakeElement("div");
  hiddenScrollbar.classList.add("scrollbar-none");

  const raf = createImmediateRaf();
  let created = 0;

  const one = createOverlayScrollbarController({
    element: ignored,
    enabled: true,
    exclude: DEFAULT_OVERLAY_SCROLLBAR_EXCLUDE,
    options: {},
    requestAnimationFrameImpl: raf.raf,
    cancelAnimationFrameImpl: raf.caf,
    createInstance: () => {
      created += 1;
      return { destroy() {} };
    },
  });

  const two = createOverlayScrollbarController({
    element: hiddenScrollbar,
    enabled: true,
    exclude: DEFAULT_OVERLAY_SCROLLBAR_EXCLUDE,
    options: {},
    requestAnimationFrameImpl: raf.raf,
    cancelAnimationFrameImpl: raf.caf,
    createInstance: () => {
      created += 1;
      return { destroy() {} };
    },
  });

  await flush();
  assert.equal(created, 0);

  one.destroy();
  two.destroy();
});
