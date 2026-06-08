package com.stockai.backend.repository;

import com.stockai.backend.model.Role;
import com.stockai.backend.model.User;
import com.stockai.backend.model.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    List<User> findByStatus(UserStatus status);

    @Query("SELECT u FROM User u WHERE (u.archived = :archived OR (u.archived IS NULL AND :archived = false))")
    Page<User> findByArchivedQuery(@Param("archived") Boolean archived, Pageable pageable);

    @Query("SELECT u FROM User u WHERE (u.archived = :archived OR (u.archived IS NULL AND :archived = false)) AND u.role = :role")
    Page<User> findByRoleAndArchivedQuery(@Param("role") Role role, @Param("archived") Boolean archived, Pageable pageable);

    @Query("SELECT u FROM User u WHERE (u.archived = :archived OR (u.archived IS NULL AND :archived = false)) AND (LOWER(u.username) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<User> searchUsersByTermAndArchived(@Param("searchTerm") String searchTerm, @Param("archived") Boolean archived, Pageable pageable);

    @Query("SELECT u FROM User u WHERE (u.archived = :archived OR (u.archived IS NULL AND :archived = false)) AND (LOWER(u.username) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND u.role = :role")
    Page<User> searchUsersByTermAndRoleAndArchived(@Param("searchTerm") String searchTerm, @Param("role") Role role, @Param("archived") Boolean archived, Pageable pageable);
}