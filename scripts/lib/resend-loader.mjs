import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const STUB = pathToFileURL(join(ROOT, "scripts/lib/mock-resend-stub.mjs")).href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "resend") {
    return { shortCircuit: true, url: STUB };
  }
  return nextResolve(specifier, context);
}
