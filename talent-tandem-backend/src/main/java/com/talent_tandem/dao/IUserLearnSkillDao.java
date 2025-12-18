package com.talent_tandem.dao;

import com.talent_tandem.model.*;

import java.util.List;
import java.util.Optional;

public interface IUserLearnSkillDao {

    UserLearnSkill save(UserLearnSkill learnSkill);

    Optional<UserLearnSkill> findById(Long id);

    List<UserLearnSkill> findByUserId(Long userId);

    boolean existsById(Long id);

    void deleteById(Long id);

    boolean existsByUserIdAndSkillId(Long userId, Long skillId);

}
