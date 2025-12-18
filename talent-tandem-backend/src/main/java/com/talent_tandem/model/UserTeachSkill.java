package com.talent_tandem.model;
import com.talent_tandem.enums.Level;
import com.talent_tandem.enums.PreferedMode;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_teach_skill")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserTeachSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long teachId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Enumerated(EnumType.STRING)
    private Level proficiencyLevel;

    @Enumerated(EnumType.STRING)
    private PreferedMode preferredMode;

    @ManyToOne
    @JoinColumn(name = "availability_id", nullable = false)
    private Availability availability;

    private Integer confidenceScore;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
