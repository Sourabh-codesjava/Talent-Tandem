package com.talent_tandem.repository;

import com.talent_tandem.model.AdminMatchingRules;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface IAdminMatchingRulesRepository extends JpaRepository<AdminMatchingRules, Long> {

    @Query("SELECT r FROM AdminMatchingRules r ORDER BY r.updatedAt DESC")
    List<AdminMatchingRules> findLatestRulesOrderByUpdatedAtDesc(Pageable pageable);

    default Optional<AdminMatchingRules> findLatestRules() {
        List<AdminMatchingRules> rules = findLatestRulesOrderByUpdatedAtDesc(Pageable.ofSize(1));
        return rules.isEmpty() ? Optional.empty() : Optional.of(rules.get(0));
    }
}