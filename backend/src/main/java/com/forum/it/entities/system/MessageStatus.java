package com.forum.it.entities.system;

/**
 * Trạng thái của một tin nhắn trong hệ thống chat.
 *
 * NORMAL  - Tin nhắn bình thường giữa hai người mutual follow (bạn bè).
 *           Hiển thị trong inbox chính.
 * PENDING - Tin nhắn từ người chưa mutual follow.
 *           Nằm trong "Message Requests" cho đến khi được chấp nhận / từ chối.
 */
public enum MessageStatus {
    NORMAL,
    PENDING
}
