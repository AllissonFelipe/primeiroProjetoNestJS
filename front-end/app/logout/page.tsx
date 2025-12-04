"use client";

import { Colors } from "@/lib/utils/console.log.colors";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  const handleLogout = async () => {
    console.log(
      `${Colors.yellow}[FRONT - APP/LOGOUT/PAGE.TSX]${Colors.reset} 🔄 REALIZANDO LOGOUT E REMOVENDO COOKIES`
    );
    await fetch("api/logout", {
      method: "POST",
    });

    localStorage.removeItem("accessToken");
    localStorage.removeItem("selector");

    router.push("/login");
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-4 border rounded shadow">
      <h1 className="text-xl font-bold mb-4">Deseja sair?</h1>

      <button
        onClick={handleLogout}
        className="bg-red-600 text-white w-full p-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}
