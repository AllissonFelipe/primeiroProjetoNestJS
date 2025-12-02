import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3000";

export async function getAuthCookies() {
  const cookieStore = await cookies();
  return {
    selector: cookieStore.get("selector")?.value,
    refreshToken: cookieStore.get("refreshToken")?.value,
  };
}

export async function doRefresh(req: NextRequest) {
  const { selector, refreshToken } = await getAuthCookies();

  const response = await fetch(`${req.nextUrl.origin}/api/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ selector, refreshToken }),
    credentials: "include",
  });

  if (!response) {
    return null;
  }

  const data = await response.json();

  return data.accessToken ?? null;
}

export async function apiFetchBackend(
  req: NextRequest,
  path: string,
  options: RequestInit
) {
  const firstTry = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    credentials: "include",
  });
  // -------------------
  // SE NÃO FOR 401(UNAUTHORIZED) JÁ RETORNA
  // ------------------
  if (firstTry.status !== 401) {
    return firstTry;
  }
  // --------------------
  // CASO CONTRÁRIO
  // -----------------
  const newAccessToken = await doRefresh(req);
  // ----------------------------------
  // CASO O REFRESH TOKEN NÃO FUNCIONAR
  // ----------------------------------
  if (!newAccessToken) {
    return new NextResponse(
      JSON.stringify({ message: "Login necessário,", status: 401 })
    );
  }
  // ------------------------
  // REFRESH TOKEN FUNCIONOU
  // ------------------------
  const secondTry = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${newAccessToken}`,
    },
    credentials: "include",
  });

  return secondTry;
}
