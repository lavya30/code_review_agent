import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
    const response = await fetch(`${backendUrl}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(180000)  // 3 min timeout
    });
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: `${error}` }, { status: 500 });
  }
}