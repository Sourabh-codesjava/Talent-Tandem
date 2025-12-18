package com.talent_tandem.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "admin_matching_rules")
public class AdminMatchingRules {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "skill_match_threshold")
    private Double skillMatchThreshold;

    @Column(name = "availability_match_weight")
    private Double availabilityMatchWeight;

    @Column(name = "rating_weight")
    private Double ratingWeight;

    @Column(name = "experience_weight")
    private Double experienceWeight;

    @Column(name = "max_matching_distance")
    private Integer maxMatchingDistance;

    @Column(name = "enable_location_matching")
    private Boolean enableLocationMatching;

    @Column(name = "custom_rules", columnDefinition = "TEXT")
    private String customRules;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}