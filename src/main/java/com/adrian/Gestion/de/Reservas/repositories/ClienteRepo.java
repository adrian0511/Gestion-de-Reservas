package com.adrian.Gestion.de.Reservas.repositories;

import com.adrian.Gestion.de.Reservas.models.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClienteRepo extends JpaRepository<Cliente, Long> {
}
