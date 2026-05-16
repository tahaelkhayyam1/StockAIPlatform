package com.stockai.stock_ai_backend.repository;

import com.stockai.stock_ai_backend.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {
}