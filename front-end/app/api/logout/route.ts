import { apiFetchUser } from "@/lib/api/api.fetch.user";
import { Colors } from "@/lib/utils/console.log.colors";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3000";

export async function POST(req: NextRequest) {
  const selector = req.cookies.get("selector")?.value;

  if (selector) {
    console.log(
      `${Colors.yellow}[FRONT - APP/API/LOGOUT/ROUTE.TS]${Colors.reset} 🔄 LOGOUT - CHAMANDO LOGOUT NO BACK-END PARA REMOVOVER REFRESH TOKEN DO BANCO DE DADOS.`
    );
    await fetch(`${BACKEND_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ selector }),
    });
  }

  // REMOVENDO COOKIES
  const res = NextResponse.json({ message: "Usuário desconectado" });

  res.cookies.set("selector", "", { maxAge: 0 });
  res.cookies.set("refreshToken", "", { maxAge: 0 });

  return res;
}
