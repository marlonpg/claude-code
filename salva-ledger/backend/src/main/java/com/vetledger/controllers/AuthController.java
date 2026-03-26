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
import org.springframework.security.core.context.SecurityContextHolder;
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
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest) {
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

            if (refreshToken != null) {
                Map<String, String> tokenInfo = new HashMap<>();
                tokenInfo.put("token", refreshToken);
                tokenInfo.put("type", "Bearer");
                ApiResponse<Map<String, String>> responseWithToken = new ApiResponse<Map<String, String>>();
                responseWithToken.setSuccess(true);
                responseWithToken.setData(tokenInfo);
                return ResponseEntity.ok(responseWithToken);
            }

            ApiResponse<AuthResponse> responseObj = new ApiResponse<>();
            responseObj.setSuccess(true);
            responseObj.setData(response);
            return ResponseEntity.ok(responseObj);

        } catch (Exception e) {
            ApiResponse<String> errorResponse = new ApiResponse<>();
            errorResponse.setSuccess(false);
            errorResponse.setErrorCode("INVALID_CREDENTIALS");
            errorResponse.setMessage("Invalid email or password");
            return ResponseEntity.status(401).body(errorResponse);
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

            ApiResponse<Map<String, String>> responseMapObj = new ApiResponse<Map<String, String>>();
            responseMapObj.setSuccess(true);
            responseMapObj.setData(responseMap);
            return ResponseEntity.ok(responseMapObj);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("INTERNAL_ERROR", "Error during registration: " + e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getLoggedInUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
                return ResponseEntity.ok(Map.of("error", "NOT_AUTHENTICATED", "message", "Not authenticated"));
            }

            User user = (User) authentication.getPrincipal();

            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId().toString());
            userMap.put("email", user.getEmail());
            userMap.put("fullName", user.getFullName() != null ? user.getFullName() : "");
            userMap.put("role", user.getRole().name());
            userMap.put("active", user.getActive());
            userMap.put("displayName", user.getFullName() != null ? user.getFullName() : user.getEmail());
            userMap.put("userId", user.getId().toString()); // for backward compatibility

            return ResponseEntity.ok(userMap);

        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("error", "NOT_AUTHENTICATED", "message", "Not authenticated"));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<Map<String, String>>> refreshToken() {
        // This endpoint would require the current JWT token to be passed in the Authorization header
        // The implementation would decode the token, validate it, and issue a new one
        ApiResponse<Map<String, String>> refreshTokenResponse = new ApiResponse<Map<String, String>>();
        refreshTokenResponse.setSuccess(false);
        refreshTokenResponse.setMessage("Refresh token endpoint - pass token in Authorization header");
        return ResponseEntity.ok(refreshTokenResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Map<String, String>>> logout() {
        // JWT stateless authentication - logout is client-side (token deletion)
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logged out successfully");
        response.put("token", "deleted-client-side");
        ApiResponse<Map<String, String>> logoutResponse = new ApiResponse<Map<String, String>>();
        logoutResponse.setSuccess(true);
        logoutResponse.setData(response);
        return ResponseEntity.ok(logoutResponse);
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

            ApiResponse<Map<String, Object>> adminUsersResponse = new ApiResponse<Map<String, Object>>();
            adminUsersResponse.setSuccess(true);
            adminUsersResponse.setData(response);
            return ResponseEntity.ok(adminUsersResponse);

        } catch (Exception e) {
            ApiResponse<Map<String, Object>> errorResponse = new ApiResponse<Map<String, Object>>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("INTERNAL_ERROR");
            Map<String, Object> errorData = Map.of("error", "NOT_AUTHENTICATED", "message", "Not authenticated");
            errorResponse.setData(errorData);
            return ResponseEntity.internalServerError().body(errorResponse);
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

            ApiResponse<Map<String, String>> roleResponse = new ApiResponse<Map<String, String>>();
            roleResponse.setSuccess(true);
            roleResponse.setData(response);
            return ResponseEntity.ok(roleResponse);

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

            ApiResponse<Map<String, String>> statusResponse = new ApiResponse<Map<String, String>>();
            statusResponse.setSuccess(true);
            statusResponse.setData(response);
            return ResponseEntity.ok(statusResponse);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("USER_NOT_FOUND", "User not found"));
        }
    }
}
