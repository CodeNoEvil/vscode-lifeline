const tseslint = require("typescript-eslint");

module.exports = tseslint.config(
  { ignores: ["dist/**", "out/**", "out-test/**", "media/**", "node_modules/**", "esbuild.js", "eslint.config.js"] },
  ...tseslint.configs.recommended,
);
