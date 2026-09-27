import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

/**
 * eslint-config-next 16 ships native flat config, so the FlatCompat bridge
 * from the old scaffold is not used. Going through FlatCompat made ESLint throw
 * "Converting circular structure to JSON" while validating the config, which
 * meant `npm run lint` never ran at all.
 */
const eslintConfig = defineConfig([
  ...nextCoreWebVitals,
  ...nextTypeScript,
  globalIgnores([
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
