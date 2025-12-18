package com.talent_tandem.repository;

import com.talent_tandem.model.UserLearnSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IUserLearnSkillRepository extends JpaRepository<UserLearnSkill, Long> {

    List<UserLearnSkill> findByUserId(Long userId);

    List<UserLearnSkill> findBySkillId(Long skillId);

    Long countBySkillId(Long skillId);

    Long countByUserId(Long userId);

    boolean existsByUserIdAndSkillId(Long userId, Long skillId);
}
