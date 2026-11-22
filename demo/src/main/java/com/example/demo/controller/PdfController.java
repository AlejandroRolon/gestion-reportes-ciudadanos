package com.example.demo.controller;

import com.example.demo.model.Role;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.service.ReporteService;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reportes")
public class PdfController {
    private final ReporteService service;
    private final UsuarioRepository usuarios;

    public PdfController(ReporteService service, UsuarioRepository usuarios) { this.service = service; this.usuarios = usuarios; }

    @GetMapping("/{id}/pdf")
    public void pdf(@PathVariable Long id, Authentication auth, HttpServletResponse response) throws Exception {
        var u = usuarios.findByEmail(auth.getName()).orElseThrow();
        if (u.getRole() != Role.ADMINISTRADOR) throw new AccessDeniedException("Solo administradores pueden exportar reportes");
        var r = service.obtener(id);
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=reporte-" + id + ".pdf");
        Document doc = new Document();
        PdfWriter.getInstance(doc, response.getOutputStream()); doc.open();
        doc.add(new Paragraph("Reporte ciudadano #" + r.id()));
        doc.add(new Paragraph("Título: " + r.titulo()));
        doc.add(new Paragraph("Descripción: " + r.descripcion()));
        doc.add(new Paragraph("Categoría: " + r.categoria()));
        doc.add(new Paragraph("Ubicación: " + r.ubicacion()));
        doc.add(new Paragraph("Prioridad: " + r.prioridad()));
        doc.add(new Paragraph("Estado: " + r.estado()));
        doc.add(new Paragraph("Ciudadano: " + r.usuarioNombre()));
        doc.close();
    }
}
