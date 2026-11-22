import type { User } from "@/lib/api";
import type { AppView } from "@/lib/ui";
import { label } from "@/lib/ui";

type BarraLateralProps = {
  usuario: User;
  vista: AppView;
  hayReporteSeleccionado: boolean;
  onIrAReportes: () => void;
  onCrearReporte: () => void;
  onCerrarSesion: () => void;
};

export default function BarraLateral({ usuario, vista, hayReporteSeleccionado, onIrAReportes, onCrearReporte, onCerrarSesion }: BarraLateralProps) {
  const esCiudadano = usuario.rol === "CIUDADANO";

  return (
    <aside className="sidebar">
      <div className="brand sidebar-brand"><span className="brand-mark">R</span><span>ReporteYa</span></div>
      <nav>
        <button className={!hayReporteSeleccionado && vista === "dashboard" ? "nav-item active" : "nav-item"} onClick={onIrAReportes}>▦ <span>{esCiudadano ? "Mis reportes" : "Reportes"}</span></button>
        {esCiudadano && <button className={vista === "create" ? "nav-item active" : "nav-item"} onClick={onCrearReporte}>＋ <span>Nuevo reporte</span></button>}
      </nav>
      <div className="profile">
        <div className="avatar">{usuario.nombreCompleto.charAt(0)}</div>
        <div><strong>{usuario.nombreCompleto}</strong><span>{label(usuario.rol)}</span></div>
        <button type="button" className="logout-button" onClick={onCerrarSesion} title="Cerrar sesión" aria-label="Cerrar sesión">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></svg>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}