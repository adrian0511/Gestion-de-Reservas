package com.adrian.Gestion.de.Reservas.services;

import com.adrian.Gestion.de.Reservas.dto.ClienteDTO;
import com.adrian.Gestion.de.Reservas.models.Cliente;
import com.adrian.Gestion.de.Reservas.models.Reserva;
import com.adrian.Gestion.de.Reservas.repositories.ClienteRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepo clienteRepo;

    public ClienteDTO crearCliente(ClienteDTO clienteDTO) {
        Cliente cliente = new Cliente();
        cliente.setNombre(clienteDTO.getNombre());
        cliente.setApellido(clienteDTO.getApellido());
        cliente.setEmail(clienteDTO.getEmail());
        cliente.setTelefono(clienteDTO.getTelefono());
        List<Reserva> reservaList = new ArrayList<>();
        cliente.setReservas(reservaList);
        clienteRepo.save(cliente);

        return clienteDTO;
    }

    public List<ClienteDTO> listar() {
        return clienteRepo.findAll().stream().map(cliente -> {
            ClienteDTO clienteDTO = new ClienteDTO();
            clienteDTO.setNombre(cliente.getNombre());
            clienteDTO.setId(cliente.getId());
            clienteDTO.setApellido(cliente.getApellido());
            clienteDTO.setTelefono(cliente.getTelefono());
            clienteDTO.setEmail(cliente.getEmail());
            return clienteDTO;
        }).collect(Collectors.toList());
    }

    public void eliminarCliente(Long id) {
        clienteRepo.deleteById(id);
    }

    public ClienteDTO editarCliente(Long id, ClienteDTO clienteDTO) {
        Cliente cliente = clienteRepo.findById(id).map(cliente1 -> {
            cliente1.setNombre(clienteDTO.getNombre());
            cliente1.setApellido(clienteDTO.getApellido());
            cliente1.setEmail(clienteDTO.getEmail());
            cliente1.setTelefono(clienteDTO.getTelefono());
            return cliente1;
        }).orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        clienteRepo.save(cliente);

        return clienteDTO;
    }

    public ClienteDTO buscarId(Long id) {
        return clienteRepo.findById(id).map(cliente -> {
            ClienteDTO clienteDTO = new ClienteDTO();
            clienteDTO.setNombre(cliente.getNombre());
            clienteDTO.setId(cliente.getId());
            clienteDTO.setApellido(cliente.getApellido());
            clienteDTO.setTelefono(cliente.getTelefono());
            clienteDTO.setEmail(cliente.getEmail());
            return clienteDTO;
        }).orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    }
}
