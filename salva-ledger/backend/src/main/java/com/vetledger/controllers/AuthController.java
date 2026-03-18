package com.vetledger.controllers;

import com.vetledger.common.ApiResponse;
import com.vetledger.entities.User;
import com.vetledger.entities.Role;
import com.vetledger.repositories.UserRepository;
import com.vetledger.security.JwtTokenUtil;
import com.vetledger.security.dto.AuthRequest;
import com.vetledger.security.dto.AuthResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody AuthRequest authRequest) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    authRequest.getEmail(),
                    authRequest.getPassword()
                )
            );

            // Create JWT token
            String token = jwtTokenUtil.generateToken((User) authentication.getPrincipal());

            // Create user object for response
            User user = userRepository.findByEmail(authRequest.getEmail()).orElse(null);

            // Create refresh token if remember me is checked
            String refreshToken = authRequest.isRememberMe()
                ? jwtTokenUtil.generateTokenWithRefresh((User) authentication.getPrincipal())
                : null;

            AuthResponse response = new AuthResponse(token, user.getEmail(), user.getRole(), user.getId().toString());
            response.setToken(token);

            if (refreshToken != null) {
                response.setToken(refreshToken);
                Map<String, String> tokenInfo = new HashMap<>();
                tokenInfo.put("token", refreshToken);
                tokenInfo.put("type", "Bearer");
                return ResponseEntity.ok(ApiResponse.success(tokenInfo));
            }

            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            return ResponseEntity.status(401)
                .body(ApiResponse.error("INVALID_CREDENTIALS", "Invalid email or password"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, String>>> register(@RequestBody AuthRequest authRequest) {
        try {
            // Check if user already exists
            if (userRepository.existsByEmail(authRequest.getEmail())) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("EMAIL_EXISTS", "Email already registered"));
            }

            // Create new user
            User user = new User();
            user.setEmail(authRequest.getEmail());
            user.setPassword(passwordEncoder.encode(authRequest.getPassword()));
            user.setActive(true);
            user.setRole(Role.ROLE_USER);
            user.setFullName(user.getEmail());

            userRepository.save(user);

            // Generate JWT token
            String token = jwtTokenUtil.generateToken(user);

            Map<String, String> responseMap = new HashMap<>();
            responseMap.put("token", token);
            responseMap.put("type", "Bearer");
            responseMap.put("email", user.getEmail());
            responseMap.put("userId", user.getId().toString());
            responseMap.put("role", user.getRole().name());

            return ResponseEntity.ok(ApiResponse.success(responseMap));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("INTERNAL_ERROR", "Error during registration: " + e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getLoggedInUser() {
        // Get the current authenticated user from security context
        // This will be handled by SecurityContextHolder in the actual implementation
        // For now, returning a generic response
        return ResponseEntity.ok(ApiResponse.success("User authenticated"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<Map<String, String>>> refreshToken() {
        // This endpoint would require the current JWT token to be passed in the Authorization header
        // The implementation would decode the token, validate it, and issue a new one
        return ResponseEntity.ok(ApiResponse.error("NOT_IMPLEMENTED", "Refresh token endpoint - pass token in Authorization header"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Map<String, String>>> logout() {
        // JWT stateless authentication - logout is client-side (token deletion)
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logged out successfully");
        response.put("token", "deleted-client-side");
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/admin-users")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllAdminUsers() {
        try {
            // Get admin users (for admin UI management)
            var adminUsers = userRepository.findAll()
                .stream()
                .filter(u -> u.getRole() == Role.ROLE_ADMIN || u.getRole() == Role.ROLE_ASSISTANT)
                .map(u -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", u.getId().toString());
                    userMap.put("email", u.getEmail());
                    userMap.put("fullName", u.getFullName() != null ? u.getFullName() : "");
                    userMap.put("role", u.getRole().name());
                    userMap.put("active", u.getActive());
                    return userMap;
                })
                .toList();

            Map<String, Object> response = new HashMap<>();
            response.put("users", adminUsers);
            response.put("total", adminUsers.size());

            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("INTERNAL_ERROR", "Error fetching users"));
        }
    }

    @PostMapping("/admin/{userId}/set-role")
    public ResponseEntity<ApiResponse<Map<String, String>>> setUserRole(
        @PathVariable UUID userId,
        @RequestParam String role) {
        try {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

            if (!Role.ROLE_ADMIN.equals(role) && !Role.ROLE_ASSISTANT.equals(role)) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("INVALID_ROLE", "Only ADMIN or ASSISTANT roles allowed"));
            }

            user.setRole(Role.valueOf(role));
            userRepository.save(user);

            Map<String, String> response = new HashMap<>();
            response.put("userId", userId.toString());
            response.put("role", role);
            response.put("message", "User role updated successfully");

            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("USER_NOT_FOUND", "User not found"));
        }
    }

    @PostMapping("/admin/{userId}/toggle-status")
    public ResponseEntity<ApiResponse<Map<String, String>>> toggleUserStatus(
        @PathVariable UUID userId) {
        try {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

            user.setActive(!user.getActive());
            userRepository.save(user);

            Map<String, String> response = new HashMap<>();
            response.put("userId", userId.toString());
            response.put("active", String.valueOf(user.getActive()));
            response.put("message", user.getActive() ? "User activated" : "User deactivated");

            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("USER_NOT_FOUND", "User not found"));
        }
    }
}
