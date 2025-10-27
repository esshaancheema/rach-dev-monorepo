module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `@zoptal/eslint-config`
  extends: ["@zoptal/eslint-config"],
  settings: {
    next: {
      rootDir: ["apps/*/"],
    },
  },
};