import { NextResponse } from "next/server";

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://127.0.0.1:8000";

export async function POST(req: Request) {
  try {
    const prefs = await req.json();

    const pyRes = await fetch(`${PYTHON_BACKEND_URL}/api/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
      signal: AbortSignal.timeout(6000),
    });

    if (!pyRes.ok) {
      throw new Error(`Python backend error status: ${pyRes.status}`);
    }

    const data = await pyRes.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.warn("Python recommendation service unavailable:", err?.message);
    return NextResponse.json(
      {
        success: false,
        error: "Python AI recommendation service offline",
        message: err?.message,
      },
      { status: 503 }
    );
  }
}
