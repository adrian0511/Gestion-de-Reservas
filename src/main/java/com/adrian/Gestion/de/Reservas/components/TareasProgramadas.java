package com.adrian.Gestion.de.Reservas.components;

import com.adrian.Gestion.de.Reservas.services.ReservaService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;


@Component
public class TareasProgramadas {

    private static final Logger log = LoggerFactory.getLogger(TareasProgramadas.class);

    @Autowired
    private ReservaService reservaService;

    @Scheduled(fixedRate = 30000)
    public void actualizarReservasVencidas() {
        try {
            reservaService.actualizarReservas();
        } catch (Exception e) {
            log.error("Ha ocurrido un error");
        }
    }
}
