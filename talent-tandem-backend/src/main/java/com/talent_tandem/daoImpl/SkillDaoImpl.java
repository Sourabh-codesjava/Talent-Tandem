package com.talent_tandem.daoImpl;
import com.talent_tandem.dao.*;
import com.talent_tandem.model.*;
import com.talent_tandem.repository.*;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public class SkillDaoImpl implements ISkillDao {

    private final ISkillRepository repository;

    public SkillDaoImpl(ISkillRepository repository) {
        this.repository = repository;
    }

    @Override
    public Skill save(Skill skill) {
        return repository.save(skill);
    }

    @Override
    public Optional<Skill> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<Skill> findAll() {
        return repository.findAll();
    }

    @Override
    public List<String> getSkillNames() {
        return repository.getSkillNamesOnly();
    }

    @Override
    public List<Skill> saveAll(List<Skill> skillEntities) {
        return repository.saveAll(skillEntities);
    }
}
