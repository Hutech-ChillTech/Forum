package com.forum.it.entities.system;

import java.time.LocalDate;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.forum.it.entities.user.User;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "communications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({ "sender", "receiver" })
public class Communication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID communicationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "senderId", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiverId", nullable = false)
    private User receiver;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @CreationTimestamp
    private LocalDate createdAt;
}
