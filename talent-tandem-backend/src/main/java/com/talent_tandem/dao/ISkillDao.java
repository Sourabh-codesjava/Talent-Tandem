package com.talent_tandem.dao;
import com.talent_tandem.model.*;
import java.util.List;
import java.util.Optional;

public interface ISkillDao {

    Skill save(Skill skill);
    Optional<Skill> findById(Long id);
    List<Skill> findAll();
    List<String> getSkillNames();
    List<Skill> saveAll(List<Skill> skillEntities);
}
