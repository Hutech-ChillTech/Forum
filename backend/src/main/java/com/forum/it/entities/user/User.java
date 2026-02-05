package com.forum.it.entities.user;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.forum.it.entities.account.AccountStatus;
import com.forum.it.entities.post.Comment;
import com.forum.it.entities.post.Post;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users", indexes = {
                @Index(name = "idx_user_email", columnList = "email"),
                @Index(name = "idx_user_username", columnList = "userName"),
                @Index(name = "idx_user_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({ "posts", "comments" })
public class User {

        @Id
        @GeneratedValue(strategy = GenerationType.UUID)
        private UUID userId;

        @Column(nullable = false, length = 100)
        private String userName;

        @Column(length = 255)
        private String fullName;

        @Column(nullable = false, length = 255)
        private String password;

        @Column(nullable = false, unique = true, length = 255)
        private String email;

        @Enumerated(EnumType.STRING)
        private Gender gender;

        @Column(length = 255)
        private String avatarURL;

        @Column(length = 20)
        private String phone;

        private LocalDateTime dateOfBirth;

        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        private UserStatus verifyStatus = UserStatus.ACTIVE;

        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        private AccountStatus status = AccountStatus.OFFLINE;

        @CreationTimestamp
        private LocalDateTime createdAt;

        @UpdateTimestamp
        private LocalDateTime updatedAt;

        @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
        private List<Post> posts;

        @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
        private List<Comment> comments;
}
