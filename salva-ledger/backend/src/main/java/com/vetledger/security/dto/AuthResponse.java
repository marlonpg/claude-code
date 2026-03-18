package com.vetledger.security.dto;

import com.vetledger.entities.User;
import com.vetledger.entities.Role;
import java.time.LocalDateTime;

public class AuthResponse {

    private String token;
    private String type = "Bearer";
    private String email;
    private Role role;
    private String userId;

    public AuthResponse() {}

    public AuthResponse(User user, String token) {
        this.token = token;
        this.email = user.getEmail();
        this.role = user.getRole();
        this.userId = user.getId().toString();
    }

    public AuthResponse(String token, String email, Role role, String userId) {
        this.token = token;
        this.email = email;
        this.role = role;
        this.userId = userId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    @Override
    public String toString() {
        return "AuthResponse{" +
                "token='" + token + '\'' +
                ", type='" + type + '\'' +
                ", email='" + email + '\'' +
                ", role=" + role +
                ", userId='" + userId + '\'' +
                '}';
    }
}
