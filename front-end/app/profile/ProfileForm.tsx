/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  cpf: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProfileForm() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("accessToken");

      const res = await fetch("api/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (res.ok) {
        setProfile(data);
        setForm({ name: data.name, email: data.email });
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");

    const token = localStorage.getItem("accessToken");

    const res = await fetch("api/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.message || "Erro ao atualizar");
      return;
    }
    setMsg("Perfil atualizado com sucesso");
  };
  if (loading) return <p>Carregando...</p>;
  if (!profile) return <p>Erro ao carregar dados</p>;

  return (
    <div className="max-w-md mx-auto mt-8 p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Meu Perfil</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Nome"
          className="border p-2 w-full"
        />

        <input
          type="text"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="border p-2 w-full"
        />

        <button className="bg-blue-600 text-white py-2 px-4 w-full rounded">
          Salvar
        </button>

        {msg && <p className="text-center text-green-600">{msg}</p>}
      </form>

      <p className="text-sm text-gray-500 mt-4">
        Criado em: {new Date(profile.createdAt).toLocaleString()}
      </p>
      <p className="text-sm text-gray-500">
        Atualizado em: {new Date(profile.updatedAt).toLocaleString()}
      </p>
    </div>
  );
}
