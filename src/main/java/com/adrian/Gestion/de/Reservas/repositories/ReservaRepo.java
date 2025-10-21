package com.adrian.Gestion.de.Reservas.repositories;

import com.adrian.Gestion.de.Reservas.models.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservaRepo extends JpaRepository<Reserva, Long> {

    @Query("SELECT r FROM Reserva r WHERE r.recurso.id =:id AND r.fechaReserva =:fecha AND r.estado IN (:estados) AND " +
            "(:horaInicio < r.horaFin AND :horaFin > r.horaInicio)")
    List<Reserva> findReservasQueSolapan(@Param("id") Long id, @Param("fecha") LocalDate fecha, @Param("horaInicio") LocalDateTime horaInicio, @Param("horaFin") LocalDateTime horaFin, @Param("estados") List<Reserva.Estado> estados);

    List<Reserva> findByHoraFinBeforeAndEstadoIn(LocalDateTime fin, List<Reserva.Estado> estados);

    List<Reserva> findByHoraInicioBeforeAndHoraFinAfterAndEstado(LocalDateTime inicio, LocalDateTime fin, Reserva.Estado estado);

    Long countByEstado(Reserva.Estado estado);

    Long countByFechaReserva(LocalDate fecha);

    List<Reserva> findByClienteId(Long id);

    List<Reserva> findByRecursoId(Long id);

    List<Reserva> findByRecursoIdAndClienteId(Long recursoId, Long clienteId);
}
