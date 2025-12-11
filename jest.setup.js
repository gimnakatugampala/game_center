// jest.setup.js (CommonJS)
require("@testing-library/jest-dom");

// --------------------------------------------------
// 1. Mock window.matchMedia (SAFE)
// --------------------------------------------------
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

// --------------------------------------------------
// 2. Stable performance.now() mock
// --------------------------------------------------
const STABLE_PERFORMANCE_TIME = 1678886400000;

if (typeof performance !== "undefined") {
  jest
    .spyOn(performance, "now")
    .mockImplementation(() => STABLE_PERFORMANCE_TIME);
}

// --------------------------------------------------
// 3. Mock console (SAFE)
// --------------------------------------------------
jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});
// jest.spyOn(console, "log").mockImplementation(() => {}); // optional
