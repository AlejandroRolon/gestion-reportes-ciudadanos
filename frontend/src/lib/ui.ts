import type { User } from "@/lib/api";

export type AuthMode = "login" | "register";
export type AppView = "auth" | "dashboard" | "create";
export type AuthFormValues = { nombreCompleto: string; email: string; password: string };
export type ReportFormValues = { titulo: string; descripcion: string; categoria: string; ubicacion: string; prioridad: string };
export type UserSession = { user: User; email: string; password: string };

export const CATEGORIES = ["INFRAESTRUCTURA", "SEGURIDAD", "AMBIENTAL", "SERVICIOS_PUBLICOS", "OTROS"];
export const STATES = ["NUEVO", "EN_REVISION", "EN_PROCESO", "RESUELTO", "CERRADO"];
export const PRIORITIES = ["BAJA", "MEDIA", "ALTA"];
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const EMPTY_AUTH_FORM: AuthFormValues = { nombreCompleto: "", email: "", password: "" };
export const EMPTY_REPORT_FORM: ReportFormValues = { titulo: "", descripcion: "", categoria: "INFRAESTRUCTURA", ubicacion: "", prioridad: "MEDIA" };

export function label(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/(^| )\w/g, character => character.toUpperCase());
}