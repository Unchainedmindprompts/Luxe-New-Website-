import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Lets Node --experimental-strip-types load the same extensionless relative
 * imports Next/tsc resolve. Test-only; not used in the app.
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
