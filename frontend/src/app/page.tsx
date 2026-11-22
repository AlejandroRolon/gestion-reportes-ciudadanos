"use client";

import { FormEvent, useEffect, useState } from "react";
import { API_URL, api } from "@/lib/api";
import type { Reporte } from "@/lib/api";
import PantallaAutenticacion from "@/components/PantallaAutenticacion";
import BarraLateral from "@/components/BarraLateral";
import EncabezadoReportes from "@/components/EncabezadoReportes";
import FiltrosReportes from "@/components/FiltrosReportes";
import FormularioReporte from "@/components/FormularioReporte";
import ListaReportes from "@/components/ListaReportes";
import PanelDetalleReporte from "@/components/PanelDetalleReporte";
import { EMAIL_PATTERN, EMPTY_AUTH_FORM, EMPTY_REPORT_FORM } from "@/lib/ui";
import type { AppView, AuthFormValues, AuthMode, ReportFormValues, UserSession } from "@/lib/ui";

export default function Home() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [view, setView] = useState<AppView>("auth");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [form, setForm] = useState<AuthFormValues>(EMPTY_AUTH_FORM);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [selected, setSelected] = useState<Reporte | null>(null);
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("");
  const [categoria, setCategoria] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [newReporte, setNewReporte] = useState<ReportFormValues>(EMPTY_REPORT_FORM);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("ciudadano-session");
    if (saved) {
      const s = JSON.parse(saved); setSession(s); setView("dashboard");
    }
  }, []);

  useEffect(() => { if (session) cargarReportes(); }, [session]);

  async function cargarReportes() {
    if (!session) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("buscar", search);
      if (estado) params.set("estado", estado);
      if (categoria) params.set("categoria", categoria);
      if (prioridad) params.set("prioridad", prioridad);
      const data = await api<Reporte[]>(`/api/reportes${params.size ? `?${params}` : ""}`, session.password, session.email);
      setReportes(data); if (selected) setSelected(data.find(r => r.id === selected.id) || null);
    } catch (e) { setError((e as Error).message); } finally { setLoading(false); }
  }

  useEffect(() => {
    if (!session) return;
    const timer = setTimeout(cargarReportes, 250); return () => clearTimeout(timer);
  }, [search, estado, categoria, prioridad]);

  async function submitAuth(e: FormEvent) {
    e.preventDefault(); setError("");
    const email = form.email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email)) { setError("Ingresa un correo electrónico válido."); return; }
    if (!form.password) { setError("Escribe tu contraseña."); return; }
    if (authMode === "register") {
      const nombre = form.nombreCompleto.trim();
      if (nombre.length < 3 || nombre.length > 120) { setError("El nombre debe tener entre 3 y 120 caracteres."); return; }
      if (form.password.length < 8 || form.password.length > 72) { setError("La contraseña debe tener entre 8 y 72 caracteres."); return; }
    }
    setLoading(true);
    try {
      if (authMode === "register") {
        const res = await fetch(`${API_URL}/api/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, nombreCompleto: form.nombreCompleto.trim(), email }) });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || "No se pudo crear la cuenta");
        }
        setForm({ ...EMPTY_AUTH_FORM }); setMostrarPassword(false); setAuthMode("login"); setError("Cuenta creada. Inicia sesión.");
      } else {
        const res = await fetch(`${API_URL}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password: form.password }) });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || "Email o contraseña incorrectos");
        }
        const user = await res.json(); const s = { user, email, password: form.password };
        localStorage.setItem("ciudadano-session", JSON.stringify(s)); setForm({ ...EMPTY_AUTH_FORM }); setMostrarPassword(false); setSession(s); setView("dashboard");
      }
    } catch (e) {
      const message = (e as Error).message;
      const lowerMessage = message.toLowerCase();
      if (authMode === "login" && (lowerMessage.includes("credenciales inválidas") || lowerMessage.includes("correo o contraseña") || lowerMessage.includes("email o contraseña"))) {
        setError("Correo o contraseña incorrecta");
      } else {
        setError(message.includes("fetch") ? "No se pudo conectar con el servidor. Verifica que el backend esté iniciado en el puerto 8080." : message);
      }
    } finally { setLoading(false); }
  }

  function logout() {
    if (session) {
      fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Basic ${btoa(`${session.email}:${session.password}`)}` },
      }).catch(() => undefined);
    }
    localStorage.removeItem("ciudadano-session");
    setSession(null); setSelected(null); setForm({ ...EMPTY_AUTH_FORM }); setMostrarPassword(false); setAuthMode("login"); setError(""); setView("auth");
  }

  async function crearReporte(e: FormEvent) {
    e.preventDefault(); if (!session) return; setError("");
    const titulo = newReporte.titulo.trim();
    const descripcion = newReporte.descripcion.trim();
    const ubicacion = newReporte.ubicacion.trim();
    if (titulo.length < 5 || titulo.length > 150) { setError("El título debe tener entre 5 y 150 caracteres."); return; }
    if (descripcion.length < 10 || descripcion.length > 3000) { setError("La descripción debe tener entre 10 y 3000 caracteres."); return; }
    if (ubicacion.length < 5 || ubicacion.length > 255) { setError("La ubicación debe tener entre 5 y 255 caracteres."); return; }
    setLoading(true);
    try {
      await api("/api/reportes", session.password, session.email, { method: "POST", body: JSON.stringify({ ...newReporte, titulo, descripcion, ubicacion }) });
      setNewReporte({ ...EMPTY_REPORT_FORM });
      setView("dashboard"); await cargarReportes();
    } catch (e) { setError((e as Error).message); } finally { setLoading(false); }
  }

  async function actualizar(path: string, body: object) {
    if (!selected || !session) return;
    try {
      const data = await api<Reporte>(`/api/reportes/${selected.id}/${path}`, session.password, session.email, { method: "PATCH", body: JSON.stringify(body) });
      setSelected(data); await cargarReportes();
    } catch (e) { setError((e as Error).message); }
  }

  async function agregarComentario(e: FormEvent) {
    e.preventDefault(); if (!selected || !session) return;
    const texto = comment.trim();
    if (!texto) { setError("Escribe un comentario."); return; }
    if (texto.length > 2000) { setError("El comentario no puede superar los 2000 caracteres."); return; }
    try {
      await api(`/api/reportes/${selected.id}/comentarios`, session.password, session.email, { method: "POST", body: JSON.stringify({ texto }) });
      setComment(""); await cargarReportes();
      const detail = await api<Reporte>(`/api/reportes/${selected.id}`, session.password, session.email); setSelected(detail);
    } catch (e) { setError((e as Error).message); }
  }

  async function seleccionarReporte(id: number) {
    if (!session) return;
    try {
      const detail = await api<Reporte>(`/api/reportes/${id}`, session.password, session.email);
      setSelected(detail);
    } catch (e) { setError((e as Error).message); }
  }

  async function descargarPdf(id: number) {
    if (!session) return;
    const credentials = btoa(`${session.email}:${session.password}`);
    const res = await fetch(`${API_URL}/api/reportes/${id}/pdf`, { headers: { Authorization: `Basic ${credentials}` } });
    const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `reporte-${id}.pdf`; a.click(); URL.revokeObjectURL(url);
  }

  if (view === "auth") return <PantallaAutenticacion mode={authMode} form={form} showPassword={mostrarPassword} error={error} loading={loading} onSubmit={submitAuth} onFieldChange={(field, value) => setForm(current => ({ ...current, [field]: value }))} onTogglePassword={() => setMostrarPassword(value => !value)} onSwitchMode={() => {setAuthMode(mode => mode === "login" ? "register" : "login"); setForm({ ...EMPTY_AUTH_FORM }); setMostrarPassword(false); setError("");}} />;

  if (!session) return null;

  return (
    <main className="app-shell">
      <BarraLateral
        usuario={session.user}
        vista={view}
        hayReporteSeleccionado={selected !== null}
        onIrAReportes={() => {setSelected(null); setView("dashboard");}}
        onCrearReporte={() => {setNewReporte({ ...EMPTY_REPORT_FORM }); setError(""); setView("create");}}
        onCerrarSesion={logout}
      />

      <section className="content">
        {view === "create" ? (
          <FormularioReporte
            reporte={newReporte}
            error={error}
            cargando={loading}
            onChange={(field, value) => setNewReporte(current => ({ ...current, [field]: value }))}
            onSubmit={crearReporte}
            onCancelar={() => {setNewReporte({ ...EMPTY_REPORT_FORM }); setError(""); setView("dashboard");}}
          />
        ) : (
          <>
            <EncabezadoReportes esAdministrador={session.user.rol === "ADMINISTRADOR"} onCrearReporte={() => {setNewReporte({ ...EMPTY_REPORT_FORM }); setError(""); setView("create");}} />
            {error && <div className="notice">{error}</div>}
            {session.user.rol === "ADMINISTRADOR" && <FiltrosReportes busqueda={search} estado={estado} categoria={categoria} prioridad={prioridad} onBusquedaChange={setSearch} onEstadoChange={setEstado} onCategoriaChange={setCategoria} onPrioridadChange={setPrioridad} />}
            <div className="main-grid">
              <ListaReportes reportes={reportes} cargando={loading} esAdministrador={session.user.rol === "ADMINISTRADOR"} reporteSeleccionado={selected?.id ?? null} onSeleccionar={seleccionarReporte} />
              {selected && <PanelDetalleReporte
                reporte={selected}
                esAdministrador={session.user.rol === "ADMINISTRADOR"}
                comentario={comment}
                onCerrar={() => setSelected(null)}
                onCambiarEstado={value => actualizar("estado", { estado: value })}
                onCambiarPrioridad={value => actualizar("prioridad", { prioridad: value })}
                onDescargarPdf={() => descargarPdf(selected.id)}
                onComentarioChange={setComment}
                onEnviarComentario={agregarComentario}
              />}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
