package com.forum.it.controllers;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.forum.it.contants.Routes;
import com.forum.it.dtos.request.CreateUserRequest;
import com.forum.it.dtos.request.LoginRequest;
import com.forum.it.dtos.response.ApiResponses;
import com.forum.it.dtos.response.AuthResponse;
import com.forum.it.services.AccountService;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping(Routes.Auth.BASE)
public class AccountController {

    AccountService accountService;

    @PostMapping(Routes.Auth.REGISTER)
    public ApiResponses<AuthResponse> register(@RequestBody @Valid CreateUserRequest request) {
        return ApiResponses.success(accountService.register(request), null);
    }

    @PostMapping(Routes.Auth.LOGIN)
    public ApiResponses<AuthResponse> login(@RequestBody @Valid LoginRequest request) {
        return ApiResponses.success(accountService.login(request), null);
    }
}
