export default {
  "client/src/**/*.{js,jsx,ts,tsx}": [
    "npm --prefix client exec eslint -- --config client/eslint.config.js --fix",
    "prettier --write",
  ],
  "server/src/**/*.{js,ts}": [
    "npm --prefix server exec eslint -- --config server/eslint.config.js --fix",
    "prettier --write",
  ],
  "**/*.{json,md,css,html,yml,yaml}": "prettier --write --ignore-unknown",
};
