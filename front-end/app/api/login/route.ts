import { apiFetchUser } from "@/lib/api/api.fetch.user";
import { Colors } from "@/lib/utils/console.log.colors";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3000";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Pegando cookies do servidor se existirem (correto para Next.js)
  const cookieStore = cookies();
  const refreshToken = (await cookieStore).get("refreshToken")?.value;
  const selector = (await cookieStore).get("selector")?.value;

  // Monta o corpo da requisição com os tokens, caso existirem
  const bodyWithTokens = {
    ...body,
    selector: selector || undefined,
    refreshToken: refreshToken || undefined,
  };
  console.log(
    `${Colors.yellow}[FRONT - APP/API/LOGIN/ROUTE.TS]${Colors.reset} 🔎 INDO PARA LIB/API/API.FETCH.USER.TS  ${Colors.yellow}--- POST | LOGIN USER ---${Colors.reset}`
  );
  const res = await apiFetchUser(req, `${BACKEND_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: bodyWithTokens, // apiFetchUser ja realiza JSON.stringify
    skipRefresh: true,
  });
  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ message: data.message }, { status: res.status });
  }
  // Armazenando o refreshToken como cookie HttpOnly
  const response = NextResponse.json(data, { status: res.status });
  // Setando o refreshToken como HttpOnly cookie
  response.cookies.set("refreshToken", data.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Apenas em produção, para segurança
    sameSite: "strict", // Garantir que o cookie só será enviado em requisições do mesmo domínio
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
  });
  // Setando o selector como cookie comum(não HttpOnly), para ser acessado via JS
  response.cookies.set("selector", data.selector, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return response;
}
