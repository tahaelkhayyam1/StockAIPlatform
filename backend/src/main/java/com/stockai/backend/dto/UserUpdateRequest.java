package com.stockai.backend.dto;

import lombok.Data;

@Data
public class UserUpdateRequest {

    private String username;
    private String email;
    private String phone;
    private Integer age;
}