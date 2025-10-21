package com.adrian.Gestion.de.Reservas.services;

import com.adrian.Gestion.de.Reservas.dto.RecursoDTO;
import com.adrian.Gestion.de.Reservas.dto.RecursoDisponibleDTO;
import com.adrian.Gestion.de.Reservas.models.Recurso;
import com.adrian.Gestion.de.Reservas.models.Reserva;
import com.adrian.Gestion.de.Reservas.repositories.RecursoRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecursoService {

    @Autowired
    private RecursoRepo recursoRepo;

    public RecursoDTO crearRecurso(RecursoDTO recursoDTO) {
        Recurso recurso = new Recurso();
        recurso.setCapacidad(recursoDTO.getCapacidad());
        recurso.setTipo(recursoDTO.getTipo());
        recurso.setDescripcion(recursoDTO.getDescripcion());
        List<Reserva> reservas = new ArrayList<>();
        recurso.setReservas(reservas);
        recurso.setEstado(recursoDTO.getEstado());
        recursoRepo.save(recurso);

        return recursoDTO;
    }

    public List<RecursoDTO> listar() {
        return recursoRepo.findAll().stream().map(recurso -> {
            RecursoDTO recursoDTO = new RecursoDTO();
            recursoDTO.setId(recurso.getId());
            recursoDTO.setTipo(recurso.getTipo());
            recursoDTO.setEstado(recurso.getEstado());
            recursoDTO.setDescripcion(recurso.getDescripcion());
            recursoDTO.setCapacidad(recurso.getCapacidad());
            return recursoDTO;
        }).collect(Collectors.toList());
    }

    public void eliminarRecurso(Long id) {
        recursoRepo.delete(recursoRepo.findById(id).orElseThrow(() -> new RuntimeException("Recurso no encontrado")));
    }

    public RecursoDTO editarRecurso(Long id, RecursoDTO recursoDTO) {
        Recurso recurso = recursoRepo.findById(id).map(recurso1 -> {
            recurso1.setCapacidad(recursoDTO.getCapacidad());
            recurso1.setTipo(recursoDTO.getTipo());
            recurso1.setDescripcion(recursoDTO.getDescripcion());
            return recurso1;
        }).orElseThrow(() -> new RuntimeException("Recurso no encontrado"));
        recursoRepo.save(recurso);

        return recursoDTO;
    }

    public RecursoDTO buscarId(Long id) {
        return recursoRepo.findById(id).map(recurso -> {
            RecursoDTO recursoDTO = new RecursoDTO();
            recursoDTO.setCapacidad(recurso.getCapacidad());
            recursoDTO.setId(recurso.getId());
            recursoDTO.setEstado(recurso.getEstado());
            recursoDTO.setDescripcion(recurso.getDescripcion());
            recursoDTO.setTipo(recurso.getTipo());
            return recursoDTO;
        }).orElseThrow(() -> new RuntimeException("Recurso no encontrado"));
    }

    public List<RecursoDisponibleDTO> buscarRecursosDispobibles() {
        List<RecursoDisponibleDTO> recursoDisponibleDTOS = new ArrayList<>();

        for (Object[] o : recursoRepo.buscarRecursosPorDisponibilidad(true)) {
            RecursoDisponibleDTO recursoDisponibleDTO = new RecursoDisponibleDTO();
            recursoDisponibleDTO.setId((Long) o[0]);
            recursoDisponibleDTO.setTipo((Recurso.Tipo) o[1]);
            recursoDisponibleDTOS.add(recursoDisponibleDTO);
        }

        return recursoDisponibleDTOS;
    }
}
