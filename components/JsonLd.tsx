type JsonLdData = Record<string, unknown> | Record<string, unknown>[];

type JsonLdProps = {
  data: JsonLdData;
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
