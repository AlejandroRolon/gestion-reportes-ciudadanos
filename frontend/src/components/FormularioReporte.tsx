import type { FormEvent } from "react";
import type { ReportFormValues } from "@/lib/ui";
import { CATEGORIES, PRIORITIES, label } from "@/lib/ui";

type FormularioReporteProps = {
  reporte: ReportFormValues;
  error: string;
  cargando: boolean;
  onChange: (field: keyof ReportFormValues, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancelar: () => void;
};

export default function FormularioReporte({ reporte, error, cargando, onChange, onSubmit, onCancelar }: FormularioReporteProps) {
  return (
    <div className="create-wrap">
      <button className="back-button" onClick={onCancelar}>← Volver</button>
      <div className="page-heading"><span className="eyebrow">NUEVA INCIDENCIA</span><h1>Crear reporte</h1><p>Completa la información para que podamos atender tu solicitud.</p></div>
      {error && <div className="notice">{error}</div>}
      <form noValidate className="report-form" onSubmit={onSubmit}>
        <label>Título del reporte<input value={reporte.titulo} onChange={event => onChange("titulo", event.target.value)} placeholder="Resume brevemente la incidencia" maxLength={150} /></label>
        <label>Descripción<textarea value={reporte.descripcion} onChange={event => onChange("descripcion", event.target.value)} placeholder="Describe qué ocurrió, cuándo y cómo afecta a la comunidad" maxLength={3000} /></label>
        <div className="form-grid">
          <label>Categoría<select value={reporte.categoria} onChange={event => onChange("categoria", event.target.value)}>{CATEGORIES.map(category => <option key={category} value={category}>{label(category)}</option>)}</select></label>
          <label>Prioridad<select value={reporte.prioridad} onChange={event => onChange("prioridad", event.target.value)}>{PRIORITIES.map(priority => <option key={priority} value={priority}>{label(priority)}</option>)}</select></label>
        </div>
        <label>Ubicación<input value={reporte.ubicacion} onChange={event => onChange("ubicacion", event.target.value)} placeholder="Ej. Calle 22 con Carrera 5, Santa Marta" maxLength={255} /></label>
        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={onCancelar}>Cancelar</button>
          <button className="primary-button" disabled={cargando}>{cargando ? "Enviando..." : "Enviar reporte"}</button>
        </div>
      </form>
    </div>
  );
}