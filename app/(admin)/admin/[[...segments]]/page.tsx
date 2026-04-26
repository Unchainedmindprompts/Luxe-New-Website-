import type { Metadata } from "next";
import { RootPage, generatePageMetadata } from "@payloadcms/next/views";
import config from "@payload-config";

type Args = {
  params: Promise<{ segments: string[] }>;
};

export const generateMetadata = ({ params }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params });

export default function Page({ params }: Args) {
  return RootPage({ config, params });
}
