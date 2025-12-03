/* eslint-disable prefer-const */
// --- APP/API/PROFILE/ROUTE.TS --- //

import { NextRequest, NextResponse } from "next/server";
import { apiFetchUser } from "@/lib/api/api.fetch.user";
import { Colors } from "@/lib/utils/console.log.colors";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3000";

export async function GET(req: NextRequest) {
  const authHeader = (await req.headers.get("Authorization")) ?? "";
  console.log(
    `${Colors.yellow}[FRONT - APP/API/PROFILE/ROUTE.TS]${Colors.reset} 🔎 INDO PARA LIB/API/API.FETCH.USER.TS, ${authHeader}`
  );
  const response = await apiFetchUser(req, `${BACKEND_URL}/auth/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
  });

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
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
