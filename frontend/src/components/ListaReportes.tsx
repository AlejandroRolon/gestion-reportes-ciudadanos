import type { Reporte } from "@/lib/api";
import { label } from "@/lib/ui";

type ListaReportesProps = {
  reportes: Reporte[];
  cargando: boolean;
  esAdministrador: boolean;
  reporteSeleccionado: number | null;
  onSeleccionar: (id: number) => void;
};

export default function ListaReportes({ reportes, cargando, esAdministrador, reporteSeleccionado, onSeleccionar }: ListaReportesProps) {
  if (cargando) return <div className="empty-state">Cargando reportes...</div>;
  if (reportes.length === 0) {
    return <div className="empty-state"><span>◎</span><h3>No hay reportes</h3><p>{esAdministrador ? "Ajusta los filtros de búsqueda." : "Crea tu primer reporte ciudadano."}</p></div>;
  }

  return (
    <div className="report-list">
      {reportes.map(reporte => (
        <article key={reporte.id} className={reporteSeleccionado === reporte.id ? "report-card selected" : "report-card"} onClick={() => onSeleccionar(reporte.id)}>
          <div className="card-head"><span className={`status ${reporte.estado.toLowerCase()}`}>{label(reporte.estado)}</span><span className={`priority ${reporte.prioridad.toLowerCase()}`}>{label(reporte.prioridad)}</span></div>
          <h3>{reporte.titulo}</h3><p>{reporte.descripcion}</p>
          <div className="card-meta"><span>⌖ {reporte.ubicacion}</span><span>{new Date(reporte.fechaCreacion).toLocaleDateString("es-CO")}</span></div>
        </article>
      ))}
    </div>
  );
}