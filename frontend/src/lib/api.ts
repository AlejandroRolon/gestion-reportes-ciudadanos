export type User = { 
  id: number; 
  nombreCompleto: string; 
  email: string; 
  rol: "CIUDADANO" | "ADMINISTRADOR" };

export type Reporte = {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: string; 
  ubicacion: string;
  prioridad: string;
  estado: string;
  usuarioId: number;
  usuarioNombre: string; 
  fechaCreacion: string; 
  fechaActualizacion: string;
  comentarios: Comentario[];
};

export type Comentario = { id: number; texto: string; fechaCreacion: string; usuario: User };

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export function authHeaders(password: string, email: string) {
  return { Authorization: `Basic ${btoa(`${email}:${password}`)}`, "Content-Type": "application/json" };
}

export async function api<T>(path: string, password: string, email: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...authHeaders(password, email), ...(init.headers || {}) },
  });
  if (!response.ok) {
    let message = "Ocurrió un error";
    try { message = (await response.json()).error || message; } catch {}
    throw new Error(message);
  }
  return response.status === 204 ? (undefined as T) : response.json();
}
