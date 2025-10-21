package com.adrian.Gestion.de.Reservas.repositories;

import com.adrian.Gestion.de.Reservas.models.Recurso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecursoRepo extends JpaRepository<Recurso, Long> {

    @Query("SELECT r.id, r.tipo FROM Recurso r WHERE r.estado = :estado")
    List<Object[]> buscarRecursosPorDisponibilidad(@Param("estado") Boolean estado);
}
