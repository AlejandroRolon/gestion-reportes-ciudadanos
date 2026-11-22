package com.example.demo.repository;

import com.example.demo.model.*;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;
import java.util.Optional;

public interface ReporteRepository extends JpaRepository<Reporte, Long>, JpaSpecificationExecutor<Reporte> {
    @Override
    @EntityGraph(attributePaths = "comentarios")
    List<Reporte> findAll(org.springframework.data.jpa.domain.Specification<Reporte> spec);

    @Override
    @EntityGraph(attributePaths = "comentarios")
    Optional<Reporte> findById(Long id);

    @EntityGraph(attributePaths = "comentarios")
    List<Reporte> findByUsuarioIdOrderByFechaCreacionDesc(Long usuarioId);
}
