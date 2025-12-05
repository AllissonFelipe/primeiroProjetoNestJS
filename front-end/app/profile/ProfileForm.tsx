/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Role {
  id: string;
  name: string;
}
interface ProfileData {
  id: string;
  name: string;
  email: string;
  cpf: string;
  createdAt: string;
  updatedAt: string;
  roles: Role[];
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
    cpf: "",
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
        setForm({ name: data.name, email: data.email, cpf: data.cpf });
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

  // ---------------------------------------
  // Loading state
  // ---------------------------------------
  if (!profile) {
    return (
      <div className="flex justify-center mt-20">
        <p className="text-gray-300">Carregando perfil...</p>
      </div>
    );
  }

  // ---------------------------------------
  // Format dates
  // ---------------------------------------
  const createdAtFormatted = new Date(profile.createdAt).toLocaleString();
  const updatedAtFormatted = new Date(profile.updatedAt).toLocaleString();

  return (
    <div className="max-w-md mx-auto mt-10 p-6 rounded-xl border border-neutral-700 bg-neutral-900 shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-white">Meu Perfil</h2>

      {/* ---------------------- FORM ---------------------- */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Nome"
          className="w-full p-3 rounded-lg bg-neutral-800 text-white border border-neutral-700 
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-700 outline-none"
        />

        {/* Email */}
        <input
          type="text"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-3 rounded-lg bg-neutral-800 text-white border border-neutral-700 
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-700 outline-none"
        />
        {/* CPF */}
        <input
          type="text"
          name="cpf"
          value={form.cpf}
          onChange={handleChange}
          placeholder="CPF"
          className="w-full p-3 rounded-lg bg-neutral-800 text-white border border-neutral-700 
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-700 outline-none"
        />

        {/* Roles */}
        <div className="p-4 rounded-lg bg-neutral-800 border border-neutral-700">
          <p className="text-neutral-400 text-sm mb-2">Funções do Usuário</p>

          <div className="flex gap-2 flex-wrap">
            {profile.roles.map((role) => (
              <span
                key={role.id}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-green-700/30 text-green-300 border border-green-700"
              >
                {role.name}
              </span>
            ))}
          </div>
        </div>

        {/* Button */}
        <button
          type="submit"
          className="w-full py-3 rounded-lg text-white font-semibold
                     bg-gradient-to-r from-blue-500 to-blue-600
                     hover:from-blue-600 hover:to-blue-700
                     transition shadow-md shadow-blue-600/20"
        >
          Salvar
        </button>

        {/* Mensagem */}
        {msg && (
          <p className="text-center text-green-400 mt-2 font-medium">{msg}</p>
        )}
      </form>

      {/* ------------------- Dates ------------------- */}
      <div className="text-neutral-500 text-xs mt-6 space-y-1">
        <p>Criado em: {createdAtFormatted}</p>
        <p>Atualizado em: {updatedAtFormatted}</p>
      </div>
    </div>
  );
}
