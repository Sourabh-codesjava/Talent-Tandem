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
@Table(name = "user_learn_skill")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserLearnSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Enumerated(EnumType.STRING)
    private Level priorityLevel;

    @Enumerated(EnumType.STRING)
    private PreferedMode preferredMode;

    @ManyToOne
    @JoinColumn(name = "availability_id")
    private Availability availability;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

}
