package com.talent_tandem.daoImpl;

import com.talent_tandem.dao.*;
import com.talent_tandem.model.*;
import com.talent_tandem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class UserLearnSkillDaoImpl implements IUserLearnSkillDao {

    private final IUserLearnSkillRepository repo;

    @Override
    public UserLearnSkill save(UserLearnSkill learnSkill) {
        return repo.save(learnSkill);
    }

    @Override
    public Optional<UserLearnSkill> findById(Long id) {
        return repo.findById(id);
    }

    @Override
    public List<UserLearnSkill> findByUserId(Long userId) {
        return repo.findByUserId(userId);
    }

    @Override
    public boolean existsById(Long id) {
        return repo.existsById(id);
    }

    @Override
    public void deleteById(Long id) {
        repo.deleteById(id);
    }

    @Override
    public boolean existsByUserIdAndSkillId(Long userId, Long skillId) {
        return repo.existsByUserIdAndSkillId(userId, skillId);
    }
}
