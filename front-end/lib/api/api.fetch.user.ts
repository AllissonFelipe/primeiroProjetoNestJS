import { MyFetchOptions } from "../interfaces/fetch.types";
import { Colors, logColor } from "../utils/console.log.colors";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function apiFetchUser(
  req: NextRequest,
  url: string,
  options: MyFetchOptions
) {
  let data = {};

  // ---------------------------------------
  // MONTANDO O HEADERS PARA MANDAR NO FETCH
  // ---------------------------------------
  let headers: HeadersInit = {
    ...toHeaderRecord(options.headers || {}),
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
  };

  console.log(
    `${Colors.yellow}[FRONT - LIB/API/API.FETCH.USER.TS]${Colors.reset} 🔎 REALIZANDO PRIMEIRA TENTATIVA DO MÉTODO FETCH`
  );
  logColor("METHOD", options.method);
  logColor(
    "HEADERS",
    options.headers ? JSON.stringify(options.headers, null, 2) : undefined
  );
  logColor(
    "BODY",
    options.body ? JSON.stringify(options.body, null, 2) : undefined
  );
  // ---------------------------------------------
  // REALIZANDO PRIMEIRA TENTATICA DO MÉTODO FETCH
  // ---------------------------------------------
  let response = await fetch(url, {
    method: options.method || "GET",
    headers: headers,
    // CASO SEJA UM FETCH COM METHOD GET, NÃO PRECISA MANDAR UM BODY
    body:
      options.body && options.method !== "GET"
        ? JSON.stringify(options.body)
        : undefined,
    credentials: options.credentials,
  });

  // ------------------------------------------------------------------------------
  // CASO O TOKEN EXPIROU E RECEBEMOS UNAUTHORIZED - FAÇA REFRESH + OUTRA TENTATIVA
  // ------------------------------------------------------------------------------
  if (response.status === 401 && !options.skipRefresh) {
    console.log(
      `${Colors.yellow}[FRONT - LIB/API/API.FETCH.USER.TS]${Colors.reset} ❌ 401-UNAUTHORIZED - REALIZANDO REFRESH DO TOKEN`
    );

    // --------------------------------
    // CHAMANDO MÉTODO DO REFRESH TOKEN
    // --------------------------------
    const newAccessToken = await doRefresh(req);

    // ----------------------------------------------
    // REFRESH TOKEN FALHOU - REALIZE LOGIN NOVAMENTE
    // ----------------------------------------------
    if (!newAccessToken) {
      console.log(
        `${Colors.yellow}[FRONT - LIB/API/API.FETCH.USER.TS]${Colors.reset} ❌ REFRESH TOKEN FALHOU - ${Colors.red}REALIZE LOGIN NOVAMENTE${Colors.reset}`
      );
      return NextResponse.json(
        { error: "Unauthorized - refresh token failed, please login again" },
        { status: 401 }
      );
    }

    // VARIAVEL HEADERS RECEBENDO NOVO ACCESS TOKEN
    headers = {
      ...headers,
      Authorization: `Bearer ${newAccessToken}`,
    };

    // CHAMANDO MÉTODO FETCH NOVAMENTE COM NOVO TOKEN
    console.log(
      `${Colors.yellow}[FRONT - LIB/API/API.FETCH.USER.TS]${Colors.reset} 🔎 REALIZANDO SEGUNDA TENTATIVA DO MÉTODO FETCH`
    );
    response = await fetch(url, {
      method: options.method || "GET",
      headers: headers,
      body:
        options.body && options.method !== "GET"
          ? JSON.stringify(options.body)
          : undefined,
      credentials: options.credentials,
    });

    // SEGUNDA TENTATICA DO MÉTODO FETCH FALHOU - RETORNANDO O ERRO
    if (!response.ok) {
      console.log(
        `${Colors.yellow}[FRONT - LIB/API/API.FETCH.USER.TS]${Colors.reset} ❌ SEGUNGA TENTATIVA DO MÉTODO FETCH FALHOU`
      );
      return NextResponse.json(
        {
          error: `second request failed with status ${response.status} - ${response.statusText}`,
        },
        { status: response.status }
      );
    }
    console.log(
      `${Colors.yellow}[FRONT - LIB/API/API.FETCH.USER.TS]${Colors.reset} ✅ SEGUNDA TENTATIVA DO MÉTODO FETCH REALIZADA COM SUCESSO - RETORNANDO RESPOSTA...`
    );
    data = await response.json();
    return NextResponse.json(
      { ...data, accessToken: newAccessToken },
      { status: response.status }
    );
  }

  // MÉTODO FETCH REALIZADA DE PRIMEIRA - RETORNANDO RESPOSTA
  console.log(
    `${Colors.yellow}[FRONT - LIB/API/API.FETCH.USER.TS]${Colors.reset} ✅ PRIMEIRA TENTATIVA DO MÉTODO FETCH REALIZADA COM SUCESSO - RETORNANDO RESPOSTA...`
  );
  data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

// ---------------------------------------
// FUNÇÃO PARA REALIZAR O REFRESH DE TOKEN
// ---------------------------------------
export async function doRefresh(req: NextRequest) {
  const { selector, refreshToken } = await getAuthCookies();
  console.log(
    `${Colors.yellow}[FRONT - LIB/API/API.FETCH.USER.TS]${Colors.reset} 🔄 REALIZANDO MÉTODO DE REFRESH TOKEN...`
  );
  const response = await fetch(`${req.nextUrl.origin}/api/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ selector, refreshToken }),
    credentials: "include",
  });
  if (!response) {
    console.log(
      `${Colors.yellow}[FRONT - LIB/API/API.FETCH.USER.TS]${Colors.reset} ❌ MÉTODO DE REFRESH TOKEN FALHOU... RETORNANDO NULL`
    );
    return null;
  }
  const data = await response.json();
  console.log(
    `${Colors.yellow}[FRONT - LIB/API/API.FETCH.USER.TS]${Colors.reset} ✅ MÉTODO DE REFRESH TOKEN REALIZADO COM SUCESSO... RETORNANDO NOVO TOKEN`
  );
  // localStorage.setItem("accessToken", data.accessToken);
  return data.accessToken ?? null;
}

// -------------------------------------------------
// FUNÇÃO AUXILIAR DE PEGAR AUTENTICAÇÃO DOS COOKIES
// -------------------------------------------------
export async function getAuthCookies() {
  console.log(
    `${Colors.yellow}[FRONT - LIB/API/API.FETCH.USER.TS]${Colors.reset} 🔎 PEGANDO SELECTOR E REFRESH TOKEN DOS COOKIES`
  );
  const cookieStore = await cookies();
  return {
    selector: cookieStore.get("selector")?.value,
    refreshToken: cookieStore.get("refreshToken")?.value,
  };
}

// ---------------------------------------------------------------
// FUNÇÃO AUXILIAR PARA HEADERS SER DO TIPO RECORD<STRING, STRING>
// ---------------------------------------------------------------
function toHeaderRecord(
  headers: HeadersInit | undefined
): Record<string, string> {
  const result: Record<string, string> = {};

  if (!headers) return result;

  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      result[key] = value;
    });
  } else if (Array.isArray(headers)) {
    headers.forEach(([key, value]) => {
      result[key] = value;
    });
  } else {
    // Já é Record<string,string>
    Object.assign(result, headers);
  }

  return result;
}
