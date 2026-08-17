import { getAllPosts } from "@/lib/blog";
import { llmsTxt } from "@/lib/agent-discovery";
import { textDocument } from "@/lib/agent-http";

export const dynamic = "force-static";

export async function GET() {
  const posts = await getAllPosts();
  return textDocument(
    llmsTxt(posts.map((post) => ({ slug: post.slug, title: post.title }))),
    "text/plain; charset=utf-8"
  );
}
