package com.adrian.Gestion.de.Reservas.services;

import com.adrian.Gestion.de.Reservas.dto.ReservaDTO;
import com.adrian.Gestion.de.Reservas.exceptions.ReservaConflitException;
import com.adrian.Gestion.de.Reservas.models.Cliente;
import com.adrian.Gestion.de.Reservas.models.Recurso;
import com.adrian.Gestion.de.Reservas.models.Reserva;
import com.adrian.Gestion.de.Reservas.repositories.ClienteRepo;
import com.adrian.Gestion.de.Reservas.repositories.RecursoRepo;
import com.adrian.Gestion.de.Reservas.repositories.ReservaRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReservaService {

    @Autowired
    private ReservaRepo reservaRepo;
    @Autowired
    private RecursoRepo recursoRepo;
    @Autowired
    private ClienteRepo clienteRepo;

    public ReservaDTO crearReserva(ReservaDTO reservaDTO) {
        // Verificar si el recurso existe
        Recurso recurso = recursoRepo.findById(reservaDTO.getId_recurso()).orElseThrow(() -> new RuntimeException("Recurso no encontrado"));

        // Verificar si el cliente existe
        Cliente cliente = clienteRepo.findById(reservaDTO.getId_cliente()).orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        // Verfificar que no se solapen las reservas
        List<Reserva> conflictos = reservaRepo.findReservasQueSolapan(recurso.getId(), reservaDTO.getFechaReserva(), reservaDTO.getHoraInicio(), reservaDTO.getHoraFin(), Arrays.asList(Reserva.Estado.ACTIVA, Reserva.Estado.PENDIENTE));
        if (!conflictos.isEmpty()) {
            throw new ReservaConflitException("El recurso ya esta reservado en ese horario");
        }

        // Crear la reserva
        Reserva reserva = new Reserva();
        reserva.setFechaReserva(reservaDTO.getFechaReserva());
        reserva.setEstado(reservaDTO.getEstado());
        reserva.setHoraFin(reservaDTO.getHoraFin());
        reserva.setHoraInicio(reservaDTO.getHoraInicio());
        cliente.addReserva(reserva);
        recurso.addReserva(reserva);
        reservaRepo.save(reserva);

        return reservaDTO;
    }

    /**
     * Actualizar automaticamente las reservas finalizadas
     */
    public void actualizarReservas() {
        // Pasar de ACTIVA a FINALIZADA o de PENDIENTE A FINALIZADA
        LocalDateTime ahora = LocalDateTime.now();
        List<Reserva> vencidas = reservaRepo.findByHoraFinBeforeAndEstadoIn(ahora, Arrays.asList(Reserva.Estado.ACTIVA, Reserva.Estado.PENDIENTE));
        vencidas.forEach(reserva -> {
            reserva.setEstado(Reserva.Estado.FINALIZADA);
        });

        //Pasar de PENDIENTE a ACTIVA
        List<Reserva> pendientes = reservaRepo.findByHoraInicioBeforeAndHoraFinAfterAndEstado(ahora, ahora, Reserva.Estado.PENDIENTE);
        pendientes.forEach(reserva -> {
            reserva.setEstado(Reserva.Estado.ACTIVA);
        });

        reservaRepo.saveAll(vencidas);
        reservaRepo.saveAll(pendientes);
    }

    public List<ReservaDTO> listarReservas() {
        return reservaRepo.findAll().stream().map(reserva -> {
            ReservaDTO reservaDTO = new ReservaDTO();
            reservaDTO.setId(reserva.getId());
            reservaDTO.setFechaReserva(reserva.getFechaReserva());
            reservaDTO.setEstado(reserva.getEstado());
            reservaDTO.setId_cliente(reserva.getCliente().getId());
            reservaDTO.setId_recurso(reserva.getRecurso().getId());
            reservaDTO.setHoraFin(reserva.getHoraFin());
            reservaDTO.setHoraInicio(reserva.getHoraInicio());
            return reservaDTO;
        }).collect(Collectors.toList());
    }

    public void cancelarReserva(Long id) {
        Reserva reserva = reservaRepo.findById(id).orElseThrow(() -> new RuntimeException(("Reserva no encontrada")));
        reserva.setEstado(Reserva.Estado.CANCELADA);
        reservaRepo.save(reserva);
    }

    public void eliminarReserva(Long id) {
        Reserva reserva = reservaRepo.findById(id).orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
        reserva.getCliente().removeReserva(reserva);
        reserva.getRecurso().removeReserva(reserva);
        reservaRepo.delete(reserva);
    }

    public ReservaDTO findById(Long id) {
        return reservaRepo.findById(id).map(r -> {
            ReservaDTO reservaDTO = new ReservaDTO();
            reservaDTO.setId(r.getId());
            reservaDTO.setFechaReserva(r.getFechaReserva());
            reservaDTO.setEstado(r.getEstado());
            reservaDTO.setHoraFin(r.getHoraFin());
            reservaDTO.setId_cliente(r.getCliente().getId());
            reservaDTO.setHoraInicio(r.getHoraInicio());
            reservaDTO.setId_recurso(r.getRecurso().getId());
            return reservaDTO;
        }).orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
    }

    public ReservaDTO editarReserva(Long id, ReservaDTO reservaDTO) {
        Reserva reserva = reservaRepo.findById(id).orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        // Verificar si el recurso existe
        Recurso recurso = recursoRepo.findById(reservaDTO.getId_recurso()).orElseThrow(() -> new RuntimeException("Recurso no encontrado"));

        // Verificar si el cliente existe
        Cliente cliente = clienteRepo.findById(reservaDTO.getId_cliente()).orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        // Verfificar que no se solapen las reservas
        List<Reserva> conflictos = reservaRepo.findReservasQueSolapan(recurso.getId(), reservaDTO.getFechaReserva(), reservaDTO.getHoraInicio(), reservaDTO.getHoraFin(), Arrays.asList(Reserva.Estado.ACTIVA, Reserva.Estado.PENDIENTE));
        if (!conflictos.isEmpty()) {
            throw new ReservaConflitException("El recurso ya esta reservado en ese horario");
        }

        // Modificar el cliente y el recurso solo si es diferente
        if (!reserva.getCliente().equals(cliente)) {
            reserva.getCliente().removeReserva(reserva);
            cliente.addReserva(reserva);
        }

        if (!reserva.getRecurso().equals(recurso)) {
            reserva.getRecurso().removeReserva(reserva);
            recurso.addReserva(reserva);
        }

        // Asignarle las nuevas caracteristicas
        reserva.setFechaReserva(reservaDTO.getFechaReserva());
        reserva.setEstado(reservaDTO.getEstado());
        reserva.setHoraFin(reservaDTO.getHoraFin());
        reserva.setHoraInicio(reservaDTO.getHoraInicio());

        // Añadir la reserva al nuevo cliente y recurso
        cliente.addReserva(reserva);
        recurso.addReserva(reserva);

        reservaRepo.save(reserva);

        return reservaDTO;
    }

    public Map<String, Long> estadisticas() {
        Map<String, Long> response = Map.of("total", reservaRepo.count(),
                "activas", reservaRepo.countByEstado(Reserva.Estado.ACTIVA),
                "canceladas", reservaRepo.countByEstado(Reserva.Estado.CANCELADA),
                "hoy", reservaRepo.countByFechaReserva(LocalDate.now()));

        return response;
    }

    public List<ReservaDTO> findByClienteId(Long id) {
        return reservaRepo.findByClienteId(id).stream().map(r -> {
            ReservaDTO reservaDTO = new ReservaDTO();
            reservaDTO.setId(r.getId());
            reservaDTO.setFechaReserva(r.getFechaReserva());
            reservaDTO.setEstado(r.getEstado());
            reservaDTO.setHoraFin(r.getHoraFin());
            reservaDTO.setId_cliente(r.getCliente().getId());
            reservaDTO.setHoraInicio(r.getHoraInicio());
            reservaDTO.setId_recurso(r.getRecurso().getId());
            return reservaDTO;
        }).collect(Collectors.toList());
    }

    public List<ReservaDTO> findByRecursoId(Long id) {
        return reservaRepo.findByRecursoId(id).stream().map(r -> {
            ReservaDTO reservaDTO = new ReservaDTO();
            reservaDTO.setId(r.getId());
            reservaDTO.setFechaReserva(r.getFechaReserva());
            reservaDTO.setEstado(r.getEstado());
            reservaDTO.setHoraFin(r.getHoraFin());
            reservaDTO.setId_cliente(r.getCliente().getId());
            reservaDTO.setHoraInicio(r.getHoraInicio());
            reservaDTO.setId_recurso(r.getRecurso().getId());
            return reservaDTO;
        }).collect(Collectors.toList());
    }

    public List<ReservaDTO> findByRecursoAndCliente(Long id_recurso, Long id_cliente) {
        return reservaRepo.findByRecursoIdAndClienteId(id_recurso, id_cliente).stream().map(r -> {
            ReservaDTO reservaDTO = new ReservaDTO();
            reservaDTO.setId(r.getId());
            reservaDTO.setFechaReserva(r.getFechaReserva());
            reservaDTO.setEstado(r.getEstado());
            reservaDTO.setHoraFin(r.getHoraFin());
            reservaDTO.setId_cliente(r.getCliente().getId());
            reservaDTO.setHoraInicio(r.getHoraInicio());
            reservaDTO.setId_recurso(r.getRecurso().getId());
            return reservaDTO;
        }).collect(Collectors.toList());
    }

}
