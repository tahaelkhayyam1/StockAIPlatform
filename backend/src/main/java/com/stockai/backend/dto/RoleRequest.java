package com.stockai.backend.dto;

import com.stockai.backend.model.Role;

public class RoleRequest {
    private Role role;

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}