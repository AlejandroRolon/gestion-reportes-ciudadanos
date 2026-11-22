package com.example.demo.controller;

import com.example.demo.dto.AuthDtos.*;
import com.example.demo.model.Usuario;
import com.example.demo.model.Role;
import com.example.demo.repository.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Locale;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;

    public AuthController(UsuarioRepository usuarios, PasswordEncoder encoder) { this.usuarios = usuarios; this.encoder = encoder; }

    @PostMapping("/register")
    public ResponseEntity<UsuarioResponse> register(@Valid @RequestBody RegisterRequest req) {
        String email = req.email().trim().toLowerCase(Locale.ROOT);
        if (usuarios.existsByEmail(email)) throw new IllegalArgumentException("Este correo ya está en uso.");
        Usuario u = new Usuario(); u.setNombreCompleto(req.nombreCompleto().trim()); u.setEmail(email);
        u.setPassword(encoder.encode(req.password())); u.setRole(Role.CIUDADANO);
        usuarios.save(u);
        return ResponseEntity.status(HttpStatus.CREATED).body(UsuarioResponse.from(u));
    }

    @PostMapping("/login")
    public ResponseEntity<UsuarioResponse> login(@Valid @RequestBody LoginRequest req) {
        Usuario u = usuarios.findByEmail(req.email().trim().toLowerCase(Locale.ROOT)).orElseThrow(() -> new IllegalArgumentException("Correo o contraseña incorrecta."));
        if (!encoder.matches(req.password(), u.getPassword())) throw new IllegalArgumentException("Correo o contraseña incorrecta.");
        return ResponseEntity.ok(UsuarioResponse.from(u));
    }

    @GetMapping("/me")
    public UsuarioResponse me(Authentication auth) {
        Usuario u = usuarios.findByEmail(auth.getName()).orElseThrow();
        return UsuarioResponse.from(u);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().build();
    }
}
