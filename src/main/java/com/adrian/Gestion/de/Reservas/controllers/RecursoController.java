package com.adrian.Gestion.de.Reservas.controllers;


import com.adrian.Gestion.de.Reservas.dto.RecursoDTO;
import com.adrian.Gestion.de.Reservas.dto.RecursoDisponibleDTO;
import com.adrian.Gestion.de.Reservas.services.RecursoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resource")
public class RecursoController {

    @Autowired
    private RecursoService recursoService;

    @PostMapping
    public ResponseEntity<RecursoDTO> crearRecurso(@RequestBody RecursoDTO recursoDTO) {
        return new ResponseEntity<>(recursoService.crearRecurso(recursoDTO), HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<RecursoDTO>> listar() {
        return new ResponseEntity<>(recursoService.listar(), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarRecurso(@PathVariable Long id) {
        recursoService.eliminarRecurso(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecursoDTO> editarRecurso(@PathVariable Long id, @RequestBody RecursoDTO recursoDTO) {
        return new ResponseEntity<>(recursoService.editarRecurso(id, recursoDTO), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecursoDTO> buscarId(@PathVariable Long id) {
        return new ResponseEntity<>(recursoService.buscarId(id), HttpStatus.OK);
    }

    @GetMapping("/disponibles")
    public ResponseEntity<List<RecursoDisponibleDTO>> listarDisponibles() {
        return ResponseEntity.ok(recursoService.buscarRecursosDispobibles());
    }
}
