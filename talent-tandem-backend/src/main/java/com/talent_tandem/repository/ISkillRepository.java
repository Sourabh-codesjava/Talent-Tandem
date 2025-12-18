package com.talent_tandem.repository;
import com.talent_tandem.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ISkillRepository extends JpaRepository<Skill,Long> {

    @Query("SELECT s.name FROM Skill s")
    List<String> getSkillNamesOnly();

}
