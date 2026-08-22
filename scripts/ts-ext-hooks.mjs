import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Test-only resolve hook for `npm run test:consult-contract`.
 *
 * Node's strip-types loader does not resolve extensionless `./foo` the way
 * Next/tsc `bundler` resolution does. This hook only rewrites relative
 * specifiers to an existing sibling `.ts` file. It is loaded via
 * `--import ./scripts/register-ts-ext.mjs` on that test script alone.
 * Next.js never imports these files. It does not execute arbitrary paths
 * and does not replace `tsc --noEmit`.
 */
export async function resolve(specifier, context, nextResolve) {
  if (
    context.parentURL &&
    (specifier.startsWith("./") || specifier.startsWith("../")) &&
    !/\.[cm]?[jt]sx?$/.test(specifier)
  ) {
    const ts = new URL(`${specifier}.ts`, context.parentURL);
    if (existsSync(fileURLToPath(ts))) {
      return { url: ts.href, shortCircuit: true };
    }
  }
  return nextResolve(specifier, context);
}
