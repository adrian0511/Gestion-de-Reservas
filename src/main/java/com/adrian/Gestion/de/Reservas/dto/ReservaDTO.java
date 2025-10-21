package com.adrian.Gestion.de.Reservas.dto;

import com.adrian.Gestion.de.Reservas.models.Reserva;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ReservaDTO {

    private Long id;
    private LocalDate fechaReserva;
    private LocalDateTime horaInicio;
    private LocalDateTime horaFin;
    private Reserva.Estado estado;
    private Long id_recurso;
    private Long id_cliente;
}
