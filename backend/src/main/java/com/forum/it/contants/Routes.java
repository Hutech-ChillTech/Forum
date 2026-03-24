package com.forum.it.contants;

/**
 * Centralised API route constants - one nested class per domain.
 */
public final class Routes {

    public static final String API_V1 = "/api/v1";

    public static final class Admin {
        public static final String BASE = API_V1 + "/internal-mng";

        // User
        public static final String GET_ALL_USER = "/users";
        public static final String CREATE_USER = "";
        public static final String DELETE_USER = "/{id}";
        public static final String BAN_USER = "/{id}/ban";
        public static final String UNBAN_USER = "/{id}/unban";
        public static final String GET_BY_ID_USER = "/{id}";
        public static final String GET_BY_EMAIL_USER = "/email/{email}";

        // Post
        public static final String GET_ALL_POSTS = "/posts";
        public static final String GET_BY_ID_POST = "/posts/{id}";
        public static final String GET_BY_STATUS_POST = "/posts/status/{status}";
        public static final String DELETE_POST = "/posts/{id}";

        // Comment
        public static final String GET_BY_ID_COMMENT = "/comments/{id}";
        public static final String DELETE_COMMENT = "/comments/{id}";

        // Tag
        public static final String GET_ALL_TAGS = "/tags";
        public static final String GET_BY_ID_TAG = "/tags/{id}";
        public static final String CREATE_TAG = "/tags";
        public static final String DELETE_TAG = "/tags/{id}";

        // Role
        public static final String GET_ALL_ROLES = "/roles";
        public static final String GET_BY_NAME_ROLE = "/roles/{name}";
        public static final String CREATE_ROLE = "/roles";
        public static final String DELETE_ROLE = "/roles/{id}";
        public static final String ASSIGN_ROLE = "/assign-role";
        public static final String REVOKE_ROLE = "/revoke-role";
    }

    public static final class Moderation {
        public static final String BASE = API_V1 + "/admin/moderation";
        public static final String LOG_ACTION = "";
        public static final String GET_ALL = "";
        public static final String BY_ADMIN = "/admin/{adminId}";
        public static final String BY_TARGET = "/target/{userId}";
    }

    public static final class Auth {
        public static final String BASE = API_V1 + "/auth";
        public static final String LOGIN = "/login";
        public static final String LOGOUT = "/logout";
        public static final String REGISTER = "/register";
        public static final String REFRESH = "/token";
        public static final String CHANGE_PASSWORD = "/change-password";
        public static final String REQUEST_OTP = "/request-otp";

    }

    public static final class User {
        public static final String BASE = API_V1 + "/users";
        public static final String GET_ALL = "";
        public static final String ME = "/me";
        public static final String UPDATE = "/{id}";
        public static final String SEARCH = "/search";
        public static final String SEARCH_BY_USERNAME = "/search/name/{name}";
        public static final String ACTIVE = "/active";
        public static final String MY_BOOKMARKS = "/me/bookmarks";
        public static final String MY_SHARES = "/me/shares";
        public static final String STATISTICS = "/statistics";
    }

    public static final class Post {
        public static final String BASE = API_V1 + "/posts";
        public static final String GET_ALL = "";
        public static final String GET_BY_ID_POST = "/{id}";
        public static final String GET_BY_USER_POST = "/user/{userId}";
        public static final String SEARCH = "/search";
        public static final String RECENT = "/recent";
        public static final String CREATE = "";
        public static final String UPDATE = "/{id}";
        public static final String DELETE = "/{id}";
        public static final String UPDATE_STATUS = "/{id}/status";
        public static final String BOOKMARK = "/{postId}/bookmarks";
        public static final String STATS_TOTAL = "/statistics/total";
        public static final String STATS_STATUS = "/statistics/status/{status}";
        public static final String STATS_USER = "/statistics/user/{userId}";
    }

    public static final class Comment {
        public static final String BASE = API_V1 + "/comments";
        public static final String GET_ALL = "";
        public static final String BY_POST = "/post/{postId}";
        public static final String BY_POST_ALL = "/post/{postId}/all";
        public static final String BY_USER = "/user/{userId}";
        public static final String REPLIES = "/{id}/replies";
        public static final String CREATE = "";
        public static final String UPDATE = "/{id}";
        public static final String COUNT_BY_POST = "/count/post/{postId}";
        public static final String COUNT_BY_USER = "/count/user/{userId}";
    }

    public static final class Reaction {
        public static final String BASE = API_V1 + "/posts/{postId}/reactions";
        public static final String REACT = "";
        public static final String REMOVE = "";
        public static final String MY_REACT = "/me";
        public static final String COUNT = "/count";
    }

    public static final class Share {
        public static final String BASE = API_V1 + "/posts/{postId}/shares";
        public static final String CREATE = "";
        public static final String COUNT = "/count";
    }

    public static final class Tag {
        public static final String BASE = API_V1 + "/tags";
        public static final String GET_ALL = "";
        public static final String BY_NAME = "/name/{name}";
        public static final String BY_POST = "/post/{postId}";
        public static final String POPULAR = "/popular";
        public static final String SEARCH = "/search";
    }

    public static final class Role {
        public static final String BASE = API_V1 + "/roles";
    }

    public static final class Notification {
        public static final String BASE = API_V1 + "/notifications";
        public static final String MY_ALL = "";
        public static final String MY_UNREAD = "/unread";
        public static final String UNREAD_COUNT = "/unread/count";
        public static final String MARK_READ = "/{id}/read";
        public static final String MARK_ALL_READ = "/read-all";
        public static final String DELETE = "/{id}";
    }

    public static final class Chat {
        public static final String BASE = API_V1 + "/messages";
        public static final String SEND = "";
        public static final String INBOX = "/inbox";
        public static final String SENT = "/sent";
        public static final String CONVERSATION = "/conversation/{userId}";
        public static final String CONVERSATIONS = "/conversations";
        public static final String DELETE = "/{id}";
    }

    public static final class WebSocket {
        public static final String ENDPOINT = "/ws";
        public static final String APP = "/app";
        public static final String TOPIC = "/topic";
        public static final String USER_Q = "/user";
        public static final String CHAT_SEND = "/app/chat.send";
        public static final String PRESENCE = "/app/presence";
    }

    public static final class File {
        public static final String BASE = API_V1 + "/files";
        public static final String UPLOAD = "/upload";
    }

    public static final class Search {
        public static final String BASE = API_V1 + "/search";
        public static final String HISTORY = "/history";
        public static final String CLEAR_HISTORY = "/history/clear";
        public static final String REMOVE_HISTORY_ITEM = "/history/remove";
    }

    private Routes() {
    }
}