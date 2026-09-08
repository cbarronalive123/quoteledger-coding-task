import type { Item, ItemPayload } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data === "string") return data;
    if (data.detail) return String(data.detail);
    const parts = Object.entries(data).map(([key, value]) => {
      const message = Array.isArray(value) ? value.join(" ") : String(value);
      return `${key}: ${message}`;
    });
    return parts.join(" ") || response.statusText;
  } catch {
    return response.statusText || "Request failed";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  listItems: () => request<Item[]>("/items/"),
  getItem: (id: number) => request<Item>(`/items/${id}/`),
  createItem: (payload: ItemPayload) =>
    request<Item>("/items/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateItem: (id: number, payload: Partial<ItemPayload>) =>
    request<Item>(`/items/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteItem: (id: number) =>
    request<void>(`/items/${id}/`, {
      method: "DELETE",
    }),
};
