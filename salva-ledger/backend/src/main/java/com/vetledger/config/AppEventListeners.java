package com.vetledger.config;

import com.vetledger.entities.User;
import com.vetledger.repositories.UserRepository;
import com.vetledger.security.JwtTokenUtil;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

@Component
public class AppEventListeners implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AppEventListeners.class);

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final List<String> allowedOrigins = List.of("http://localhost:5173", "http://localhost:3000");
    private final List<String> allowedMethods = List.of("GET", "POST", "PUT", "DELETE", "OPTIONS");
    private final List<String> allowedHeaders = List.of("*");

    @Override
    public void run(String... args) throws Exception {
        logger.info("Vet Ledger Application starting...");

        // Create default admin user if it doesn't exist
        if (!userRepository.existsByEmail("admin@vettransport.com.br")) {
            User admin = new User();
            admin.setEmail("admin@vettransport.com.br");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFullName("Administrador");
            admin.setRole(com.vetledger.entities.Role.ROLE_ADMIN);
            admin.setActive(true);
            userRepository.save(admin);
            logger.info("Default admin user created: admin@vettransport.com.br / admin123");
        }

        // Create default assistant user if it doesn't exist
        if (!userRepository.existsByEmail("assistente@vettransport.com.br")) {
            User assistant = new User();
            assistant.setEmail("assistente@vettransport.com.br");
            assistant.setPassword(passwordEncoder.encode("assistente123"));
            assistant.setFullName("Assistente Administrativo");
            assistant.setRole(com.vetledger.entities.Role.ROLE_ASSISTANT);
            assistant.setActive(true);
            userRepository.save(assistant);
            logger.info("Default assistant user created: assistente@vettransport.com.br / assistente123");
        }

        // Create default driver user if it doesn't exist
        if (!userRepository.existsByEmail("driver1@vettransport.com.br")) {
            User driver = new User();
            driver.setEmail("driver1@vettransport.com.br");
            driver.setPassword(passwordEncoder.encode("driver123"));
            driver.setFullName("Joao Motorista");
            driver.setRole(com.vetledger.entities.Role.ROLE_DRIVER);
            driver.setActive(true);
            userRepository.save(driver);
            logger.info("Default driver user created: driver1@vettransport.com.br / driver123");
        }

        // Create CORS filter
        registerCORSFilter();
        logger.info("Vet Ledger Application initialized successfully");
    }

    private void registerCORSFilter() {
        try {
            OncePerRequestFilter filter = new OncePerRequestFilter() {
                @Override
                protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
                    // Add CORS headers
                    String origin = request.getHeader("Origin");
                    if (origin != null && allowedOrigins.contains(origin)) {
                        response.setHeader("Access-Control-Allow-Origin", origin);
                    } else {
                        response.setHeader("Access-Control-Allow-Origin", allowedOrigins.get(0));
                    }

                    response.setHeader("Access-Control-Allow-Methods", String.join(",", allowedMethods));
                    response.setHeader("Access-Control-Allow-Headers", String.join(",", allowedHeaders));
                    response.setHeader("Access-Control-Expose-Headers", "Authorization");

                    if (request.getMethod().equals("OPTIONS")) {
                        response.sendError(HttpServletResponse.SC_NO_CONTENT);
                        return;
                    }

                    filterChain.doFilter(request, response);
                }
            };

            // Register the filter
            // Note: This is handled by Spring Security filter chain configuration instead
        } catch (Exception e) {
            logger.error("Error registering CORS filter", e);
        }
    }
}
