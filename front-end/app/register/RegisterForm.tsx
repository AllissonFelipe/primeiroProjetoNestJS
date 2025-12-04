"use client";

interface RegisterFormProps {
  onSuccess: () => void;
}

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    cpf: "",
    password: "",
  });

  // const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setLoading(true);
    setMsg("");

    // FORÇAR LOGOUT ANTES DE REGISTRAR NOVA CONTA
    localStorage.removeItem("accessToken");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setMsg(data.message || "Erro inesperado");
      // setLoading(false);
      return;
    }

    setMsg("Conta criada com sucesso!");
    onSuccess(); // VAI PARA ABA DE LOGIN
    // router.push("/login");
    // setLoading(false);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="name"
        placeholder="Nome completo"
        value={form.name}
        onChange={handleChange}
        className="border p-2 w-full rounded text-black font-bold"
        required
      />

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
        type="text"
        name="cpf"
        placeholder="CPF"
        value={form.cpf}
        onChange={handleChange}
        className="border p-2 w-full rounded text-black font-bold"
        required
      />

      <input
        type="password"
        name="password"
        placeholder="Senha forte"
        value={form.password}
        onChange={handleChange}
        className="border p-2 w-full rounded text-black font-bold"
        required
      />
      <button className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-500 transition">
        Cadastrar
      </button>
      {msg && <p className="text-green-500">{msg}</p>}
    </form>
  );
}
