package com.example.demo.dto;

import com.example.demo.model.Usuario;
import jakarta.validation.constraints.*;

public class AuthDtos {
    public record RegisterRequest(
        @NotBlank(message = "Escribe tu nombre completo.") @Size(min = 3, max = 120, message = "El nombre debe tener entre 3 y 120 caracteres.") String nombreCompleto,
        @NotBlank(message = "Escribe tu correo electrónico.") @Email(message = "Ingresa un correo electrónico válido.") String email,
        @NotBlank(message = "Escribe una contraseña.") @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres.") String password
    ) {}

    public record LoginRequest(
        @NotBlank(message = "Escribe tu correo electrónico.") @Email(message = "Ingresa un correo electrónico válido.") String email,
        @NotBlank(message = "Escribe tu contraseña.") String password
    ) {}

    public record UsuarioResponse(Long id, String nombreCompleto, String email, String rol) {
        public static UsuarioResponse from(Usuario usuario) {
            return new UsuarioResponse(usuario.getId(), usuario.getNombreCompleto(), usuario.getEmail(), usuario.getRole().name());
        }
    }
}
