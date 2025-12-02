/* eslint-disable @typescript-eslint/no-explicit-any */
export async function apiFetch(
  input: string,
  init?: RequestInit
): Promise<Response> {
  if (typeof window === "undefined") {
    throw new Error("apiFetch só pode ser usado no client-side");
  }

  init = init || {};
  const token = localStorage.getItem("accessToken") ?? "";

  init.headers = {
    ...(init.headers || {}),
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };
  init.credentials = "include";

  let res = await fetch(input, init);

  // Se retornou 401, tenta refresh
  if (res.status === 401) {
    const selector = localStorage.getItem("selector");
    const oldToken = localStorage.getItem("refreshToken");

    if (!selector || !oldToken) return res;

    const refreshRes = await fetch("/api/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selector, oldToken }),
    });

    if (!refreshRes.ok) return res;

    const data = await refreshRes.json();
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("selector", data.selector);
    localStorage.setItem("refreshToken", data.refreshToken);

    // repetir requisição original
    init.headers = {
      ...init.headers,
      Authorization: `Bearer ${data.accessToken}`,
    };
    res = await fetch(input, init);
  }

  return res;
}
