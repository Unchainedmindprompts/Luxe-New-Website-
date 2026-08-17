import { register } from "node:module";
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));

register(pathToFileURL(join(here, "alias-loader.mjs")));
register(pathToFileURL(join(here, "resend-loader.mjs")));
