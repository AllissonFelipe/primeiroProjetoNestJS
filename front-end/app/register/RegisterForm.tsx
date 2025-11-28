"use client";

import { useState } from "react";

export default function RegisterForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    cpf: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setMsg(data.message || "Erro inesperado");
      setLoading(false);
      return;
    }

    setMsg("Usuário criado com sucesso!");
    setLoading(false);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="name"
        placeholder="Nome completo"
        value={form.name}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />

      <input
        type="text"
        name="cpf"
        placeholder="CPF"
        value={form.cpf}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />

      <input
        type="password"
        name="password"
        placeholder="Senha forte"
        value={form.password}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />
      <button
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        {loading ? "Carregando..." : "Criar conta"}
      </button>

      {msg && <p className="text-center mt-2">{msg}</p>}
    </form>
  );
}
