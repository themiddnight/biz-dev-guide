// Vercel serves the Vite build as static files and never runs server.ts, so each /api route the
// client calls needs its own function here.
import { askAi } from "../server/ask-ai.js";

export async function POST(request: Request): Promise<Response> {
  const input = await request.json().catch(() => null);
  const { status, body } = await askAi(input);
  return Response.json(body, { status });
}
