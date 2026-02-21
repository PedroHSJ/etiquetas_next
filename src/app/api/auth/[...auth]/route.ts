import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handlers = toNextJsHandler(auth);

export const GET = async (req: Request, props: any) => {
  console.log("Auth GET request:", req.url);
  return handlers.GET(req);
};

export const POST = async (req: Request, props: any) => {
  console.log("Auth POST request:", req.url);
  return handlers.POST(req);
};
