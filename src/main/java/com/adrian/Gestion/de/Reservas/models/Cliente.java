package com.adrian.Gestion.de.Reservas.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@Table(name = "clientes")
@NoArgsConstructor
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String apellido;
    private String email;
    private String telefono;

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL)
    private List<Reserva> reservas;

    public void addReserva(Reserva reserva) {
        this.reservas.add(reserva);
        reserva.setCliente(this);
    }

    public void removeReserva(Reserva reserva) {
        this.reservas.remove(reserva);
        reserva.setCliente(null);
    }
}
