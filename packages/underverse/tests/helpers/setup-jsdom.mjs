import { JSDOM } from "jsdom";

export function installJSDOM() {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost/",
    pretendToBeVisual: true,
  });

  const { window } = dom;
  const previous = new Map();
  const assign = (key, value) => {
    previous.set(key, globalThis[key]);
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value,
    });
  };

  assign("window", window);
  assign("document", window.document);
  assign("navigator", window.navigator);
  assign("HTMLElement", window.HTMLElement);
  assign("HTMLAnchorElement", window.HTMLAnchorElement);
  assign("HTMLButtonElement", window.HTMLButtonElement);
  assign("HTMLInputElement", window.HTMLInputElement);
  assign("HTMLTableElement", window.HTMLTableElement);
  assign("HTMLTableRowElement", window.HTMLTableRowElement);
  assign("HTMLTableCellElement", window.HTMLTableCellElement);
  assign("Element", window.Element);
  assign("Node", window.Node);
  assign("Text", window.Text);
  assign("Event", window.Event);
  assign("MouseEvent", window.MouseEvent);
  assign("KeyboardEvent", window.KeyboardEvent);
  assign("CustomEvent", window.CustomEvent);
  assign("DOMParser", window.DOMParser);
  assign("MutationObserver", window.MutationObserver);
  assign("getComputedStyle", window.getComputedStyle.bind(window));
  assign("localStorage", window.localStorage);
  assign("sessionStorage", window.sessionStorage);
  assign("File", window.File);
  assign("Blob", window.Blob);
  assign("Range", window.Range);
  assign("Selection", window.Selection);
  assign("TextEncoder", globalThis.TextEncoder);
  assign("TextDecoder", globalThis.TextDecoder);
  assign("atob", window.atob.bind(window));
  assign("btoa", window.btoa.bind(window));
  assign("IS_REACT_ACT_ENVIRONMENT", true);

  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }

  assign("ResizeObserver", ResizeObserver);
  assign("IntersectionObserver", IntersectionObserver);

  if (!window.matchMedia) {
    window.matchMedia = () => ({
      matches: false,
      media: "",
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() { return false; },
    });
  }

  const raf = (callback) => setTimeout(() => callback(Date.now()), 0);
  const caf = (id) => clearTimeout(id);
  assign("requestAnimationFrame", raf);
  assign("cancelAnimationFrame", caf);
  window.requestAnimationFrame = raf;
  window.cancelAnimationFrame = caf;

  window.open = () => null;
  window.scrollTo = () => {};
  if (!window.document.elementFromPoint) {
    window.document.elementFromPoint = () => window.document.activeElement ?? window.document.body;
  }
  if (!window.HTMLElement.prototype.scrollIntoView) {
    window.HTMLElement.prototype.scrollIntoView = () => {};
  }
  if (!window.HTMLElement.prototype.attachEvent) {
    window.HTMLElement.prototype.attachEvent = () => {};
  }
  if (!window.HTMLElement.prototype.detachEvent) {
    window.HTMLElement.prototype.detachEvent = () => {};
  }
  if (!window.HTMLElement.prototype.setPointerCapture) {
    window.HTMLElement.prototype.setPointerCapture = () => {};
  }
  if (!window.HTMLElement.prototype.releasePointerCapture) {
    window.HTMLElement.prototype.releasePointerCapture = () => {};
  }

  return () => {
    for (const [key, value] of previous.entries()) {
      Object.defineProperty(globalThis, key, {
        configurable: true,
        writable: true,
        value,
      });
    }
    dom.window.close();
  };
}
