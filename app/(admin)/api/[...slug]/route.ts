import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from "@payloadcms/next/routes";
import config from "@payload-config";

export const GET = (req: Request) => REST_GET(req, config);
export const POST = (req: Request) => REST_POST(req, config);
export const DELETE = (req: Request) => REST_DELETE(req, config);
export const PATCH = (req: Request) => REST_PATCH(req, config);
export const PUT = (req: Request) => REST_PUT(req, config);
export const OPTIONS = (req: Request) => REST_OPTIONS(req, config);
