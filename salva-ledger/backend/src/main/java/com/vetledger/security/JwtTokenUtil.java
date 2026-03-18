package com.vetledger.security;

import com.vetledger.entities.User;
import com.vetledger.entities.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenUtil {

    @Value("${jwt.secret:vetledger-jwt-secret-key-2026}")
    private String jwtSecret;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;

    private Key getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
            .subject(user.getId().toString())
            .claim("email", user.getEmail())
            .claim("role", user.getRole().name())
            .claim("userId", user.getId().toString())
            .issuedAt(now)
            .expiresAt(expiryDate)
            .signWith(getSigningKey())
            .compact();
    }

    public String generateTokenWithRefresh(User user) {
        Date now = new Date();
        // Refresh token expires in 30 days
        Date expiryDate = new Date(now.getTime() + 2592000000L);

        return Jwts.builder()
            .subject(user.getId().toString())
            .claim("email", user.getEmail())
            .claim("role", user.getRole().name())
            .claim("userId", user.getId().toString())
            .issuedAt(now)
            .expiresAt(expiryDate)
            .signWith(getSigningKey())
            .compact();
    }

    public Claims getAllClaims(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
    }

    public String getEmailFromToken(String token) {
        Claims claims = getAllClaims(token);
        return claims.getSubject();
    }

    public Role getRoleFromToken(String token) {
        Claims claims = getAllClaims(token);
        return Role.valueOf(claims.get("role", String.class));
    }

    public boolean isTokenValid(String token, User user) {
        try {
            Claims claims = getAllClaims(token);
            boolean subjectsMatch = claims.getSubject().equals(user.getId().toString());
            return subjectsMatch && !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        try {
            Claims claims = getAllClaims(token);
            Date expiryDate = claims.getExpiration();
            return expiryDate.before(new Date());
        } catch (Exception e) {
            return true;
        }
    }
}
