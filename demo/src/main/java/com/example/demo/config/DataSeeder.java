package com.example.demo.config;

import com.example.demo.model.Role;
import com.example.demo.model.Usuario;
import com.example.demo.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner seedUsers(UsuarioRepository usuarios, PasswordEncoder encoder) {
        return args -> {
            if (!usuarios.existsByEmail("admin@reporte.com")) {
                Usuario admin = new Usuario();
                admin.setNombreCompleto("Administrador General");
                admin.setEmail("admin@reporte.com");
                admin.setPassword(encoder.encode("Admin123*"));
                admin.setRole(Role.ADMINISTRADOR);
                usuarios.save(admin);
            }
        };
    }
}
