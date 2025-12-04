import { apiFetchUser } from "@/lib/api/api.fetch.user";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3000";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Faz request para o backend NestJS
  const res = await apiFetchUser(req, `${BACKEND_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body,
    skipRefresh: true,
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ message: data.message }, { status: res.status });
  }
  return NextResponse.json(data, { status: res.status });
}
