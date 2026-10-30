import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // Vendored React Bits components (components/bits), kept as published. They update "latest value" refs
  // during render and set state in effects on purpose, which these two React Compiler rules reject.
  { files: ["components/bits/**"], rules: { "react-hooks/refs": "off", "react-hooks/set-state-in-effect": "off" } },
  globalIgnores([".next/**", "node_modules/**", "public/**", "next-env.d.ts"]),
]);
