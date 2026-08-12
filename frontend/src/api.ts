export function apiUrl(path: string): string {
  const base = globalThis.__NJC_API_URL__ || "";
  return path.startsWith("/api") ? `${base}${path}` : path;
}

export function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const target = typeof input === "string" ? apiUrl(input) : input;
  return globalThis.fetch(target, init);
}

export async function readJson<T = Record<string, unknown>>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text.trim()) {
    throw new Error(`The API returned an empty response (HTTP ${response.status}).`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`The API returned a non-JSON response (HTTP ${response.status}).`);
  }
}
