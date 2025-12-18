package com.talent_tandem.repository;

import com.talent_tandem.enums.Level;
import com.talent_tandem.enums.PreferedMode;
import com.talent_tandem.model.UserTeachSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IUserTeachSkillRepository extends JpaRepository<UserTeachSkill, Long> {

        List<UserTeachSkill> findByUserId(Long userId);

        @Query("SELECT uts FROM UserTeachSkill uts " +
                        "WHERE uts.skill.id = :skillId " +
                        "ORDER BY " +
                        "CASE " +
                        "  WHEN uts.preferredMode = :mode AND uts.proficiencyLevel >= :level THEN 3 " +
                        "  WHEN uts.preferredMode = :mode OR uts.proficiencyLevel >= :level THEN 2 " +
                        "  ELSE 1 " +
                        "END DESC, " +
                        "uts.confidenceScore DESC")
        List<UserTeachSkill> findMatches(
                        @Param("skillId") Long skillId,
                        @Param("mode") PreferedMode mode,
                        @Param("level") Level level);

        List<UserTeachSkill> findBySkillId(Long skillId);

        Long countBySkillId(Long skillId);

        @Query("SELECT COUNT(uts) FROM UserTeachSkill uts WHERE uts.user.id = :userId")
        Long countByUserId(@Param("userId") Long userId);

        boolean existsByUserIdAndSkillId(Long userId, Long skillId);
}
