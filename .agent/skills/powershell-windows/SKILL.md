{
  "scripts": {
    "prepare": "husky",
    "lint": "xo src/*.ts",
    "format": "npm run format:js && npm run format:md",
    "format:md": "prettier --write --parser markdown '**/*.md'",
    "format:js": "prettier --write '{src,demos,scripts,test,website}/*.{js,ts}'",
    "commit-amend-build": "scripts/commit-amend-build.sh",
    "prebuild": "rimraf dist",
    "dev": "cross-env NODE_ENV=development BABEL_ENV=rollup rollup -w -c -o dist/purify.js",
    "build": "npm run build:types && npm run build:rollup && npm run build:fix-types && npm run build:cleanup",
    "build:types": "tsc --outDir dist/types --declaration --emitDeclarationOnly",
    "build:rollup": "rollup -c",
    "build:fix-types": "node ./scripts/fix-types.js",
    "build:umd": "rollup -c -f umd -o dist/purify.js",
    "build:umd:min": "rollup -c -f umd -o dist/purify.min.js -p terser",
    "build:es": "rollup -c -f es -o dist/purify.es.mjs",
    "build:cjs": "rollup -c -f cjs -o dist/purify.cjs.js",
    "build:cleanup": "rimraf dist/types",
    "test": "cross-env NODE_ENV=test BABEL_ENV=rollup npm run lint && npm run test:jsdom && npm run test:browser -- --project=chromium",
    "test:jsdom": "cross-env NODE_ENV=test BABEL_ENV=rollup node test/jsdom-node-runner --dot",
    "test:browser": "playwright test",
    "test:browser:install": "playwright install",
    "test:ci": "cross-env NODE_ENV=test BABEL_ENV=rollup npm run test:jsdom && npm run test:browser",
    "test:fuzz": "cross-env NODE_ENV=test BABEL_ENV=rollup node test/fuzz/sanitize.fast-check.js",
    "verify-typescript": "node ./typescript/verify.js"
  },
  "main": "./dist/purify.cjs.js",
  "module": "./dist/purify.es.mjs",
  "browser": "./dist/purify.js",
  "production": "./dist/purify.min.js",
  "types": "./dist/purify.cjs.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/purify.es.d.mts",
        "default": "./dist/purify.es.mjs"
      },
      "default": {
        "types": "./dist/purify.cjs.d.ts",
        "default": "./dist/purify.cjs.js"
      }
    },
    "./purify.min.js": "./dist/purify.min.js",
    "./purify.js": "./dist/purify.js",
    "./dist/purify.min.js": "./dist/purify.min.js",
    "./dist/purify.js": "./dist/purify.js"
  },
  "files": [
    "dist"
  ],
  "xo": {
    "semicolon": true,
    "space": 2,
    "extends": [
      "prettier"
    ],
    "plugins": [
      "prettier"
    ],
    "rules": {
      "import/no-useless-path-segments": 0,
      "unicorn/prefer-optional-catch-binding": 0,
      "unicorn/prefer-node-remove": 0,
      "prettier/prettier": [
        "error",
        {
          "trailingComma": "es5",
          "singleQuote": true
        }
      ],
      "camelcase": [
        "error",
        {
          "properties": "never"
        }
      ],
      "@typescript-eslint/ban-types": 0,
      "@typescript-eslint/consistent-type-definitions": 0,
      "@typescript-eslint/indent": 0,
      "@typescript-eslint/naming-convention": 0,
      "@typescript-eslint/no-throw-literal": 0,
      "@typescript-eslint/no-unnecessary-boolean-literal-compare": 0,
      "@typescript-eslint/no-unsafe-argument": 0,
      "@typescript-eslint/no-unsafe-assignment": 0,
      "@typescript-eslint/no-unsafe-call": 0,
      "@typescript-eslint/no-unsafe-return": 0,
      "@typescript-eslint/prefer-includes": 0,
      "@typescript-eslint/prefer-optional-chain": 0,
      "@typescript-eslint/prefer-nullish-coalescing": 0,
      "@typescript-eslint/restrict-plus-operands": 0
    },
    "glob