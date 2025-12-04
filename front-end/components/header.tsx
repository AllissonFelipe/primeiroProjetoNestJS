"use client";

import LoginForm from "@/app/login/LoginForm";
import RegisterForm from "@/app/register/RegisterForm";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [loggedIn, setLoggedIn] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoginTab, setIsLoginTab] = useState(true);

  // Atualiza estado sempre que a rota muda
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      setLoggedIn(!!token);
    }
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch (err) {
      console.error("Erro ao realizar logout", err);
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("selector");
    setLoggedIn(false);
    router.push("/");
  };

  const handleLinkClick = (path: string) => {
    router.push(path);
    router.refresh(); // FORÇA RECARREGAR A PÁGINA MESMO SE CLICOU NO LINK ATIVO
  };

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Profile", path: "/profile" },
    { label: "About", path: "/about" },
  ];

  return (
    <>
      <header className="bg-gray-900 text-white shadow-md">
        <nav className="max-w-6xl mx-auto flex justify-between items-center p-4">
          {/* Logo */}
          <Link
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick("/");
            }}
            className="text-xl font-bold hover:text-blue-400"
          >
            My Site
          </Link>

          {/* Navegação */}
          <div className="flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`px-4 py-2 rounded hover:bg-gray-700 transition ${
                  pathname === item.path ? "bg-blue-600" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}

            {loggedIn ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
              >
                Login / Cadastro
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 font-bold"
            >
              ✕
            </button>

            {/* TEXTO ACIMA DA LINHA */}
            <h2 className="text-center text-gray-700 font-semibold mb-2">
              {isLoginTab ? "Acessar Conta" : "Criar Conta"}
            </h2>
            {/* Tabs */}
            <div className="flex justify-around mb-4 border-b">
              <button
                onClick={() => setIsLoginTab(true)}
                className={`px-4 py-2 ${
                  isLoginTab ? "border-b-2 border-blue-600 font-semibold" : ""
                }`}
              >
                <span className="text-black">Login</span>
              </button>
              <button
                onClick={() => setIsLoginTab(false)}
                className={`px-4 py-2 ${
                  !isLoginTab ? "border-b-2 border-green-600 font-semibold" : ""
                }`}
              >
                <span className="text-black">Cadastro</span>
              </button>
            </div>

            {/* Formulário */}
            {isLoginTab ? (
              <LoginForm
                onSuccess={() => {
                  setLoggedIn(true);
                  setModalOpen(false);
                  router.push("/profile");
                }}
              />
            ) : (
              <RegisterForm
                onSuccess={() => {
                  setIsLoginTab(true); // Vai para aba login após cadastro
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
