import "@testing-library/jest-dom";

// mock IntersectionObserver
globalThis.IntersectionObserver = class {
  constructor() {}
  observe() {}
  disconnect() {}
  unobserve() {}
};

// mock matchMedia (інколи потрібно)
globalThis.matchMedia = () => ({
  matches: false,
  addListener: () => {},
  removeListener: () => {},
});
