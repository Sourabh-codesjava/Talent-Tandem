package com.talent_tandem.repository;
import com.talent_tandem.model.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ITagRepository extends JpaRepository<Tag, Long> {

    List<Tag> findBySkillId(Long skillId);
}
