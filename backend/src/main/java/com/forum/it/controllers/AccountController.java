package com.forum.it.controllers;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.forum.it.contants.Routes;
import com.forum.it.dtos.request.ChangePasswordRequest;
import com.forum.it.dtos.request.CreateUserRequest;
import com.forum.it.dtos.request.RefreshTokenRequest;
import com.forum.it.dtos.request.LoginRequest;
import com.forum.it.dtos.response.ApiResponses;
import com.forum.it.dtos.response.AuthResponse;
import com.forum.it.services.AccountService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping(Routes.Auth.BASE)
public class AccountController {

    final AccountService accountService;

    @PostMapping(Routes.Auth.REGISTER)
    public ApiResponses<AuthResponse> register(@RequestBody @Valid CreateUserRequest request) {
        return ApiResponses.success(accountService.register(request), null);
    }

    @PostMapping(Routes.Auth.LOGIN)
    public ApiResponses<AuthResponse> login(@RequestBody @Valid LoginRequest request) {
        return ApiResponses.success(accountService.login(request), null);
    }

    @PostMapping(Routes.Auth.LOGOUT)
    public ApiResponses<String> logout(HttpServletRequest httpRequest) {
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            accountService.logout();
        }
        return ApiResponses.success("Logout success", null);
    }

    @PostMapping(Routes.Auth.REFRESH)
    public ApiResponses<AuthResponse> refreshToken(@RequestBody @Valid RefreshTokenRequest request) {
        return ApiResponses.success(accountService.refreshToken(request), null);
    }

    @PostMapping(Routes.Auth.CHANGE_PASSWORD)
    public ApiResponses<String> changePassword(@RequestBody @Valid ChangePasswordRequest request) {
        accountService.changePassword(request);
        return ApiResponses.success("Password changed successfully", null);
    }

}