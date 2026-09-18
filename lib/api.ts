export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"

export async function fetchJson<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      cache: "no-store",
    })

    if (!response.ok) {
      return null
    }

    const contentType = response.headers.get("content-type") || ""

    if (!contentType.includes("application/json")) {
      return null
    }

    return (await response.json()) as T
  } catch {
    return null
  }
}