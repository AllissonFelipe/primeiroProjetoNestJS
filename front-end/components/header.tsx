"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [loggedIn, setLoggedIn] = useState(false);

  // Atualiza estado sempre que a rota muda
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      setLoggedIn(!!token);
    }
  }, [pathname]);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Profile", path: "/profile" },
    { label: "About", path: "/about" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("selector");
    setLoggedIn(false);
    router.push("/login");
  };

  return (
    <header className="bg-gray-800 text-white p-4">
      <nav className="flex justify-between items-center">
        {/* Home */}
        <Link href={navItems[0].path}>
          <span
            className={`px-3 py-1 rounded ${
              pathname === navItems[0].path
                ? "bg-blue-600"
                : "hover:bg-gray-700"
            }`}
          >
            {navItems[0].label}
          </span>
        </Link>

        {/* Links à direita */}
        <div className="flex space-x-4">
          {navItems.slice(1).map((item) => (
            <Link key={item.path} href={item.path}>
              <span
                className={`px-3 py-1 rounded ${
                  pathname === item.path ? "bg-blue-600" : "hover:bg-gray-700"
                }`}
              >
                {item.label}
              </span>
            </Link>
          ))}

          {loggedIn ? (
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded bg-red-600 hover:bg-red-700"
            >
              Logout
            </button>
          ) : (
            <Link href={"/login"}>
              <span
                className={`px-3 py-1 rounded ${
                  pathname === "/login" ? "bg-blue-600" : "hover:bg-gray-700"
                }`}
              >
                Login
              </span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
