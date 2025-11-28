import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3000";

export async function GET(req: Request) {
  const auth = req.headers.get("Authorization");

  if (!auth) {
    return NextResponse.json({ message: "Token não enviado" }, { status: 401 });
  }
  const res = await fetch(`${BACKEND_URL}/auth/profile`, {
    method: "GET",
    headers: {
      Authorization: auth,
    },
  });
  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ message: data.message }, { status: res.status });
  }
  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const auth = req.headers.get("Authorization");

  if (!auth) {
    return NextResponse.json({ message: "Token não enviado" }, { status: 401 });
  }

  const body = await req.json();

  const res = await fetch(`${BACKEND_URL}/auth/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ message: data.message }, { status: res.status });
  }

  return NextResponse.json(data);
}
