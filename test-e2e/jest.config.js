// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // Stop on first fail
  bail: true,

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: false,

  // The test environment that will be used for testing
  testEnvironment: "node",

  // The glob patterns Jest uses to detect test files
  testMatch: ["**/test/**/*.spec.js"],
  // testMatch: ["**/test/**/before.spec.js"],
};
