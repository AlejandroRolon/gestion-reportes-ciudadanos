package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import com.example.demo.dto.ReporteDtos.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReporteService {
    private final ReporteRepository reportes;
    private final ComentarioRepository comentarios;

    public ReporteService(ReporteRepository reportes, ComentarioRepository comentarios) {
        this.reportes = reportes;
        this.comentarios = comentarios;
    }

    @Transactional
    public ReporteResponse crear(CrearReporteRequest req, Usuario usuario) {
        Reporte r = new Reporte();
        r.setTitulo(req.titulo()); r.setDescripcion(req.descripcion());
        r.setCategoria(req.categoria()); r.setUbicacion(req.ubicacion());
        r.setPrioridad(req.prioridad()); r.setUsuario(usuario);
        r.setEstado(Estado.NUEVO);
        return ReporteResponse.from(reportes.save(r));
    }

    @Transactional(readOnly = true)
    public List<ReporteResponse> propios(Long usuarioId) {
        return reportes.findByUsuarioIdOrderByFechaCreacionDesc(usuarioId).stream()
            .map(ReporteResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<ReporteResponse> todos(String estado, String categoria, String prioridad, String buscar) {
        Specification<Reporte> spec = (root, query, cb) -> cb.conjunction();
        if (estado != null && !estado.isBlank()) spec = spec.and((root, q, cb) -> cb.equal(root.get("estado"), Estado.valueOf(estado.toUpperCase())));
        if (categoria != null && !categoria.isBlank()) spec = spec.and((root, q, cb) -> cb.equal(root.get("categoria"), Categoria.valueOf(categoria.toUpperCase())));
        if (prioridad != null && !prioridad.isBlank()) spec = spec.and((root, q, cb) -> cb.equal(root.get("prioridad"), Prioridad.valueOf(prioridad.toUpperCase())));
        if (buscar != null && !buscar.isBlank()) {
            String pattern = "%" + buscar.toLowerCase() + "%";
            spec = spec.and((root, q, cb) -> cb.or(cb.like(cb.lower(root.get("titulo")), pattern), cb.like(cb.lower(root.get("descripcion")), pattern)));
        }
        var lista = reportes.findAll(spec);
        lista.sort((a,b) -> b.getFechaCreacion().compareTo(a.getFechaCreacion()));
        return lista.stream().map(ReporteResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ReporteResponse obtener(Long id) { return ReporteResponse.from(obtenerEntidad(id)); }

    private Reporte obtenerEntidad(Long id) {
        return reportes.findById(id).orElseThrow(() -> new IllegalArgumentException("Reporte no encontrado"));
    }

    @Transactional
    public ReporteResponse cambiarEstado(Long id, Estado estado) {
        Reporte r = obtenerEntidad(id); r.setEstado(estado); r.setFechaActualizacion(LocalDateTime.now());
        return ReporteResponse.from(reportes.save(r));
    }

    @Transactional
    public ReporteResponse cambiarPrioridad(Long id, Prioridad prioridad) {
        Reporte r = obtenerEntidad(id); r.setPrioridad(prioridad); r.setFechaActualizacion(LocalDateTime.now());
        return ReporteResponse.from(reportes.save(r));
    }

    @Transactional
    public ComentarioResponse comentar(Long id, Usuario usuario, String texto) {
        Reporte r = obtenerEntidad(id);
        Comentario c = new Comentario(); c.setReporte(r); c.setUsuario(usuario); c.setTexto(texto); comentarios.save(c); r.getComentarios().add(c);
        r.setFechaActualizacion(LocalDateTime.now()); reportes.save(r);
        return ComentarioResponse.from(c);
    }
}
