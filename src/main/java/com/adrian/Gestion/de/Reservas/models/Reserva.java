package com.adrian.Gestion.de.Reservas.models;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "reservas")
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate fechaReserva;
    private LocalDateTime horaInicio;
    private LocalDateTime horaFin;

    @Enumerated(EnumType.STRING)
    private Estado estado;

    @ManyToOne
    private Cliente cliente;

    @ManyToOne
    private Recurso recurso;

    public enum Estado {
        PENDIENTE, ACTIVA, CANCELADA, FINALIZADA;
    }

}
