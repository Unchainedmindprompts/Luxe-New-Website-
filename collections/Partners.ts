import type { CollectionConfig, CollectionAfterChangeHook } from "payload";
import { cmsId } from "@/lib/payload-schema";

type PartnerDoc = {
  id: string;
  name: string;
  slug: string;
  businessType: string;
  description?: string;
  url?: string;
  telephone?: string;
  email?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  sameAs?: { url: string }[];
  generatedSchema?: string;
};

const schemaGeneratorHook: CollectionAfterChangeHook<PartnerDoc> = async ({
  doc,
  req,
  context,
}) => {
  // Prevent infinite loop — this update will re-enter the hook
  if (context?.generatedByHook) return;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": doc.businessType || "LocalBusiness",
    // All Payload-managed @ids use #cms-* prefix — never clashes with Luxe's
    // hand-authored #business, #owner, #article, or #faq anchors
    "@id": cmsId(`partner-${doc.slug}`),
    name: doc.name,
  };

  if (doc.description) schema.description = doc.description;
  if (doc.url) schema.url = doc.url;
  if (doc.telephone) schema.telephone = doc.telephone;
  if (doc.email) schema.email = doc.email;

  if (doc.address?.streetAddress) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: doc.address.streetAddress,
      addressLocality: doc.address.addressLocality,
      addressRegion: doc.address.addressRegion,
      postalCode: doc.address.postalCode,
      addressCountry: doc.address.addressCountry || "US",
    };
  }

  const sameAsUrls = (doc.sameAs ?? [])
    .map((entry) => entry.url)
    .filter(Boolean);
  if (sameAsUrls.length > 0) schema.sameAs = sameAsUrls;

  await req.payload.update({
    collection: "partners",
    id: doc.id,
    data: { generatedSchema: JSON.stringify(schema, null, 2) },
    // Pass context flag so the next hook execution skips the update
    context: { generatedByHook: true },
  });
};

const Partners: CollectionConfig = {
  slug: "partners",
  admin: {
    useAsTitle: "name",
    description:
      "Dental and medical partner entities for schema testing. All generated @id values use #cms-* namespace — zero conflict with Luxe hand-authored schema.",
    group: "Schema Testing",
  },
  hooks: {
    afterChange: [schemaGeneratorHook],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: "Business Name",
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      label: "Slug (used in @id — URL-safe, e.g. dr-smith-dental)",
      admin: {
        description: "Becomes: https://www.luxewindowworks.com/#cms-partner-{slug}",
      },
    },
    {
      name: "businessType",
      type: "select",
      required: true,
      label: "Schema @type",
      options: [
        { label: "Dentist", value: "Dentist" },
        { label: "Medical Clinic", value: "MedicalClinic" },
        { label: "Physician", value: "Physician" },
        { label: "Local Business", value: "LocalBusiness" },
      ],
    },
    {
      name: "description",
      type: "textarea",
    },
    {
      name: "url",
      type: "text",
      label: "Website URL",
    },
    {
      name: "telephone",
      type: "text",
    },
    {
      name: "email",
      type: "text",
    },
    {
      name: "address",
      type: "group",
      label: "Address",
      fields: [
        { name: "streetAddress", type: "text" },
        { name: "addressLocality", type: "text", label: "City" },
        { name: "addressRegion", type: "text", label: "State" },
        { name: "postalCode", type: "text" },
        {
          name: "addressCountry",
          type: "text",
          label: "Country Code",
          defaultValue: "US",
        },
      ],
    },
    {
      name: "sameAs",
      type: "array",
      label: "External Profiles (sameAs)",
      fields: [
        {
          name: "url",
          type: "text",
          label: "Profile URL",
        },
      ],
    },
    {
      name: "generatedSchema",
      type: "textarea",
      label: "Generated JSON-LD (read-only — updated automatically on save)",
      admin: {
        readOnly: true,
        description:
          "Set by the afterChange hook. Uses cmsId() for @id — safe from Luxe entity graph conflicts.",
        position: "sidebar",
      },
    },
  ],
};

export default Partners;
