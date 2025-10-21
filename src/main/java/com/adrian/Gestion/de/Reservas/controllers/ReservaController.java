package com.adrian.Gestion.de.Reservas.controllers;

import com.adrian.Gestion.de.Reservas.dto.ReservaDTO;
import com.adrian.Gestion.de.Reservas.services.ReservaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reserva")
public class ReservaController {

    @Autowired
    private ReservaService reservaService;

    @PostMapping()
    public ResponseEntity<ReservaDTO> crearReserva(@RequestBody ReservaDTO reservaDTO) {
        return ResponseEntity.ok(reservaService.crearReserva(reservaDTO));
    }

    @GetMapping
    public ResponseEntity<List<ReservaDTO>> listarReservas() {
        return ResponseEntity.ok(reservaService.listarReservas());
    }

    @PutMapping("/cancelar/{id}")
    public ResponseEntity<Void> cancelarReserva(@PathVariable Long id) {
        reservaService.cancelarReserva(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarReserva(@PathVariable Long id) {
        reservaService.eliminarReserva(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReservaDTO> editarReserva(@PathVariable Long id, @RequestBody ReservaDTO reservaDTO) {
        return ResponseEntity.ok(reservaService.editarReserva(id, reservaDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReservaDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(reservaService.findById(id));
    }

    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Long>> contarTotalReservas() {
        return ResponseEntity.ok(reservaService.estadisticas());
    }

    @GetMapping("/filter/cliente/{id}")
    public ResponseEntity<List<ReservaDTO>> findByClienteId(@PathVariable Long id) {
        return ResponseEntity.ok(reservaService.findByClienteId(id));
    }

    @GetMapping("/filter/recurso/{id}")
    public ResponseEntity<List<ReservaDTO>> findByRecursoId(@PathVariable Long id) {
        return ResponseEntity.ok(reservaService.findByRecursoId(id));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<ReservaDTO>> findByRecursoAndCliente(@RequestParam("id_recurso") Long id_recurso,
                                                                    @RequestParam("id_cliente") Long id_cliente) {
        return ResponseEntity.ok(reservaService.findByRecursoAndCliente(id_recurso, id_cliente));
    }
}
