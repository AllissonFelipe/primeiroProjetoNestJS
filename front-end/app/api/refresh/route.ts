// --- APP/API/REFRESH/ROUTE.TS --- //

import { NextResponse } from "next/server";
const reset = "\x1b[0m";
const bold = "\x1b[1m";
const yellow = "\x1b[33m";
const green = "\x1b[32m";
const cyan = "\x1b[36m";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3000";

export async function POST(req: Request) {
  console.log(
    `${yellow}[FRONT - APP/API/REFRESH/ROUTE.TS]${reset} REFRESH ROUTE CHAMADO, GRAVANDO COOKIES EM VARIÁVEIS {SELECTOR E REFRESH TOKEN}`
  );

  const { selector, refreshToken } = await req.json();

  console.log(`${green}SELECTOR:${reset} ${cyan}${selector}${reset}`);
  console.log(`${green}REFRESH TOKEN:${reset} ${cyan}${refreshToken}${reset}`);

  // ---------------------------------------
  // SELECTOR OU REFRESHTOKEN NÃO ENCONTRADO
  // ---------------------------------------
  if (!selector || !refreshToken) {
    console.log(
      `${yellow}[FRONT - APP/API/REFRESH/ROUTE.TS]${reset} SELECTOR OU REFRESH TOKEN NÃO ENCONTRADO`
    );

    console.log(`${green}SELECTOR:${reset} ${cyan}${selector}${reset}`);
    console.log(
      `${green}REFRESH TOKEN:${reset} ${cyan}${refreshToken}${reset}`
    );

    return NextResponse.json(
      {
        message:
          "[FRONT - APP/API/REFRESH/ROUTE.TS] SELECTOR OU REFRESH TOKEN NÃO ENCONTRADO.",
      },
      { status: 401 }
    );
  }

  // --------------------------------------------------
  // ENVIANDO SELECTOR E REFRESH TOKEN PARA O BACK-END
  // --------------------------------------------------
  console.log(
    `${yellow}[FRONT - APP/API/REFRESH/ROUTE.TS]${reset} ENVIANDO SELECTOR E REFRESH TOKEN PARA O BACK-END`
  );

  const backendResponse = await fetch(`${BACKEND_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ selector, oldToken: refreshToken }),
  });

  // --------------------------
  // DADOS RECEBIDO DO BACK-END
  // --------------------------
  const data = await backendResponse.json();

  console.log(
    `${yellow}[FRONT - APP/API/REFRESH/ROUTE.TS]${reset} DADOS RECEBIDOS DO BACK-END:`
  );
  console.log(
    `${green}ACCESSTOKEN:${reset} ${cyan}${data.accessToken}${reset}`
  );
  console.log(`${green}SELECTOR:${reset} ${cyan}${data.selector}${reset}`);
  console.log(
    `${green}REFRESHTOKEN:${reset} ${cyan}${data.refreshToken}${reset}`
  );

  // --------------------------
  // BACK-END RETORNOU ERRO
  // -------------------------
  if (!backendResponse.ok) {
    console.log(
      `${yellow}[FRONT - APP/API/REFRESH/ROUTE.TS]${reset} BACK-END RETORNOU ERRO.`
    );
    return NextResponse.json(data, { status: backendResponse.status });
  }

  // -------------------------------------------------
  // RETORNANDO NOVO ACCESS TOKEN PARA APP/API/PROFILE
  // ------------------------------------------------
  console.log(
    `${yellow}[FRONT - APP/API/REFRESH/ROUTE.TS]${reset} RETORNANDO NOVO ACCESS TOKEN PARA --- APP/API/PROFILE ---`
  );
  return NextResponse.json(
    {
      accessToken: data.accessToken,
    },
    { status: 200 }
  );
}
