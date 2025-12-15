package org.example.authenticationservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.List;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secret;

    /**
     * -- GETTER --
     *  Get validity in milliseconds.
     */
    @Getter
    @Value("${jwt.expiration}")
    private long validityInMs;

    private Key signingKey;

    @PostConstruct
    public void init() {
        // Decode Base64 encoded secret to match API Gateway
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Create a JWT token with:
     * - subject = username
     * - claim "userId" = user's database ID (required by API Gateway)
     * - claim "roles" = list of roles
     */
    public String createToken(String username, Long userId, List<String> roles) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + validityInMs);

        return Jwts.builder()
                .setSubject(username)
                .claim("userId", userId)  // API Gateway expects this claim
                .claim("roles", roles)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extract username from JWT token.
     */
    public String getUsernameFromToken(String token) {
        Claims claims = parseToken(token);
        return claims.getSubject();
    }

    /**
     * Extract userId from JWT token.
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = parseToken(token);
        return claims.get("userId", Long.class);
    }

    /**
     * Extract roles from JWT token.
     */
    @SuppressWarnings("unchecked")
    public List<String> getRolesFromToken(String token) {
        Claims claims = parseToken(token);
        return claims.get("roles", List.class);
    }

    /**
     * Get expiration date from token.
     */
    public Date getExpirationFromToken(String token) {
        Claims claims = parseToken(token);
        return claims.getExpiration();
    }

    /**
     * Parse token and return claims.
     */
    private Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Create a JWT token with employee info (houseId, employeeId).
     * Used during login to include employee-specific claims.
     *
     * @param username  User's username
     * @param userId    User's database ID
     * @param roles     User's roles
     * @param houseId   Employee's assigned house ID (can be null for HR)
     * @param employeeId Employee's MongoDB ObjectId (can be null)
     * @return JWT token string
     */
    public String createToken(String username, Long userId, List<String> roles, Long houseId, String employeeId) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + validityInMs);

        var builder = Jwts.builder()
                .setSubject(username)
                .claim("userId", userId)
                .claim("roles", roles)
                .setIssuedAt(now)
                .setExpiration(expiry);

        // Add employee-specific claims if available
        if (houseId != null) {
            builder.claim("houseId", houseId);
        }
        if (employeeId != null) {
            builder.claim("employeeId", employeeId);
        }

        return builder
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extract houseId from JWT token.
     *
     * @param token JWT token
     * @return houseId or null if not present
     */
    public Long getHouseIdFromToken(String token) {
        try {
            Claims claims = parseToken(token);
            Object houseId = claims.get("houseId");
            if (houseId instanceof Integer) {
                return ((Integer) houseId).longValue();
            } else if (houseId instanceof Long) {
                return (Long) houseId;
            }
        } catch (Exception e) {
            // Token doesn't have houseId claim
        }
        return null;
    }

    /**
     * Extract employeeId from JWT token.
     *
     * @param token JWT token
     * @return employeeId (MongoDB ObjectId) or null if not present
     */
    public String getEmployeeIdFromToken(String token) {
        try {
            Claims claims = parseToken(token);
            return claims.get("employeeId", String.class);
        } catch (Exception e) {
            // Token doesn't have employeeId claim
        }
        return null;
    }
}