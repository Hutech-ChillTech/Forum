package com.forum.it.models.response;

import java.time.LocalDateTime;
import java.util.UUID;

import com.forum.it.entities.user.AccountStatus;
import com.forum.it.entities.user.Gender;
import com.forum.it.entities.user.User;
import com.forum.it.entities.user.UserStatus;

public class UserResponse {

    private UUID userId;
    private String userName;
    private String fullName;
    private String email;
    private Gender gender;
    private String avatarURL;
    private String phone;
    private LocalDateTime dateOfBirth;
    private UserStatus verifyStatus;
    private AccountStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public UserResponse() {
    }

    public UserResponse(User user) {
        this.userId = user.getUserId();
        this.userName = user.getUserName();
        this.fullName = user.getFullName();
        this.email = user.getEmail();
        this.gender = user.getGender();
        this.avatarURL = user.getAvatarURL();
        this.phone = user.getPhone();
        this.dateOfBirth = user.getDateOfBirth();
        this.verifyStatus = user.getVerifyStatus();
        this.status = user.getStatus();
        this.createdAt = user.getCreatedAt();
        this.updatedAt = user.getUpdatedAt();
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }

    public String getAvatarURL() {
        return avatarURL;
    }

    public void setAvatarURL(String avatarURL) {
        this.avatarURL = avatarURL;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public LocalDateTime getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDateTime dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public UserStatus getVerifyStatus() {
        return verifyStatus;
    }

    public void setVerifyStatus(UserStatus verifyStatus) {
        this.verifyStatus = verifyStatus;
    }

    public AccountStatus getStatus() {
        return status;
    }

    public void setStatus(AccountStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
