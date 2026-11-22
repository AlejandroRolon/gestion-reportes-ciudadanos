type EncabezadoReportesProps = {
  esAdministrador: boolean;
  onCrearReporte: () => void;
};

export default function EncabezadoReportes({ esAdministrador, onCrearReporte }: EncabezadoReportesProps) {
  return (
    <header className="topbar">
      <div><span className="eyebrow">CENTRO DE REPORTES</span><h1>{esAdministrador ? "Todos los reportes" : "Mis reportes"}</h1></div>
      {!esAdministrador && <button className="primary-button compact" onClick={onCrearReporte}>＋ Nuevo reporte</button>}
    </header>
  );
}