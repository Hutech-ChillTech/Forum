package com.forum.it.entities.user;

import java.util.UUID;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "role_claims")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleClaim {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID roleClaimId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roleId", nullable = false)
    private Role role;

    @Column(nullable = false, length = 100)
    private String claim;
}