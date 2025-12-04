"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface LoginFormProps {
  onSuccess: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setLoading(true);
    setMsg("");

    const res = await fetch("api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setMsg(data.error || data.message || "Erro inesperado");
      // setLoading(false);
      return;
    }
    // Salvando token(curto prazo) e selector para refreshToken(longo prazo)
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("selector", data.selector);
    setMsg("Usuário logado com sucesso!");

    onSuccess(); // FECHA MODAL E REDIRECIONA
    // router.push("/profile");

    // setLoading(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="border p-2 w-full rounded text-black font-bold"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Senha"
          value={form.password}
          onChange={handleChange}
          className="border p-2 w-full rounded text-black font-bold"
          required
        />
        <button className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-500 transition">
          Entrar
        </button>

        {msg && <p className="text-red-500">{msg}</p>}
      </form>
    </>
  );
}
