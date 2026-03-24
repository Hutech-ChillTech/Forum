package com.forum.it.dtos.response;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.forum.it.entities.user.AccountStatus;
import com.forum.it.entities.user.Gender;
import com.forum.it.entities.user.User;
import com.forum.it.entities.user.UserStatus;
import com.forum.it.entities.user.Account;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    private UUID userId;
    private UUID accountId;
    private String userName;
    private String fullName;
    private String email;
    private Gender gender;
    private String avatarURL;
    private String phone;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;

    private UserStatus verifyStatus;
    private AccountStatus status;
    private String roleName;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate updatedAt;

    public UserResponse(User user) {
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

    public UserResponse(User user, UUID accountId, String roleName) {
        this(user);
        this.accountId = accountId;
        this.roleName = roleName;
    }
}
