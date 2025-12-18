package com.talent_tandem.daoImpl;

import com.talent_tandem.dao.*;
import com.talent_tandem.enums.*;
import com.talent_tandem.enums.*;
import com.talent_tandem.model.*;
import com.talent_tandem.repository.IUserTeachSkillRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public class UserTeachSkillDaoImpl implements IUserTeachSkillDao {

    private final IUserTeachSkillRepository repo;

    public UserTeachSkillDaoImpl(IUserTeachSkillRepository repository) {
        this.repo = repository;
    }

    @Override
    public UserTeachSkill save(UserTeachSkill entity) {
        return repo.save(entity);
    }

    @Override
    public List<UserTeachSkill> saveAll(List<UserTeachSkill> entities) {
        return repo.saveAll(entities);
    }

    @Override
    public UserTeachSkill findById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Teach Skill not found"));
    }

    @Override
    public List<UserTeachSkill> findByUserId(Long userId) {
        return repo.findByUserId(userId);
    }

    @Override
    public List<UserTeachSkill> findMatches(Long skillId, PreferedMode mode, Level level) {
        return repo.findMatches(skillId, mode, level);
    }

    @Override
    public List<UserTeachSkill> findBySkillId(Long skillId) {
        return repo.findBySkillId(skillId);

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
