# Payload CMS 3.x + Next.js (App Router) + Vercel/Neon — Setup Runbook

**Time to complete (with this guide): ~30 minutes**
**Without this guide: 7 hours**

This runbook was written from a real production setup. Every "gotcha" section
represents an actual error that cost time to diagnose.

---

## Stack

| Package | Version tested |
|---|---|
| `payload` | 3.84.x |
| `next` | 16.x |
| `@payloadcms/next` | 3.84.x |
| `@payloadcms/db-vercel-postgres` | 3.84.x |
| `@payloadcms/richtext-lexical` | 3.84.x |
| `@payloadcms/storage-vercel-blob` | 3.84.x |
| `@payloadcms/translations` | 3.84.x |
| `@payloadcms/ui` | 3.84.x |
| Database | Neon (Vercel Postgres) |
| Hosting | Vercel |

---

## 1. Install packages

```bash
npm install payload @payloadcms/next @payloadcms/db-vercel-postgres \
  @payloadcms/richtext-lexical @payloadcms/storage-vercel-blob \
  @payloadcms/translations @payloadcms/ui
```

---

## 2. Environment variables (Vercel)

Add these to both **Production** and **Preview** environments in Vercel:

```
PAYLOAD_SECRET=<random 32+ char string>
POSTGRES_URL=<your Neon connection string>
BLOB_READ_WRITE_TOKEN=<vercel blob token — must start with vercel_blob_rw_>
```

> **GOTCHA #1 — Blob token guard**
> If `BLOB_READ_WRITE_TOKEN` is set but does NOT start with `vercel_blob_rw_`,
> the `vercelBlobStorage` plugin throws at build time and crashes the entire app.
> Guard it exactly as shown in `payload.config.ts` below.

---

## 3. `tsconfig.json` — add path alias

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@payload-config": ["./payload.config.ts"]
    }
  }
}
```

---

## 4. `payload.config.ts` — the safe version

```typescript
import path from "path";
import { buildConfig } from "payload";
import { vercelPostgresAdapter } from "@payloadcms/db-vercel-postgres";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

const dirname = process.cwd();

export default buildConfig({
  admin: {
    user: "users",
    meta: { robots: "noindex, nofollow" },
    importMap: {
      baseDir: path.resolve(dirname, "app/(payload)/admin"),
    },
  },
  collections: [
    {
      slug: "users",
      auth: true,
      access: { delete: () => false, update: () => false },
      fields: [],
    },
    {
      slug: "media",
      upload: true,
      fields: [{ name: "alt", type: "text", required: true }],
    },
    // Add your own collections here
  ],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL || "",
    },
    // ⚠️ DO NOT add prodMigrations here — see GOTCHA #2
    // ⚠️ DO NOT add migrationDir unless you are running payload migrate locally
  }),
  plugins: [
    vercelBlobStorage({
      // GOTCHA #1: guard the token — plugin throws if token is set but invalid format
      enabled: process.env.BLOB_READ_WRITE_TOKEN?.startsWith("vercel_blob_rw_") === true,
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN ?? "",
    }),
  ],
});
```

> **GOTCHA #2 — Never use `prodMigrations`**
> Payload 3.x has a `prodMigrations` option on the adapter. DO NOT USE IT.
> It calls `payload.find()` before Payload is fully initialized, which causes
> a crash on every cold start. Tables must be created via the Neon SQL editor
> directly (see Section 6).

---

## 5. `app/(payload)/layout.tsx` — the ONLY version that works

> **GOTCHA #3 — Never use `RootLayout` from `@payloadcms/next/layouts`**
> `RootLayout` renders `<html><head><body>` elements. In Next.js App Router,
> `app/(payload)/layout.tsx` is NESTED inside `app/layout.tsx`. Two `<html>`
> elements crash React 19. You must use `RootProvider` directly.

> **GOTCHA #4 — Pass real user/permissions from server**
> Passing `user: null` and `permissions: null` to `RootProvider` causes
> collection list pages to render blank — Payload checks permissions before
> showing the document table and Create New button. Use `executeAuthStrategies`
> + `getAccessResults` to resolve them server-side.

> **GOTCHA #5 — Theme must be detected, not hardcoded**
> Hardcoding `theme="light"` makes the rich text editor and other elements
> invisible when the user's admin is in dark mode.

```typescript
import "@payloadcms/next/css";
import { handleServerFunctions } from "@payloadcms/next/layouts";
import config from "@payload-config";
import type { LanguageOptions, SanitizedPermissions, ServerFunctionClient } from "payload";
import {
  createLocalReq,
  executeAuthStrategies,
  getAccessResults,
  getPayload,
  getRequestLanguage,
  parseCookies,
} from "payload";
import type { AcceptedLanguages } from "@payloadcms/translations";
import { ProgressBar, RootProvider } from "@payloadcms/ui";
import { getClientConfig } from "@payloadcms/ui/utilities/getClientConfig";
import { initI18n } from "@payloadcms/translations";
import { headers as getHeaders } from "next/headers";
import { importMap } from "./admin/importMap";

const serverFunction: ServerFunctionClient = async (args) => {
  "use server";
  return handleServerFunctions({ ...args, config, importMap });
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  const headers = await getHeaders();
  const cookies = parseCookies(headers);

  const payload = await getPayload({ config, importMap });
  const resolvedConfig = payload.config;

  const languageCode = getRequestLanguage({
    config: resolvedConfig,
    cookies,
    headers,
  }) as AcceptedLanguages;

  const i18n = await initI18n({
    config: resolvedConfig.i18n,
    context: "client",
    language: languageCode,
  });

  const { user } = await executeAuthStrategies({ headers, payload });

  const req = await createLocalReq(
    { req: { headers, host: headers.get("host") ?? "", i18n, user } },
    payload
  );

  const permissions = await getAccessResults({ req });

  // Detect theme: cookie → system header → default light
  const prefix = resolvedConfig.cookiePrefix || "payload";
  const themeCookie = cookies.get(`${prefix}-theme`);
  const themeFromCookie = typeof themeCookie === "string" ? themeCookie : (themeCookie as any)?.value;
  const themeFromHeader = headers.get("Sec-CH-Prefers-Color-Scheme");
  const theme =
    (themeFromCookie === "dark" || themeFromCookie === "light" ? themeFromCookie : null) ??
    (themeFromHeader === "dark" || themeFromHeader === "light" ? themeFromHeader : null) ??
    "light";

  const languageOptions: LanguageOptions = Object.entries(
    resolvedConfig.i18n.supportedLanguages ?? {}
  ).map(([lang, langConfig]: [string, any]) => ({
    label: langConfig.translations.general.thisLanguage as string,
    value: lang as AcceptedLanguages,
  }));

  const clientConfig = getClientConfig({
    config: resolvedConfig,
    i18n,
    importMap,
    user: user ?? true,
  });

  return (
    <>
      <style>{`@layer payload-default, payload;`}</style>
      <RootProvider
        config={clientConfig}
        dateFNSKey={i18n.dateFNSKey}
        fallbackLang={resolvedConfig.i18n.fallbackLanguage}
        isNavOpen={true}
        languageCode={languageCode}
        languageOptions={languageOptions}
        locale={undefined}
        permissions={permissions as unknown as SanitizedPermissions}
        serverFunction={serverFunction}
        theme={theme as "light" | "dark"}
        translations={i18n.translations}
        user={user}
      >
        <ProgressBar />
        {children}
      </RootProvider>
      <div id="portal" />
    </>
  );
}
```

---

## 6. `app/(payload)/admin/[[...segments]]/page.tsx`

```typescript
import type { Metadata } from "next";
import { RootPage, generatePageMetadata } from "@payloadcms/next/views";
import config from "@payload-config";
import { importMap } from "../importMap";

type Args = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
};

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams });

export default function Page({ params, searchParams }: Args) {
  return RootPage({ config, params, searchParams, importMap });
}
```

---

## 7. `app/(payload)/admin/importMap.js`

```javascript
// Auto-generated by withPayload during next build — do not edit manually.
export const importMap = {}
```

---

## 8. `app/(payload)/api/[...slug]/route.ts`

```typescript
import { REST_DELETE, REST_GET, REST_OPTIONS, REST_PATCH, REST_POST, REST_PUT } from "@payloadcms/next/routes";
import config from "@payload-config";
import { importMap } from "../importMap";

const routeHandler = { config, importMap };
export const GET = (req: Request) => REST_GET(req, routeHandler);
export const POST = (req: Request) => REST_POST(req, routeHandler);
export const DELETE = (req: Request) => REST_DELETE(req, routeHandler);
export const PATCH = (req: Request) => REST_PATCH(req, routeHandler);
export const PUT = (req: Request) => REST_PUT(req, routeHandler);
export const OPTIONS = (req: Request) => REST_OPTIONS(req, routeHandler);
```

> **GOTCHA #6 — Payload intercepts ALL `/api/*` routes**
> The `app/(payload)/api/[...slug]/route.ts` catch-all handles every request
> under `/api/`. If you need a health check or custom API route, put it
> outside `/api/` — e.g. `/app/healthcheck/route.ts`.

---

## 9. `next.config.mjs`

```javascript
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig = {
  // your existing config
};

export default withPayload(nextConfig);
```

---

## 10. Database — SQL to run on Neon

> **GOTCHA #7 — Payload does NOT auto-create tables on Vercel**
> The `push: true` adapter option only runs when `NODE_ENV !== 'production'`.
> Vercel always sets `NODE_ENV=production`, so tables are NEVER auto-created.
> You must run this SQL manually in the Neon SQL editor for EACH database branch
> (both `main` and any preview branches).

Run this SQL once per database branch after initial deployment:

```sql
-- Users (auth collection)
CREATE TABLE IF NOT EXISTS "users" (
  "id"                         serial PRIMARY KEY NOT NULL,
  "updated_at"                 timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at"                 timestamp(3) with time zone DEFAULT now() NOT NULL,
  "email"                      varchar NOT NULL,
  "reset_password_token"       varchar,
  "reset_password_expiration"  timestamp(3) with time zone,
  "salt"                       varchar,
  "hash"                       varchar,
  "login_attempts"             numeric DEFAULT 0,
  "lock_until"                 timestamp(3) with time zone
);
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");

-- Users sessions (added in Payload 3.84+)
CREATE TABLE IF NOT EXISTS "users_sessions" (
  "_order"     integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id"         varchar PRIMARY KEY NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now(),
  "expires_at" timestamp(3) with time zone
);
CREATE INDEX IF NOT EXISTS "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "users_sessions_parent_idx" ON "users_sessions" USING btree ("_parent_id");
ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk"
  FOREIGN KEY ("_parent_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;

-- Media (upload collection)
CREATE TABLE IF NOT EXISTS "media" (
  "id"            serial PRIMARY KEY NOT NULL,
  "alt"           varchar NOT NULL,
  "updated_at"    timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at"    timestamp(3) with time zone DEFAULT now() NOT NULL,
  "url"           varchar,
  "thumbnail_url" varchar,
  "filename"      varchar,
  "mime_type"     varchar,
  "filesize"      numeric,
  "width"         numeric,
  "height"        numeric,
  "focal_x"       numeric,
  "focal_y"       numeric
);
CREATE UNIQUE INDEX IF NOT EXISTS "media_filename_idx" ON "media" USING btree ("filename");

-- Payload system tables
CREATE TABLE IF NOT EXISTS "payload_preferences" (
  "id"         serial PRIMARY KEY NOT NULL,
  "key"        varchar,
  "value"      jsonb,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");

CREATE TABLE IF NOT EXISTS "payload_preferences_rels" (
  "id"        serial PRIMARY KEY NOT NULL,
  "order"     integer,
  "parent_id" integer NOT NULL,
  "path"      varchar NOT NULL,
  "users_id"  integer
);
CREATE INDEX IF NOT EXISTS "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
CREATE INDEX IF NOT EXISTS "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
CREATE INDEX IF NOT EXISTS "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
ALTER TABLE "payload_preferences_rels"
  ADD CONSTRAINT "payload_preferences_rels_parent_fk"
  FOREIGN KEY ("parent_id") REFERENCES "payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_preferences_rels"
  ADD CONSTRAINT "payload_preferences_rels_users_fk"
  FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;

CREATE TABLE IF NOT EXISTS "payload_migrations" (
  "id"         serial PRIMARY KEY NOT NULL,
  "name"       varchar,
  "batch"      numeric,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "payload_locked_documents" (
  "id"          serial PRIMARY KEY NOT NULL,
  "global_slug" varchar,
  "updated_at"  timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at"  timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (
  "id"          serial PRIMARY KEY NOT NULL,
  "order"       integer,
  "parent_id"   integer NOT NULL,
  "path"        varchar NOT NULL,
  "users_id"    integer,
  "media_id"    integer
);
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
ALTER TABLE "payload_locked_documents_rels"
  ADD CONSTRAINT "payload_locked_documents_rels_parent_fk"
  FOREIGN KEY ("parent_id") REFERENCES "payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_locked_documents_rels"
  ADD CONSTRAINT "payload_locked_documents_rels_users_fk"
  FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_locked_documents_rels"
  ADD CONSTRAINT "payload_locked_documents_rels_media_fk"
  FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE cascade ON UPDATE no action;
```

> **GOTCHA #8 — `users_sessions` table is NEW in Payload 3.84+**
> This table did not exist in earlier versions. If you set up the database
> before upgrading to 3.84+, you will get:
> `Error: Failed query: relation "users_sessions" does not exist`
> Fix: run just the `users_sessions` block from the SQL above.

---

## 11. Adding a new collection

Every new collection needs:

### A. Create `collections/MyCollection.ts`

Follow the Partners or Posts collection in this repo as a template.

### B. Add to `payload.config.ts`

```typescript
import MyCollection from "./collections/MyCollection";
// ...
collections: [...existingCollections, MyCollection],
```

### C. Add SQL for the new table (run on Neon for each branch)

Pattern for a basic collection:

```sql
CREATE TABLE IF NOT EXISTS "my_collection" (
  "id"         serial PRIMARY KEY NOT NULL,
  "title"      varchar NOT NULL,
  "slug"       varchar NOT NULL,
  -- add your fields here in snake_case
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "my_collection_slug_idx"
  ON "my_collection" USING btree ("slug");

-- Allow Payload to lock documents during editing
ALTER TABLE "payload_locked_documents_rels"
  ADD COLUMN IF NOT EXISTS "my_collection_id" integer;
ALTER TABLE "payload_locked_documents_rels"
  ADD CONSTRAINT "payload_locked_documents_rels_my_collection_fk"
  FOREIGN KEY ("my_collection_id") REFERENCES "my_collection"("id")
  ON DELETE cascade ON UPDATE no action;
```

**Column name rules:**
- `camelCase` field name → `snake_case` column name
- `type: "richText"` → `jsonb` column
- `type: "checkbox"` → `boolean DEFAULT false`
- `type: "date"` → `timestamp(3) with time zone`
- `type: "upload"` → `my_field_id integer` + FK to `media`
- `type: "array"` → separate sub-table (see Posts collection SQL for pattern)

---

## 12. First-time setup checklist

- [ ] Packages installed
- [ ] Env vars set in Vercel (Production + Preview)
- [ ] `payload.config.ts` created (with blob guard)
- [ ] `app/(payload)/layout.tsx` created (use the code in Section 5 exactly)
- [ ] `app/(payload)/admin/[[...segments]]/page.tsx` created
- [ ] `app/(payload)/admin/importMap.js` created
- [ ] `app/(payload)/api/[...slug]/route.ts` created
- [ ] `next.config.mjs` wraps config with `withPayload`
- [ ] SQL run on Neon **main** branch
- [ ] SQL run on Neon **preview** branch
- [ ] Deploy — wait for green
- [ ] Go to `/admin/create-first-user` and create admin account
- [ ] Promote preview to production
- [ ] Go to production `/admin/create-first-user` and create admin account again

---

## 13. Error → Fix quick reference

| Error | Cause | Fix |
|---|---|---|
| `relation "users_sessions" does not exist` | Table missing for Payload 3.84+ | Run `users_sessions` SQL block on Neon |
| `Error: Invalid token format` (vercelBlobStorage) | `BLOB_READ_WRITE_TOKEN` set but wrong format | Add the `enabled:` guard in `payload.config.ts` |
| Admin returns 500 / nested `<html>` crash | Using `RootLayout` inside nested Next.js layout | Use custom `RootProvider` layout (Section 5) |
| Collection list page is blank | `user: null` passed to `RootProvider` | Use `executeAuthStrategies` server-side (Section 5) |
| Rich text editor invisible | `theme="light"` hardcoded | Detect theme from cookie/header (Section 5) |
| `/api/health` returns Payload 404 | Payload intercepts all `/api/*` routes | Move health checks outside `/api/` path |
| Build error: `ServerFunctionHandler not assignable to ServerFunctionClient` | Wrong type on serverFunction | Wrap `handleServerFunctions` in an async arrow function with `"use server"` |
| `prodMigrations` crash on cold start | Runs `payload.find()` before init | Remove `prodMigrations` entirely from adapter config |

---

## 14. Claude prompt template for new setups

Copy this as the first message when starting a new Payload CMS setup with Claude:

```
Set up Payload CMS 3.x as a headless CMS on this Next.js App Router project 
with Vercel Postgres (Neon). Use the exact patterns from PAYLOAD_SETUP_RUNBOOK.md 
in this repo — do not deviate from the layout.tsx in Section 5, the payload.config.ts 
in Section 4, or the SQL in Section 10. The major gotchas are documented there.

Collections to create: [LIST YOUR COLLECTIONS HERE]

After creating the code, provide the complete Neon SQL to run for all new tables.
Do not use RootLayout, prodMigrations, or hardcoded theme values.
```

---

*Written from a production setup on 2026-04-27. Payload 3.84.1 + Next.js 16.2.4.*
