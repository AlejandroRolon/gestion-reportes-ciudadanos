"use client";

import { FormEvent, useEffect, useState } from "react";
import { API_URL, api, Reporte, User } from "@/lib/api";

const categorias = ["INFRAESTRUCTURA", "SEGURIDAD", "AMBIENTAL", "SERVICIOS_PUBLICOS", "OTROS"];
const estados = ["NUEVO", "EN_REVISION", "EN_PROCESO", "RESUELTO", "CERRADO"];
const prioridades = ["BAJA", "MEDIA", "ALTA"];
const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const formularioAuthVacio = { nombreCompleto: "", email: "", password: "" };
const reporteVacio = { titulo: "", descripcion: "", categoria: "INFRAESTRUCTURA", ubicacion: "", prioridad: "MEDIA" };

const label = (value: string) => value.replaceAll("_", " ").toLowerCase().replace(/(^| )\w/g, c => c.toUpperCase());

export default function Home() {
  const [session, setSession] = useState<{ user: User; email: string; password: string } | null>(null);
  const [view, setView] = useState<"auth" | "dashboard" | "create">("auth");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState(formularioAuthVacio);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [selected, setSelected] = useState<Reporte | null>(null);
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("");
  const [categoria, setCategoria] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [newReporte, setNewReporte] = useState(reporteVacio);
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
    if (!correoRegex.test(email)) { setError("Ingresa un correo electrónico válido."); return; }
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
        setForm({ ...formularioAuthVacio }); setMostrarPassword(false); setAuthMode("login"); setError("Cuenta creada. Inicia sesión.");
      } else {
        const res = await fetch(`${API_URL}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password: form.password }) });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || "Email o contraseña incorrectos");
        }
        const user = await res.json(); const s = { user, email, password: form.password };
        localStorage.setItem("ciudadano-session", JSON.stringify(s)); setForm({ ...formularioAuthVacio }); setMostrarPassword(false); setSession(s); setView("dashboard");
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
    setSession(null); setSelected(null); setForm({ ...formularioAuthVacio }); setMostrarPassword(false); setAuthMode("login"); setError(""); setView("auth");
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
      setNewReporte({ ...reporteVacio });
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

  async function descargarPdf(id: number) {
    if (!session) return;
    const credentials = btoa(`${session.email}:${session.password}`);
    const res = await fetch(`${API_URL}/api/reportes/${id}/pdf`, { headers: { Authorization: `Basic ${credentials}` } });
    const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `reporte-${id}.pdf`; a.click(); URL.revokeObjectURL(url);
  }

  if (view === "auth") return (
    <main className="auth-page">
      <section className="auth-showcase">
        <div className="brand"><span className="brand-mark">R</span><span>ReporteYa</span></div>
        <div className="showcase-copy"><span className="eyebrow">GESTIÓN CIUDADANA</span><h1>Tu voz mejora<br/>nuestra ciudad.</h1><p>Reporta incidencias, conoce su avance y ayuda a construir comunidades más seguras.</p></div>
        <div className="showcase-stats"><div><strong>24/7</strong><span>Reportes disponibles</span></div><div><strong>5</strong><span>Estados de seguimiento</span></div></div>
      </section>
      <section className="auth-panel">
        <div className="auth-box">
          <div className="mobile-brand"><span className="brand-mark">R</span> ReporteYa</div>
          <span className="eyebrow">{authMode === "login" ? "BIENVENIDO" : "ÚNETE A LA PLATAFORMA"}</span>
          <h2>{authMode === "login" ? "Inicia sesión" : "Crea tu cuenta"}</h2>
          <p className="auth-subtitle">{authMode === "login" ? "Ingresa tus datos para continuar" : "Solo necesitas tu correo y una contraseña"}</p>
          {error && <div className={error.includes("creada") ? "notice success" : "notice"}>{error}</div>}
          <form noValidate onSubmit={submitAuth}>
            {authMode === "register" && <label>Nombre completo<input value={form.nombreCompleto} onChange={e => setForm({...form, nombreCompleto: e.target.value})} placeholder="Ej. María Pérez" autoComplete="name" /></label>}
            <label>Correo electrónico<input type="email" inputMode="email" autoComplete="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="nombre@correo.com" /></label>
            <label>Contraseña<div className="password-field"><input type={mostrarPassword ? "text" : "password"} autoComplete={authMode === "login" ? "current-password" : "new-password"} value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Mínimo 8 caracteres" />{form.password.length > 0 && <button type="button" className="password-toggle" aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"} title={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={() => setMostrarPassword(!mostrarPassword)}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{mostrarPassword ? <><path d="M3 3l18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.2 0 8.5 4.8 9 7-.2 1-1 2.2-2.2 3.3"/><path d="M6.2 6.2C3.9 7.7 2.3 10.1 2 12c.5 2.2 3.8 7 10 7 1.2 0 2.3-.2 3.3-.6"/></> : <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>}</svg></button>}</div></label>
            <button className="primary-button" disabled={loading}>{loading ? "Procesando..." : authMode === "login" ? "Ingresar" : "Crear cuenta"}</button>
          </form>
          <p className="switch-auth">{authMode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"} <button onClick={() => {setAuthMode(authMode === "login" ? "register" : "login"); setForm({ ...formularioAuthVacio }); setMostrarPassword(false); setError("");}}>{authMode === "login" ? "Regístrate" : "Inicia sesión"}</button></p>
        </div>
      </section>
    </main>
  );

  if (!session) return null;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand sidebar-brand"><span className="brand-mark">R</span><span>ReporteYa</span></div>
        <nav>
          <button className={!selected && view === "dashboard" ? "nav-item active" : "nav-item"} onClick={() => {setSelected(null); setView("dashboard");}}>▦ <span>{session.user.rol === "ADMINISTRADOR" ? "Reportes" : "Mis reportes"}</span></button>
          {session.user.rol === "CIUDADANO" && <button className={view === "create" ? "nav-item active" : "nav-item"} onClick={() => {setNewReporte({ ...reporteVacio }); setError(""); setView("create");}}>＋ <span>Nuevo reporte</span></button>}
        </nav>
        <div className="profile"><div className="avatar">{session.user.nombreCompleto.charAt(0)}</div><div><strong>{session.user.nombreCompleto}</strong><span>{label(session.user.rol)}</span></div><button type="button" className="logout-button" onClick={logout} title="Cerrar sesión" aria-label="Cerrar sesión"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></svg><span>Cerrar sesión</span></button></div>
      </aside>

      <section className="content">
        {view === "create" ? (
          <div className="create-wrap">
            <button className="back-button" onClick={() => {setNewReporte({ ...reporteVacio }); setError(""); setView("dashboard");}}>← Volver</button>
            <div className="page-heading"><span className="eyebrow">NUEVA INCIDENCIA</span><h1>Crear reporte</h1><p>Completa la información para que podamos atender tu solicitud.</p></div>
            {error && <div className="notice">{error}</div>}
            <form noValidate className="report-form" onSubmit={crearReporte}>
              <label>Título del reporte<input value={newReporte.titulo} onChange={e => setNewReporte({...newReporte, titulo: e.target.value})} placeholder="Resume brevemente la incidencia" maxLength={150} /></label>
              <label>Descripción<textarea value={newReporte.descripcion} onChange={e => setNewReporte({...newReporte, descripcion: e.target.value})} placeholder="Describe qué ocurrió, cuándo y cómo afecta a la comunidad" maxLength={3000} /></label>
              <div className="form-grid"><label>Categoría<select value={newReporte.categoria} onChange={e => setNewReporte({...newReporte, categoria: e.target.value})}>{categorias.map(c => <option key={c} value={c}>{label(c)}</option>)}</select></label><label>Prioridad<select value={newReporte.prioridad} onChange={e => setNewReporte({...newReporte, prioridad: e.target.value})}>{prioridades.map(p => <option key={p} value={p}>{label(p)}</option>)}</select></label></div>
              <label>Ubicación<input value={newReporte.ubicacion} onChange={e => setNewReporte({...newReporte, ubicacion: e.target.value})} placeholder="Ej. Calle 22 con Carrera 5, Santa Marta" maxLength={255} /></label>
              <div className="form-actions"><button type="button" className="secondary-button" onClick={() => {setNewReporte({ ...reporteVacio }); setError(""); setView("dashboard");}}>Cancelar</button><button className="primary-button" disabled={loading}>{loading ? "Enviando..." : "Enviar reporte"}</button></div>
            </form>
          </div>
        ) : (
          <>
            <header className="topbar"><div><span className="eyebrow">CENTRO DE REPORTES</span><h1>{session.user.rol === "ADMINISTRADOR" ? "Todos los reportes" : "Mis reportes"}</h1></div>{session.user.rol === "CIUDADANO" && <button className="primary-button compact" onClick={() => {setNewReporte({ ...reporteVacio }); setError(""); setView("create");}}>＋ Nuevo reporte</button>}</header>
            {error && <div className="notice">{error}</div>}
            {session.user.rol === "ADMINISTRADOR" && <div className="filters"><input className="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por título o descripción..." /><select value={estado} onChange={e => setEstado(e.target.value)}><option value="">Estado</option>{estados.map(v => <option key={v} value={v}>{label(v)}</option>)}</select><select value={categoria} onChange={e => setCategoria(e.target.value)}><option value="">Categoría</option>{categorias.map(v => <option key={v} value={v}>{label(v)}</option>)}</select><select value={prioridad} onChange={e => setPrioridad(e.target.value)}><option value="">Prioridad</option>{prioridades.map(v => <option key={v} value={v}>{label(v)}</option>)}</select></div>}
            <div className="main-grid">
              <div className="report-list">
                {loading ? <div className="empty-state">Cargando reportes...</div> : reportes.length === 0 ? <div className="empty-state"><span>◎</span><h3>No hay reportes</h3><p>{session.user.rol === "CIUDADANO" ? "Crea tu primer reporte ciudadano." : "Ajusta los filtros de búsqueda."}</p></div> : reportes.map(r => (
                  <article key={r.id} className={selected?.id === r.id ? "report-card selected" : "report-card"} onClick={async () => { const detail = await api<Reporte>(`/api/reportes/${r.id}`, session.password, session.email); setSelected(detail); }}>
                    <div className="card-head"><span className={`status ${r.estado.toLowerCase()}`}>{label(r.estado)}</span><span className={`priority ${r.prioridad.toLowerCase()}`}>{label(r.prioridad)}</span></div>
                    <h3>{r.titulo}</h3><p>{r.descripcion}</p>
                    <div className="card-meta"><span>⌖ {r.ubicacion}</span><span>{new Date(r.fechaCreacion).toLocaleDateString("es-CO")}</span></div>
                  </article>
                ))}
              </div>

              {selected && <aside className="detail-panel"><button className="close-detail" onClick={() => setSelected(null)}>×</button><span className="eyebrow">REPORTE #{selected.id}</span><h2>{selected.titulo}</h2><p className="detail-description">{selected.descripcion}</p>
                <dl><div><dt>Categoría</dt><dd>{label(selected.categoria)}</dd></div><div><dt>Ubicación</dt><dd>{selected.ubicacion}</dd></div><div><dt>Ciudadano</dt><dd>{selected.usuarioNombre}</dd></div></dl>
                {session.user.rol === "ADMINISTRADOR" && <div className="admin-controls"><label>Estado<select value={selected.estado} onChange={e => actualizar("estado", {estado: e.target.value})}>{estados.map(v => <option key={v} value={v}>{label(v)}</option>)}</select></label><label>Prioridad<select value={selected.prioridad} onChange={e => actualizar("prioridad", {prioridad: e.target.value})}>{prioridades.map(v => <option key={v} value={v}>{label(v)}</option>)}</select></label><button className="pdf-button" onClick={() => descargarPdf(selected.id)}>⇩ Exportar PDF</button></div>}
                <div className="comments"><h3>Comentarios <span>{selected.comentarios?.length || 0}</span></h3>{selected.comentarios?.map(c => <div className="comment" key={c.id}><div className="avatar small">{c.usuario.nombreCompleto.charAt(0)}</div><div><strong>{c.usuario.nombreCompleto}</strong><p>{c.texto}</p></div></div>)}</div>
                <form noValidate className="comment-form" onSubmit={agregarComentario}><input value={comment} onChange={e => setComment(e.target.value)} placeholder="Escribe un comentario..." maxLength={2000} /><button>Enviar</button></form>
              </aside>}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
