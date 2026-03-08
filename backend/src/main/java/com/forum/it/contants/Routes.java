package com.forum.it.contants;

public class Routes {
    public static final String API_V1 = "/api/v1";
    public static final String API_V2 = "/api/v2";

    // API AUTH
    public static class Auth {
        public static final String BASE = API_V1 + "/auth";
        public static final String LOGIN = "/login";
        public static final String LOGOUT = "/logout";
        public static final String REGISTER = "/register";
        public static final String REFRESH = "/refresh-token";
    }

    // API USER
    public static class User {
        // Base dùng cho cả create, update, delete, get all, get by id, get by email
        public static final String BASE = API_V1 + "/users";
        public static final String CHANGE_PASSWORD = "/change-password";
        public static final String GET_ALL = "/";
        public static final String CREATE = "/";
        public static final String GET_BY_ID = "/{id}";
        public static final String GET_BY_EMAIL = "/email/{email}";
        public static final String UPDATE = "/{id}";
        public static final String DELETE = "/{id}";
    }

    // API POST
    public static class Post {
        public static final String BASE = API_V1 + "/posts";
        public static final String GET_ALL = "/";
        public static final String GET_BY_ID = "/{id}";
        public static final String CREATE = "/";
        public static final String UPDATE = "/{id}";
        public static final String DELETE = "/{id}";
    }

    private Routes() {
    }
}
