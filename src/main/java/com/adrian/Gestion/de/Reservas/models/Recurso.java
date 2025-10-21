package com.adrian.Gestion.de.Reservas.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@Table(name = "recursos")
@NoArgsConstructor
public class Recurso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private Tipo tipo;

    @Lob
    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;
    private int capacidad;
    private Boolean estado;

    @OneToMany(mappedBy = "recurso", cascade = CascadeType.ALL)
    private List<Reserva> reservas;


    public enum Tipo {
        SALON, OFICINA, AUDITORIO, LABORATORIO, VEHICULO;
    }

    public void addReserva(Reserva reserva) {
        this.reservas.add(reserva);
        reserva.setRecurso(this);
    }

    public void removeReserva(Reserva reserva) {
        this.reservas.remove(reserva);
        reserva.setRecurso(null);
    }
}
