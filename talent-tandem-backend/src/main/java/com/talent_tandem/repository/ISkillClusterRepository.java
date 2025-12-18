package com.talent_tandem.repository;

import com.talent_tandem.model.SkillCluster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ISkillClusterRepository extends JpaRepository<SkillCluster, Long> {
    
    boolean existsByClusterName(String clusterName);
    
    @Query("SELECT sc FROM SkillCluster sc LEFT JOIN FETCH sc.skills")
    List<SkillCluster> findAllWithSkills();
}
