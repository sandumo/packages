module.exports = {
  extends: ["next", "turbo", "prettier"],
  plugins: ["unused-imports", "@typescript-eslint"],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "react/jsx-key": "off",
    "quotes": ["error", "single", { "avoidEscape": true }],
    // "unused-imports/no-unused-imports": "error",
    "semi": ["error"],
    "no-extra-semi": ["error"],
    "comma-dangle": ["error", "always-multiline"],
    "eol-last": ["error", "always"],
    // "indent": ["error", 2, { "ignoredNodes": ["PropertyDefinition"] }],
    "indent": ["error", 2],
    "keyword-spacing": ["error", { "before": true, "after": true }],
    "no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 1 }],
    "no-trailing-spaces": ["error"],
    "object-curly-spacing": ["error", "always"],
    "key-spacing": ["error", { "beforeColon": false, "afterColon": true }],
    "space-before-blocks": ["error", "always"],
    "@typescript-eslint/type-annotation-spacing": ["error", { "before": false, "after": true, "overrides": { "colon": { "before": false, "after": true }, "arrow": { "before": true, "after": true } } }],
    // "colon-spacing": ["error", { "before": false, "after": true }],
    // "colon": ["error", { "before": false, "after": true }],
    // "no-unused-vars": ["error", { "vars": "all", "args": "after-used", "ignoreRestSiblings": false }],
    
    // TODO: to uncomment sometime
    // "@typescript-eslint/naming-convention": ["error", {
    //   selector: [
    //     'variable',
    //     'parameter',
    //     'classProperty',
    //     'typeProperty',
    //     'parameterProperty',
    //     'classMethod',
    //     'typeMethod',
    //     'typeParameter',
    //   ],
    //   format: ["camelCase"],
    // }],
  }
};
