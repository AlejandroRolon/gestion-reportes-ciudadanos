package com.example.demo.dto;

import com.example.demo.model.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;

public class ReporteDtos {
    public record CrearReporteRequest(
        @NotBlank(message = "Escribe el título del reporte.") @Size(min = 5, max = 150, message = "El título debe tener entre 5 y 150 caracteres.") String titulo,
        @NotBlank(message = "Describe la incidencia.") @Size(min = 10, max = 3000, message = "La descripción debe tener entre 10 y 3000 caracteres.") String descripcion,
        @NotNull(message = "Selecciona una categoría.") Categoria categoria,
        @NotBlank(message = "Indica la ubicación de la incidencia.") @Size(min = 5, max = 255, message = "La ubicación debe tener entre 5 y 255 caracteres.") String ubicacion,
        @NotNull(message = "Selecciona una prioridad.") Prioridad prioridad
    ) {}

    public record CambiarEstadoRequest(@NotNull(message = "Selecciona un estado válido.") Estado estado) {}
    public record CambiarPrioridadRequest(@NotNull(message = "Selecciona una prioridad válida.") Prioridad prioridad) {}
    public record ComentarioRequest(@NotBlank(message = "Escribe un comentario.") @Size(max = 2000, message = "El comentario no puede superar los 2000 caracteres.") String texto) {}

    public record ReporteResponse(
        Long id,
        String titulo,
        String descripcion,
        Categoria categoria,
        String ubicacion,
        Prioridad prioridad,
        Estado estado,
        Long usuarioId,
        String usuarioNombre,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaActualizacion,
        List<ComentarioResponse> comentarios
    ) {
        public static ReporteResponse from(Reporte reporte) {
            return new ReporteResponse(
                reporte.getId(), reporte.getTitulo(), reporte.getDescripcion(),
                reporte.getCategoria(), reporte.getUbicacion(), reporte.getPrioridad(),
                reporte.getEstado(), reporte.getUsuario().getId(),
                reporte.getUsuario().getNombreCompleto(), reporte.getFechaCreacion(),
                reporte.getFechaActualizacion(),
                reporte.getComentarios().stream().map(ComentarioResponse::from).toList()
            );
        }
    }

    public record ComentarioResponse(
        Long id,
        Long reporteId,
        AuthDtos.UsuarioResponse usuario,
        String texto,
        LocalDateTime fechaCreacion
    ) {
        public static ComentarioResponse from(Comentario comentario) {
            return new ComentarioResponse(
                comentario.getId(), comentario.getReporte().getId(),
                AuthDtos.UsuarioResponse.from(comentario.getUsuario()),
                comentario.getTexto(), comentario.getFechaCreacion()
            );
        }
    }
}
