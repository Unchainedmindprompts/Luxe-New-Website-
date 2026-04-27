import path from "path";
import { buildConfig } from "payload";
import { vercelPostgresAdapter } from "@payloadcms/db-vercel-postgres";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import Partners from "./collections/Partners";

const dirname = process.cwd();

export default buildConfig({
  admin: {
    user: "users",
    meta: {
      robots: "noindex, nofollow",
    },
    importMap: {
      baseDir: path.resolve(dirname, "app/(payload)/admin"),
    },
  },
  collections: [
    {
      slug: "users",
      auth: true,
      access: {
        delete: () => false,
        update: () => false,
      },
      fields: [],
    },
    {
      slug: "media",
      upload: true,
      fields: [
        {
          name: "alt",
          type: "text",
          required: true,
        },
      ],
    },
    Partners,
  ],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: vercelPostgresAdapter({
    pool: {
      connectionString:
        process.env.POSTGRES_URL || process.env.DATABASE_URL || "",
    },
  }),
  plugins: [
    vercelBlobStorage({
      enabled: process.env.BLOB_READ_WRITE_TOKEN?.startsWith("vercel_blob_rw_") === true,
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN ?? "",
    }),
  ],
});
