export const API = 'http://localhost:5080/api'
export type User = { id: string; fullName: string; email: string; role: string }
export type Room = { id: number; name: string; roomNumber: string; category: string; capacity: number; pricePerNight: number; description: string; imageUrl: string; status: string }
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...options, credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  })
  const data = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.message || data?.title || `Request failed (${response.status})`)
  return data as T
}
export const money = (n: number) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(n)
