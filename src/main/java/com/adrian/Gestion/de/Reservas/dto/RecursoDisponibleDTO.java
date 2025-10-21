package com.adrian.Gestion.de.Reservas.dto;

import com.adrian.Gestion.de.Reservas.models.Recurso;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class RecursoDisponibleDTO {

    private Long id;
    private Recurso.Tipo tipo;
}
