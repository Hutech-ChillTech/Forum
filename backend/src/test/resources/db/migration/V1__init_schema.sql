-- Initial schema generated from JPA entities using Hibernate
-- Generated with ddl-auto=create mode
-- Date: 2026-02-03

-- Drop existing tables if any (for clean migration)
DROP TABLE IF EXISTS account_roles CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS communications CASCADE;
DROP TABLE IF EXISTS moderation_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS post_tags CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS reactions CASCADE;
DROP TABLE IF EXISTS role_claims CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS saved_posts CASCADE;
DROP TABLE IF EXISTS shares CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create tables

CREATE TABLE users (
    created_at TIMESTAMP,
    date_of_birth TIMESTAMP,
    updated_at TIMESTAMP,
    user_id UUID NOT NULL,
    phone VARCHAR(20),
    user_name VARCHAR(100) NOT NULL,
    avatarurl VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    gender VARCHAR(255) CHECK (gender IN ('MALE','FEMALE','OTHER')),
    password VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL CHECK (status IN ('ONLINE','OFFLINE','HIDDEN','BANNED')),
    verify_status VARCHAR(255) NOT NULL CHECK (verify_status IN ('ACTIVE','INACTIVE','DELETED')),
    PRIMARY KEY (user_id)
);

CREATE TABLE accounts (
    create_at TIMESTAMP,
    update_at TIMESTAMP,
    account_id UUID NOT NULL,
    user_id UUID NOT NULL,
    access_token TEXT,
    email VARCHAR(255) NOT NULL UNIQUE,
    is_verify VARCHAR(255) NOT NULL CHECK (is_verify IN ('VERIFY','UNVERIFY')),
    password VARCHAR(255),
    provider VARCHAR(255) NOT NULL,
    provider_id VARCHAR(255),
    refresh_token TEXT,
    PRIMARY KEY (account_id)
);

CREATE TABLE roles (
    role_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL UNIQUE,
    PRIMARY KEY (role_id)
);

CREATE TABLE role_claims (
    role_claim_id UUID NOT NULL,
    role_id UUID NOT NULL,
    claim VARCHAR(100) NOT NULL,
    PRIMARY KEY (role_claim_id)
);

CREATE TABLE account_roles (
    account_id UUID NOT NULL,
    account_role_id UUID NOT NULL,
    role_id UUID NOT NULL,
    PRIMARY KEY (account_role_id),
    UNIQUE (account_id, role_id)
);

CREATE TABLE posts (
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    post_id UUID NOT NULL,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    imageurl VARCHAR(255),
    status VARCHAR(255) NOT NULL CHECK (status IN ('PENDING','PUBLISHED','REJECTED')),
    title VARCHAR(255) NOT NULL,
    PRIMARY KEY (post_id)
);

CREATE TABLE comments (
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    comment_id UUID NOT NULL,
    parent_id UUID,
    post_id UUID NOT NULL,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    PRIMARY KEY (comment_id)
);

CREATE TABLE tags (
    tag_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL UNIQUE,
    PRIMARY KEY (tag_id)
);

CREATE TABLE post_tags (
    post_id UUID NOT NULL,
    post_tag_id UUID NOT NULL,
    tag_id UUID NOT NULL,
    PRIMARY KEY (post_tag_id),
    UNIQUE (post_id, tag_id)
);

CREATE TABLE reactions (
    created_at TIMESTAMP,
    post_id UUID NOT NULL,
    reaction_id UUID NOT NULL,
    user_id UUID NOT NULL,
    react VARCHAR(50) NOT NULL CHECK (react IN ('LIKE','DISLIKE','LOVE','HAHA','SAD','ANGRY')),
    PRIMARY KEY (reaction_id),
    UNIQUE (user_id, post_id)
);

CREATE TABLE shares (
    created_at TIMESTAMP,
    post_id UUID NOT NULL,
    share_id UUID NOT NULL,
    user_id UUID NOT NULL,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('FACEBOOK','MESSENGER','INSTAGRAM','LINKEDIN')),
    PRIMARY KEY (share_id)
);

CREATE TABLE saved_posts (
    created_at TIMESTAMP,
    post_id UUID NOT NULL,
    saved_post_id UUID NOT NULL,
    user_id UUID NOT NULL,
    PRIMARY KEY (saved_post_id),
    UNIQUE (user_id, post_id)
);

CREATE TABLE notifications (
    created_at TIMESTAMP,
    notification_id UUID NOT NULL,
    post_id UUID,
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('COMMENT','SHARE','REACTION','SYSTEM')),
    message TEXT NOT NULL,
    status VARCHAR(255) NOT NULL CHECK (status IN ('READ','UNREAD')),
    PRIMARY KEY (notification_id)
);

CREATE TABLE communications (
    created_at TIMESTAMP,
    communication_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    message TEXT NOT NULL,
    PRIMARY KEY (communication_id)
);

CREATE TABLE moderation_logs (
    created_at TIMESTAMP,
    admin_id UUID NOT NULL,
    moderation_log_id UUID NOT NULL,
    target_user_id UUID NOT NULL,
    action VARCHAR(255) NOT NULL,
    reason TEXT,
    PRIMARY KEY (moderation_log_id)
);

-- Create indexes

CREATE INDEX idx_comment_post ON comments (post_id);
CREATE INDEX idx_comment_parent ON comments (parent_id);
CREATE INDEX idx_comment_user ON comments (user_id);
CREATE INDEX idx_post_user ON posts (user_id);
CREATE INDEX idx_post_created ON posts (created_at);
CREATE INDEX idx_user_email ON users (email);
CREATE INDEX idx_user_username ON users (user_name);
CREATE INDEX idx_user_status ON users (status);

-- Create foreign key constraints

ALTER TABLE account_roles
    ADD CONSTRAINT FK61h48dsir3h82pxbq3cwgp0ce
    FOREIGN KEY (account_id) REFERENCES accounts;

ALTER TABLE account_roles
    ADD CONSTRAINT FK6r8nxkn3hctohyllteivfr5hy
    FOREIGN KEY (role_id) REFERENCES roles;

ALTER TABLE accounts
    ADD CONSTRAINT FKnjuop33mo69pd79ctplkck40n
    FOREIGN KEY (user_id) REFERENCES users;

ALTER TABLE comments
    ADD CONSTRAINT FKlri30okf66phtcgbe5pok7cc0
    FOREIGN KEY (parent_id) REFERENCES comments;

ALTER TABLE comments
    ADD CONSTRAINT FKh4c7lvsc298whoyd4w9ta25cr
    FOREIGN KEY (post_id) REFERENCES posts;

ALTER TABLE comments
    ADD CONSTRAINT FK8omq0tc18jd43bu5tjh6jvraq
    FOREIGN KEY (user_id) REFERENCES users;

ALTER TABLE communications
    ADD CONSTRAINT FK9hdap48h8uyh8rsh2j3nf1iar
    FOREIGN KEY (receiver_id) REFERENCES users;

ALTER TABLE communications
    ADD CONSTRAINT FKm5gmsty08g0lmrhy2dob5hgfv
    FOREIGN KEY (sender_id) REFERENCES users;

ALTER TABLE moderation_logs
    ADD CONSTRAINT FKs424btsg4kr1j7pfgj2q99b46
    FOREIGN KEY (admin_id) REFERENCES users;

ALTER TABLE moderation_logs
    ADD CONSTRAINT FKhl76um0diam32iapdh13jxjmc
    FOREIGN KEY (target_user_id) REFERENCES users;

ALTER TABLE notifications
    ADD CONSTRAINT FK599539lym3mnkbqks0u806eac
    FOREIGN KEY (post_id) REFERENCES posts;

ALTER TABLE notifications
    ADD CONSTRAINT FK9y21adhxn0ayjhfocscqox7bh
    FOREIGN KEY (user_id) REFERENCES users;

ALTER TABLE post_tags
    ADD CONSTRAINT FKkifam22p4s1nm3bkmp1igcn5w
    FOREIGN KEY (post_id) REFERENCES posts;

ALTER TABLE post_tags
    ADD CONSTRAINT FKm6cfovkyqvu5rlm6ahdx3eavj
    FOREIGN KEY (tag_id) REFERENCES tags;

ALTER TABLE posts
    ADD CONSTRAINT FK5lidm6cqbc7u4xhqpxm898qme
    FOREIGN KEY (user_id) REFERENCES users;

ALTER TABLE reactions
    ADD CONSTRAINT FKh8b4h9wybhu8tc5w11e8t3krc
    FOREIGN KEY (post_id) REFERENCES posts;

ALTER TABLE reactions
    ADD CONSTRAINT FKqmewaibcp5bxtlqxc2cawhuln
    FOREIGN KEY (user_id) REFERENCES users;

ALTER TABLE role_claims
    ADD CONSTRAINT FK14fqq6y75war0ri3hle37yyuw
    FOREIGN KEY (role_id) REFERENCES roles;

ALTER TABLE saved_posts
    ADD CONSTRAINT FK9poxgdc1595vxdxkyg202x4ge
    FOREIGN KEY (post_id) REFERENCES posts;

ALTER TABLE saved_posts
    ADD CONSTRAINT FKs9a5ulcshnympbu557ps3qdlv
    FOREIGN KEY (user_id) REFERENCES users;

ALTER TABLE shares
    ADD CONSTRAINT FKfpp6g135xhgot3jns6pswavaf
    FOREIGN KEY (post_id) REFERENCES posts;

ALTER TABLE shares
    ADD CONSTRAINT FK3fm4apvet0nv9od7iomh0agj5
    FOREIGN KEY (user_id) REFERENCES users;
    user_id UUID PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    gender VARCHAR(255),
    avatarurl VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth TIMESTAMP,
    verify_status VARCHAR(255) NOT NULL CHECK (verify_status IN ('ACTIVE', 'INACTIVE', 'DELETED')),
    status VARCHAR(255) NOT NULL CHECK (status IN ('ONLINE', 'OFFLINE', 'HIDDEN', 'BANNED')),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE accounts (
    account_id UUID PRIMARY KEY,
    provider VARCHAR(255) NOT NULL,
    provider_id VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    access_token TEXT,
    refresh_token TEXT,
    is_verify VARCHAR(255) NOT NULL,
    create_at TIMESTAMP,
    update_at TIMESTAMP,
    user_id UUID NOT NULL
);

CREATE TABLE roles (
    role_id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE role_claims (
    role_claim_id UUID PRIMARY KEY,
    claim VARCHAR(100) NOT NULL,
    role_id UUID NOT NULL
);

CREATE TABLE account_roles (
    account_role_id UUID PRIMARY KEY,
    account_id UUID NOT NULL,
    role_id UUID NOT NULL,
    CONSTRAINT UKo778ut2m117mo7x47rsf4jnfc UNIQUE (account_id, role_id)
);

CREATE TABLE posts (
    post_id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    imageurl VARCHAR(255),
    status VARCHAR(255) NOT NULL CHECK (status IN ('PENDING', 'PUBLISHED', 'REJECTED')),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    user_id UUID NOT NULL
);

CREATE TABLE comments (
    comment_id UUID PRIMARY KEY,
    content TEXT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    parent_id UUID,
    post_id UUID NOT NULL,
    user_id UUID NOT NULL
);

CREATE TABLE tags (
    tag_id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE post_tags (
    post_tag_id UUID PRIMARY KEY,
    post_id UUID NOT NULL,
    tag_id UUID NOT NULL,
    CONSTRAINT UKkue6fyapamu2yta63lap4x1m5 UNIQUE (post_id, tag_id)
);

CREATE TABLE reactions (
    reaction_id UUID PRIMARY KEY,
    react VARCHAR(50) NOT NULL CHECK (react IN ('LIKE', 'LOVE', 'ANGRY', 'SAD')),
    created_at TIMESTAMP,
    post_id UUID NOT NULL,
    user_id UUID NOT NULL,
    CONSTRAINT UKku2sdambce8rmlflnobligv6w UNIQUE (user_id, post_id)
);

CREATE TABLE shares (
    share_id UUID PRIMARY KEY,
    created_at TIMESTAMP,
    post_id UUID NOT NULL,
    user_id UUID NOT NULL
);

CREATE TABLE saved_posts (
    saved_post_id UUID PRIMARY KEY,
    saved_at TIMESTAMP,
    post_id UUID NOT NULL,
    user_id UUID NOT NULL,
    CONSTRAINT UKpow12gmyapxhj0rnq680vfgkb UNIQUE (user_id, post_id)
);

CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY,
    message TEXT NOT NULL,
    status VARCHAR(255) NOT NULL CHECK (status IN ('READ', 'UNREAD')),
    type VARCHAR(50) NOT NULL CHECK (type IN ('COMMENT', 'SHARE', 'REACTION', 'SYSTEM')),
    created_at TIMESTAMP,
    post_id UUID,
    user_id UUID NOT NULL
);

CREATE TABLE communications (
    communication_id UUID PRIMARY KEY,
    message TEXT NOT NULL,
    created_at TIMESTAMP,
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL
);

CREATE TABLE moderation_logs (
    moderation_log_id UUID PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP,
    admin_id UUID NOT NULL,
    target_user_id UUID NOT NULL
);

-- Create indexes

CREATE INDEX idx_user_email ON users (email);
CREATE INDEX idx_user_username ON users (user_name);
CREATE INDEX idx_user_status ON users (status);

CREATE INDEX idx_post_user ON posts (user_id);
CREATE INDEX idx_post_created ON posts (created_at);

CREATE INDEX idx_comment_post ON comments (post_id);
CREATE INDEX idx_comment_parent ON comments (parent_id);
CREATE INDEX idx_comment_user ON comments (user_id);

-- Create foreign key constraints

ALTER TABLE role_claims
    ADD CONSTRAINT FK14fqq6y75war0ri3hle37yyuw
    FOREIGN KEY (role_id) REFERENCES roles (role_id);

ALTER TABLE account_roles
    ADD CONSTRAINT FK61h48dsir3h82pxbq3cwgp0ce
    FOREIGN KEY (account_id) REFERENCES accounts (account_id);

ALTER TABLE account_roles
    ADD CONSTRAINT FK6r8nxkn3hctohyllteivfr5hy
    FOREIGN KEY (role_id) REFERENCES roles (role_id);

ALTER TABLE posts
    ADD CONSTRAINT FKpost_user
    FOREIGN KEY (user_id) REFERENCES users (user_id);

ALTER TABLE comments
    ADD CONSTRAINT FKcomment_post
    FOREIGN KEY (post_id) REFERENCES posts (post_id);

ALTER TABLE comments
    ADD CONSTRAINT FKcomment_user
    FOREIGN KEY (user_id) REFERENCES users (user_id);

ALTER TABLE comments
    ADD CONSTRAINT FKcomment_parent
    FOREIGN KEY (parent_id) REFERENCES comments (comment_id);

ALTER TABLE communications
    ADD CONSTRAINT FK9hdap48h8uyh8rsh2j3nf1iar
    FOREIGN KEY (receiver_id) REFERENCES users (user_id);

ALTER TABLE moderation_logs
    ADD CONSTRAINT FKs424btsg4kr1j7pfgj2q99b46
    FOREIGN KEY (admin_id) REFERENCES users (user_id);

ALTER TABLE moderation_logs
    ADD CONSTRAINT FKhl76um0diam32iapdh13jxjmc
    FOREIGN KEY (target_user_id) REFERENCES users (user_id);

ALTER TABLE notifications
    ADD CONSTRAINT FK599539lym3mnkbqks0u806eac
    FOREIGN KEY (post_id) REFERENCES posts (post_id);
