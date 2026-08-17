import { jsonBody, offeringsDocument } from "@/lib/agent-discovery";
import { jsonDocument } from "@/lib/agent-http";

export const dynamic = "force-static";

export function GET() {
  return jsonDocument(jsonBody(offeringsDocument()));
}
