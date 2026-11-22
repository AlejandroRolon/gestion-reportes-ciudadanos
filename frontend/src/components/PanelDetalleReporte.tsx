import type { FormEvent } from "react";
import type { Reporte } from "@/lib/api";
import { PRIORITIES, STATES, label } from "@/lib/ui";

type PanelDetalleReporteProps = {
  reporte: Reporte;
  esAdministrador: boolean;
  comentario: string;
  onCerrar: () => void;
  onCambiarEstado: (value: string) => void;
  onCambiarPrioridad: (value: string) => void;
  onDescargarPdf: () => void;
  onComentarioChange: (value: string) => void;
  onEnviarComentario: (event: FormEvent<HTMLFormElement>) => void;
};

export default function PanelDetalleReporte({ reporte, esAdministrador, comentario, onCerrar, onCambiarEstado, onCambiarPrioridad, onDescargarPdf, onComentarioChange, onEnviarComentario }: PanelDetalleReporteProps) {
  return (
    <aside className="detail-panel">
      <button className="close-detail" onClick={onCerrar} aria-label="Cerrar detalle">×</button>
      <span className="eyebrow">REPORTE #{reporte.id}</span><h2>{reporte.titulo}</h2><p className="detail-description">{reporte.descripcion}</p>
      <dl><div><dt>Categoría</dt><dd>{label(reporte.categoria)}</dd></div><div><dt>Ubicación</dt><dd>{reporte.ubicacion}</dd></div><div><dt>Ciudadano</dt><dd>{reporte.usuarioNombre}</dd></div></dl>
      {esAdministrador && <div className="admin-controls">
        <label>Estado<select value={reporte.estado} onChange={event => onCambiarEstado(event.target.value)}>{STATES.map(value => <option key={value} value={value}>{label(value)}</option>)}</select></label>
        <label>Prioridad<select value={reporte.prioridad} onChange={event => onCambiarPrioridad(event.target.value)}>{PRIORITIES.map(value => <option key={value} value={value}>{label(value)}</option>)}</select></label>
        <button className="pdf-button" onClick={onDescargarPdf}>⇩ Exportar PDF</button>
      </div>}
      <div className="comments"><h3>Comentarios <span>{reporte.comentarios?.length || 0}</span></h3>{reporte.comentarios?.map(item => <div className="comment" key={item.id}><div className="avatar small">{item.usuario.nombreCompleto.charAt(0)}</div><div><strong>{item.usuario.nombreCompleto}</strong><p>{item.texto}</p></div></div>)}</div>
      <form noValidate className="comment-form" onSubmit={onEnviarComentario}><input value={comentario} onChange={event => onComentarioChange(event.target.value)} placeholder="Escribe un comentario..." maxLength={2000} /><button>Enviar</button></form>
    </aside>
  );
}