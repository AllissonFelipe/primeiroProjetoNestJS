/* eslint-disable prefer-const */
// --- APP/API/PROFILE/ROUTE.TS --- //

import { NextRequest, NextResponse } from "next/server";
import { apiFetchUser } from "@/lib/api/api.fetch.user";
import { Colors } from "@/lib/utils/console.log.colors";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3000";

export async function GET(req: NextRequest) {
  // PEGANDO O TOKEN
  const authHeader = req.headers.get("Authorization") ?? "";

  // CHAMANDO MÉTODO AUXILIAR apiFetchUser
  console.log(
    `${Colors.yellow}[FRONT - APP/API/PROFILE/ROUTE.TS]${Colors.reset} 🔎 INDO PARA LIB/API/API.FETCH.USER.TS  ${Colors.yellow}--- GET | USER PROFILE ---${Colors.reset}`
  );
  const response = await apiFetchUser(req, `${BACKEND_URL}/auth/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { message: data.message },
      { status: response.status }
    );
  }

  return NextResponse.json(data, { status: response.status });
}

export async function PATCH(req: NextRequest) {
  const authHeader = req.headers.get("Authorization") ?? "";
  const body = await req.json();

  // CHAMANDO MÉTODO AUXILIAR apiFetchUser
  console.log(
    `${Colors.yellow}[FRONT - APP/API/PROFILE/ROUTE.TS]${Colors.reset} 🔎 INDO PARA LIB/API/API.FETCH.USER.TS  ${Colors.yellow}--- PATCH | UPDATE USER ---${Colors.reset}`
  );
  const response = await apiFetchUser(req, `${BACKEND_URL}/auth/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: body, // apiFetchUser ja realiza JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { message: data.message },
      { status: response.status }
    );
  }

  return NextResponse.json(data);
}
