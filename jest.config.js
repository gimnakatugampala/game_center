// jest.config.js (CommonJS)
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  testEnvironment: "jsdom",

  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // Allow ESM and JSX
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
  },

  transformIgnorePatterns: [
    "/node_modules/(?!(uuid|nanoid)/)", // allow ESM node_modules if needed
  ],
};

module.exports = createJestConfig(customJestConfig);
