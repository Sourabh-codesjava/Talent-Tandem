package com.talent_tandem.dao;

import com.talent_tandem.enums.*;
import com.talent_tandem.enums.*;
import com.talent_tandem.model.*;
import java.util.List;

public interface IUserTeachSkillDao {

    UserTeachSkill save(UserTeachSkill entity);

    List<UserTeachSkill> saveAll(List<UserTeachSkill> entities);

    UserTeachSkill findById(Long id);

    List<UserTeachSkill> findByUserId(Long userId);

    List<UserTeachSkill> findMatches(Long skillId, PreferedMode mode, Level level);

    List<UserTeachSkill> findBySkillId(Long skillId);

    boolean existsById(Long id);

    void deleteById(Long id);

    boolean existsByUserIdAndSkillId(Long userId, Long skillId);
}
