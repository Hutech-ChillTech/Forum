-- ============================================================
-- V2: Follow system + Pending messages
-- Date: 2026-03-19
-- ============================================================

-- ── 1. Bảng follows ──────────────────────────────────────────────────────────
CREATE TABLE follows (
    follow_id    UUID        NOT NULL,
    follower_id  UUID        NOT NULL,
    following_id UUID        NOT NULL,
    created_at   TIMESTAMP,
    PRIMARY KEY (follow_id),
    UNIQUE (follower_id, following_id)
);

CREATE INDEX idx_follow_follower  ON follows (follower_id);
CREATE INDEX idx_follow_following ON follows (following_id);

ALTER TABLE follows
    ADD CONSTRAINT fk_follow_follower
    FOREIGN KEY (follower_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE follows
    ADD CONSTRAINT fk_follow_following
    FOREIGN KEY (following_id) REFERENCES users(user_id) ON DELETE CASCADE;

-- ── 2. Thêm cột status vào communications ────────────────────────────────────
-- NORMAL  = tin nhắn giữa mutual follow (inbox chính)
-- PENDING = tin nhắn chờ từ người chưa mutual follow (Message Requests)
ALTER TABLE communications
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'NORMAL'
        CHECK (status IN ('NORMAL', 'PENDING'));

-- Index hỗ trợ lọc theo status
CREATE INDEX idx_comm_status   ON communications (status);
CREATE INDEX idx_comm_sender   ON communications (sender_id);
CREATE INDEX idx_comm_receiver ON communications (receiver_id);

-- ── 3. Cập nhật CHECK constraint của notifications (thêm FOLLOW) ─────────────
ALTER TABLE notifications
    DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications
    ADD CONSTRAINT notifications_type_check
    CHECK (type IN ('COMMENT', 'SHARE', 'REACTION', 'FOLLOW', 'SYSTEM'));
