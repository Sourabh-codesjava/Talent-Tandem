package com.talent_tandem.daoImpl;
import com.talent_tandem.dao.*;
import com.talent_tandem.model.*;
import com.talent_tandem.repository.*;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public class TagDaoImpl implements ITagDao {

    private final ITagRepository repository;

    public TagDaoImpl(ITagRepository repository) {
        this.repository = repository;
    }

    @Override
    public Tag save(Tag tag) {
        return repository.save(tag);
    }

    @Override
    public List<Tag> findBySkillId(Long skillId) {
        return repository.findBySkillId(skillId);
    }

    @Override
    public Optional<Tag> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<Tag> findAll() {
        return repository.findAll();
    }

    @Override
    public List<Tag> saveAll(List<Tag> tagEntities) {
        return repository.saveAll(tagEntities);
    }
}
