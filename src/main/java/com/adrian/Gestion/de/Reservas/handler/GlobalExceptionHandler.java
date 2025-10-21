package com.adrian.Gestion.de.Reservas.handler;

import com.adrian.Gestion.de.Reservas.exceptions.ReservaConflitException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ReservaConflitException.class)
    public ResponseEntity<Map<String, String>> handlerReservaConflit(ReservaConflitException e) {
        Map<String, String> body = Map.of("error", e.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handlerException(Exception e) {
        Map<String, String> body = Map.of("error", "Ocurrió un error en el servidor");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
