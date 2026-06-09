module.exports = {
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/.claude/"],
};
