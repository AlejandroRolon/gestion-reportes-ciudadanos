package com.example.demo.controller;

import com.example.demo.dto.ReporteDtos.*;
import com.example.demo.model.*;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.service.ReporteService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {
    private final ReporteService service;
    private final UsuarioRepository usuarios;

    public ReporteController(ReporteService service, UsuarioRepository usuarios) { this.service = service; this.usuarios = usuarios; }

    private Usuario usuario(Authentication auth) { return usuarios.findByEmail(auth.getName()).orElseThrow(); }
    private boolean esAdmin(Authentication auth) { return auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMINISTRADOR")); }

    @PostMapping
    public ResponseEntity<ReporteResponse> crear(@Valid @RequestBody CrearReporteRequest req, Authentication auth) {
        Usuario u = usuario(auth); if (u.getRole() != Role.CIUDADANO) throw new AccessDeniedException("Solo ciudadanos pueden crear reportes");
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(req, u));
    }

    @GetMapping
    public List<ReporteResponse> listar(Authentication auth,
            @RequestParam(required=false) String estado,
            @RequestParam(required=false) String categoria,
            @RequestParam(required=false) String prioridad,
            @RequestParam(required=false) String buscar) {
        Usuario u = usuario(auth);
        if (esAdmin(auth)) return service.todos(estado, categoria, prioridad, buscar);
        return service.propios(u.getId());
    }

    @GetMapping("/{id}")
    public ReporteResponse detalle(@PathVariable Long id, Authentication auth) {
        ReporteResponse r = service.obtener(id); Usuario u = usuario(auth);
        if (!esAdmin(auth) && !r.usuarioId().equals(u.getId())) throw new AccessDeniedException("No puedes ver este reporte");
        return r;
    }

    @PatchMapping("/{id}/estado")
    public ReporteResponse estado(@PathVariable Long id, @Valid @RequestBody CambiarEstadoRequest req, Authentication auth) {
        if (!esAdmin(auth)) throw new AccessDeniedException("Solo administradores pueden cambiar el estado");
        return service.cambiarEstado(id, req.estado());
    }

    @PatchMapping("/{id}/prioridad")
    public ReporteResponse prioridad(@PathVariable Long id, @Valid @RequestBody CambiarPrioridadRequest req, Authentication auth) {
        if (!esAdmin(auth)) throw new AccessDeniedException("Solo administradores pueden cambiar la prioridad");
        return service.cambiarPrioridad(id, req.prioridad());
    }

    @PostMapping("/{id}/comentarios")
    public ResponseEntity<ComentarioResponse> comentar(@PathVariable Long id, @Valid @RequestBody ComentarioRequest req, Authentication auth) {
        ReporteResponse r = service.obtener(id); Usuario u = usuario(auth);
        if (!esAdmin(auth) && !r.usuarioId().equals(u.getId())) throw new AccessDeniedException("No puedes comentar este reporte");
        return ResponseEntity.status(HttpStatus.CREATED).body(service.comentar(id, u, req.texto()));
    }
}
