package org.aadi.user_service.dto;

import lombok.Data;

@Data
public class AuthRequest {
    
    private String username;
    private String email;
    private String password;
}
