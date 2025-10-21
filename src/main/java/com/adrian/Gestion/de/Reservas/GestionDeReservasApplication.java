package com.adrian.Gestion.de.Reservas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GestionDeReservasApplication {

    public static void main(String[] args) {
        SpringApplication.run(GestionDeReservasApplication.class, args);
    }

}
