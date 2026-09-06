const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function request(endpoint: string, options: RequestInit = {}, isFormData = false) {
  const token = localStorage.getItem("aegis_token");
  const headers: any = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || data.error || "API request failed");
  }
  return data.data;
}

export const api = {
  get: (endpoint: string) => request(endpoint, { method: "GET" }),
  post: (endpoint: string, body: any) => request(endpoint, { method: "POST", body: JSON.stringify(body) }),
  postFormData: (endpoint: string, formData: FormData) => request(endpoint, { method: "POST", body: formData }, true),
  put: (endpoint: string, body?: any) => request(endpoint, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: (endpoint: string) => request(endpoint, { method: "DELETE" })
};
