import type { FormEvent } from "react";
import type { AuthFormValues, AuthMode } from "@/lib/ui";

type PantallaAutenticacionProps = {
  mode: AuthMode;
  form: AuthFormValues;
  showPassword: boolean;
  error: string;
  loading: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFieldChange: (field: keyof AuthFormValues, value: string) => void;
  onTogglePassword: () => void;
  onSwitchMode: () => void;
};

export default function PantallaAutenticacion({ mode, form, showPassword, error, loading, onSubmit, onFieldChange, onTogglePassword, onSwitchMode }: PantallaAutenticacionProps) {
  const isLogin = mode === "login";

  return (
    <main className="auth-page">
      <section className="auth-showcase">
        <div className="brand"><span className="brand-mark">R</span><span>ReporteYa</span></div>
        <div className="showcase-copy"><span className="eyebrow">GESTIÓN CIUDADANA</span><h1>Tu voz mejora<br />nuestra ciudad.</h1><p>Reporta incidencias, conoce su avance y ayuda a construir comunidades más seguras.</p></div>
        <div className="showcase-stats"><div><strong>24/7</strong><span>Reportes disponibles</span></div><div><strong>5</strong><span>Estados de seguimiento</span></div></div>
      </section>
      <section className="auth-panel">
        <div className="auth-box">
          <div className="mobile-brand"><span className="brand-mark">R</span> ReporteYa</div>
          <span className="eyebrow">{isLogin ? "BIENVENIDO" : "ÚNETE A LA PLATAFORMA"}</span>
          <h2>{isLogin ? "Inicia sesión" : "Crea tu cuenta"}</h2>
          <p className="auth-subtitle">{isLogin ? "Ingresa tus datos para continuar" : "Solo necesitas tu correo y una contraseña"}</p>
          {error && <div className={error.includes("creada") ? "notice success" : "notice"}>{error}</div>}
          <form noValidate onSubmit={onSubmit}>
            {!isLogin && <label>Nombre completo<input value={form.nombreCompleto} onChange={event => onFieldChange("nombreCompleto", event.target.value)} placeholder="Ej. María Pérez" autoComplete="name" /></label>}
            <label>Correo electrónico<input type="email" inputMode="email" autoComplete="email" value={form.email} onChange={event => onFieldChange("email", event.target.value)} placeholder="nombre@correo.com" /></label>
            <label>Contraseña<div className="password-field"><input type={showPassword ? "text" : "password"} autoComplete={isLogin ? "current-password" : "new-password"} value={form.password} onChange={event => onFieldChange("password", event.target.value)} placeholder="Mínimo 8 caracteres" />{form.password.length > 0 && <button type="button" className="password-toggle" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={onTogglePassword}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{showPassword ? <><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.2 0 8.5 4.8 9 7-.2 1-1 2.2-2.2 3.3" /><path d="M6.2 6.2C3.9 7.7 2.3 10.1 2 12c.5 2.2 3.8 7 10 7 1.2 0 2.3-.2 3.3-.6" /></> : <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>}</svg></button>}</div></label>
            <button className="primary-button" disabled={loading}>{loading ? "Procesando..." : isLogin ? "Ingresar" : "Crear cuenta"}</button>
          </form>
          <p className="switch-auth">{isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"} <button type="button" onClick={onSwitchMode}>{isLogin ? "Regístrate" : "Inicia sesión"}</button></p>
        </div>
      </section>
    </main>
  );
}
