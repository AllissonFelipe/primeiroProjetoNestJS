/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
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
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const data = await res.json();

      if (data.accessToken) {
        console.log(
          "[FRONT - APP/PROFILE/PROFILEFORM.TSX] REFRESH DETECTADO, SALVANDO NOVO TOKEN..."
        );
        localStorage.setItem("accessToken", data.accessToken);
      }

      if (res.ok) {
        setProfile(data);
        setForm({ name: data.name, email: data.email });
      } else {
        setErro(data.message || "Erro ao carregar dados.");
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

    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
    }

    if (!res.ok) {
      setMsg(data.message || "Erro ao atualizar");
      return;
    }
    setMsg("Perfil atualizado com sucesso");
  };
  if (loading) return <p>Carregando...</p>;
  if (!profile) return <p className="text-red-600">{erro}</p>;

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
