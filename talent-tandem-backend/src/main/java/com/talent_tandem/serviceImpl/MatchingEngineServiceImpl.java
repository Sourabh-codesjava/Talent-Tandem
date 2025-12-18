package com.talent_tandem.serviceImpl;

import com.talent_tandem.requestdto.MatchRequest;
import com.talent_tandem.responsedto.MentorMatchResponse;
import com.talent_tandem.service.IMatchingEngineService;
import com.talent_tandem.service.IAIService;
import com.talent_tandem.repository.IUserTeachSkillRepository;
import com.talent_tandem.model.UserTeachSkill;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Arrays;
import java.util.stream.Collectors;

@Service
public class MatchingEngineServiceImpl implements IMatchingEngineService {

        @Autowired
        private IUserTeachSkillRepository userTeachSkillRepository;

        @Autowired
        private IAIService aiService;

        @Override
        public List<MentorMatchResponse> findMatches(MatchRequest request) {
                // Fetch all mentors for the skill first
                List<UserTeachSkill> mentors = userTeachSkillRepository.findBySkillId(request.getSkillId());

                // Sort in Java to avoid JPQL complexity/issues
                return mentors.stream()
                                .sorted((m1, m2) -> {
                                        int score1 = calculateMatchScore(m1, request);
                                        int score2 = calculateMatchScore(m2, request);

                                        if (score1 != score2) {
                                                return Integer.compare(score2, score1); // Descending score
                                        }
                                        return Integer.compare(m2.getConfidenceScore(), m1.getConfidenceScore()); // Descending
                                                                                                                  // confidence
                                })
                                .map(mentor -> buildMatchResponse(mentor))
                                .collect(Collectors.toList());
        }

        private int calculateMatchScore(UserTeachSkill mentor, MatchRequest request) {
                boolean modeMatch = mentor.getPreferredMode() == request.getPreferredMode();
                boolean levelMatch = mentor.getProficiencyLevel().ordinal() >= request.getPriorityLevel().ordinal();

                if (modeMatch && levelMatch)
                        return 3;
                if (modeMatch || levelMatch)
                        return 2;
                return 1;
        }

        private MentorMatchResponse buildMatchResponse(UserTeachSkill mentor) {
                String mentorName = mentor.getUser().getFirstName() + " " + mentor.getUser().getLastName();
                String skillName = mentor.getSkill().getName();
                String experience = mentor.getProficiencyLevel().toString();
                String timeSlot = mentor.getPreferredMode().toString();

                String aiExplanation = aiService.generateMatchExplanation(
                                mentorName,
                                Arrays.asList(skillName),
                                experience,
                                timeSlot);

                return MentorMatchResponse.builder()
                                .mentorId(mentor.getUser().getId())
                                .mentorName(mentorName)
                                .skillId(mentor.getSkill().getId())
                                .proficiencyLevel(mentor.getProficiencyLevel())
                                .confidenceScore(mentor.getConfidenceScore())
                                .preferredMode(mentor.getPreferredMode())
                                .matchExplanation(aiExplanation)
                                .build();
        }

}