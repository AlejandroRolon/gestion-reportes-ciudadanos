import { CATEGORIES, PRIORITIES, STATES, label } from "@/lib/ui";

type FiltrosReportesProps = {
  busqueda: string;
  estado: string;
  categoria: string;
  prioridad: string;
  onBusquedaChange: (value: string) => void;
  onEstadoChange: (value: string) => void;
  onCategoriaChange: (value: string) => void;
  onPrioridadChange: (value: string) => void;
};

export default function FiltrosReportes({ busqueda, estado, categoria, prioridad, onBusquedaChange, onEstadoChange, onCategoriaChange, onPrioridadChange }: FiltrosReportesProps) {
  return (
    <div className="filters">
      <input className="search" value={busqueda} onChange={event => onBusquedaChange(event.target.value)} placeholder="Buscar por título o descripción..." />
      <select value={estado} onChange={event => onEstadoChange(event.target.value)}><option value="">Estado</option>{STATES.map(value => <option key={value} value={value}>{label(value)}</option>)}</select>
      <select value={categoria} onChange={event => onCategoriaChange(event.target.value)}><option value="">Categoría</option>{CATEGORIES.map(value => <option key={value} value={value}>{label(value)}</option>)}</select>
      <select value={prioridad} onChange={event => onPrioridadChange(event.target.value)}><option value="">Prioridad</option>{PRIORITIES.map(value => <option key={value} value={value}>{label(value)}</option>)}</select>
    </div>
  );
}