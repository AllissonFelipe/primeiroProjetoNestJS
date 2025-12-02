/* eslint-disable prefer-const */
// --- APP/API/PROFILE/ROUTE.TS --- //

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
const reset = "\x1b[0m";
const bold = "\x1b[1m";
const yellow = "\x1b[33m";
const green = "\x1b[32m";
const cyan = "\x1b[36m";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3000";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("Authorization");

  // ---------------------------------
  // TOKEN NAO ENVIADO PELA REQUISIÇÃO
  // ---------------------------------
  if (!auth) {
    console.log(
      `${yellow}[FRONT - APP/API/PROFILE/ROUTE.TS]${reset} ❌ ACCESS TOKEN NÃO RECEBIDO\n`
    );
    return NextResponse.json(
      { message: "Token não enviado." },
      { status: 401 }
    );
  }

  // --------------------------------------------
  // 1) PRIMEIRA TENTATIVA DE GETPROFILE: PROFILE
  // -------------------------------------------
  console.log(
    `${yellow}[FRONT - APP/API/PROFILE/ROUTE.TS]${reset} 🔄 1ª TENTATIVA DE GET PROFILE DO USUÁRIO...\n`
  );
  let profileRes = await fetch(`${BACKEND_URL}/auth/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
    credentials: "include",
  });
  // ------------------------------
  // 1) PRIMEIRA TENTATIVA FUNCIONOU - RETORNANDO PROFILE
  // ------------------------------
  if (profileRes.status !== 401) {
    console.log(
      `${yellow}[FRONT - APP/API/PROFILE/ROUTE.TS]${reset} ✅ 1ª TENTATIVA DE GET PROFILE DO USUÁRIO COM SUCESSO.`
    );

    const profileData = await profileRes.json();

    console.log(
      `${green}USER ID:${reset} ${cyan}${profileData.id}${reset}\n${green}USER EMAIL:${reset} ${cyan}${profileData.email}${reset}\n${green}USER CPF:${reset} ${cyan}${profileData.cpf}${reset}\n${green}USER DATE CREATEDAT:${reset} ${cyan}${profileData.createdAt}${reset}\n${green}USER DATE UPDATEDAT:${reset} ${cyan}${profileData.updatedAt}${reset}\n`
    );
    console.log(
      `${yellow}[FRONT - APP/API/PROFILE/ROUTE.TS]${reset} 🔁 RETORNANDO PROFILE DATA PARA ---APP/PROFILE/PROFILEFORM.TSX---\n`
    );
    return NextResponse.json(profileData, { status: profileRes.status });
  }

  // -------------------------------------------
  // 2) TOKEN EXPIRADO → TENTAR REFRESH AUTOMÁTICO
  // -------------------------------------------
  console.log(
    `${yellow}[FRONT - APP/API/PROFILE/ROUTE.TS]${reset} ⚠️  ACCESS TOKEN EXPIRADO => TENTANDO REFRESH TOKEN...\n`
  );
  const cookieStore = cookies();
  const selector = (await cookieStore).get("selector")?.value;
  const refreshToken = (await cookieStore).get("refreshToken")?.value;
  // -----------------------------------------------
  // REFRESH TOKEN NEGADO - REALIZAR LOGIN NOVAMENTE
  // -----------------------------------------------
  if (!selector || !refreshToken) {
    console.log(
      `${yellow}[FRONT - APP/API/PROFILE/ROUTE.TS]${reset} ❌ REFRESH TOKEN NEGADO - REALIZAR LOGIN NOVAMENTE\n`
    );
    return NextResponse.json(
      { message: "Refresh de token negado, realize o login novamente." },
      { status: 401 }
    );
  }
  // ------------------------------------------------
  // CHAMANDO PARA ROTA INTERNA QUE REALIZA O REFRESH
  // ------------------------------------------------
  console.log(
    `${yellow}[FRONT - APP/API/PROFILE/ROUTE.TS]${reset} 🔁 CHAMANDO ROTA INTERNA DO REFRESH TOKEN --- APP/API/REFRESH/ROUTE.TS ---\n`
  );
  const refreshResponse = await fetch(`${req.nextUrl.origin}/api/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ selector: selector, refreshToken: refreshToken }),
    credentials: "include",
  });

  const refreshData = await refreshResponse.json();

  if (refreshResponse.status !== 200 || !refreshData.accessToken) {
    console.log(
      `${yellow}[FRONT - APP/API/PROFILE/ROUTE.TS]${reset} ❌ ERRO AO RENOVAR TOKEN. FAÇA LOGIN NOVAMENTE\n`
    );
    return NextResponse.json(
      {
        message: refreshData.message,
      },
      { status: 401 }
    );
  }

  console.log(
    `${yellow}[FRONT - APP/API/PROFILE/ROUTE.TS]${reset} ✅ REFRESH TOKEN BEM SUCEDIDO. NOVO ACCESS TOKEN ENVIADO.`
  );
  return NextResponse.json(
    {
      accessToken: refreshData.accessToken,
    },
    { status: 200 }
  );
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
