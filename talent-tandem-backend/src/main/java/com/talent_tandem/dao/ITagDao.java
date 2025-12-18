package com.talent_tandem.dao;
import com.talent_tandem.model.*;
import java.util.List;
import java.util.Optional;

public interface ITagDao {

    Tag save(Tag tag);
    List<Tag> findBySkillId(Long skillId);
    Optional<Tag> findById(Long id);
    List<Tag> findAll();
    List<Tag> saveAll(List<Tag> tagEntities);
}
