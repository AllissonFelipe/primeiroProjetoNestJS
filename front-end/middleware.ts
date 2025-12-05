// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { ROLES, RoleType } from "./types/roles";

/**
 * Função para decodificar o token e obter a role.
 * Retorna o tipo RoleType (RoleType) ou null.
 */
function getRoleFromToken(token: string): RoleType | null {
  try {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = Buffer.from(payloadBase64, "base64").toString("utf8");
    const payload = JSON.parse(payloadJson);

    // Assumindo que o payload tem um array de roles: [{ name: 'ADMIN' }, { name: 'USER' }]
    const roleNames: string[] = payload.roles.map(
      (role: { name: string }) => role.name
    );

    // 🎯 ESTRATÉGIA: Retorna a role de maior precedência encontrada.

    // VERIFICA A ROLE DE MAIOR PRECEDÊNCIA (ADMIN)
    if (roleNames.includes(ROLES.ADMIN)) {
      // USANDO A CONSTANTE TIPADA
      return ROLES.ADMIN;
    }

    if (roleNames.includes(ROLES.MODERATOR)) {
      return ROLES.MODERATOR;
    }

    if (roleNames.includes(ROLES.VIP)) {
      return ROLES.VIP;
    }

    if (roleNames.includes(ROLES.USER)) {
      return ROLES.USER;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Função principal do Middleware.
 */
function middlewareFunction(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;

  // 1. VERIFICAÇÃO DE AUTENTICAÇÃO (Token Existente)
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const userRole = getRoleFromToken(token);

  // 1.1. Tratamento de token válido, mas sem Role válida no payload
  if (!userRole) {
    // O usuário está logado, mas o token não contém roles válidas. Bloqueia acesso.
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. VERIFICAÇÃO DE AUTORIZAÇÃO (Role Guard)
  // 2.1. Regra para /admin: Requer ADMIN
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (userRole !== ROLES.ADMIN) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  // 2.2. Regra para /moderator
  if (request.nextUrl.pathname.startsWith("/moderator")) {
    if (userRole !== ROLES.MODERATOR && userRole !== ROLES.ADMIN) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  // 2.3 Regra para /vip
  if (request.nextUrl.pathname.startsWith("/vip")) {
    if (
      userRole !== ROLES.VIP &&
      userRole !== ROLES.ADMIN &&
      userRole !== ROLES.MODERATOR
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  return NextResponse.next();
}

// 🎯 SOLUÇÃO: Exportar a função como default!
export default middlewareFunction;

export const config = {
  matcher: ["/admin/:path*", "/moderator/:path*", "/vip/:path*", "/profile"],
};
