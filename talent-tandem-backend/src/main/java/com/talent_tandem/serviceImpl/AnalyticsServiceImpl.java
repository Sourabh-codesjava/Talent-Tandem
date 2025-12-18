package com.talent_tandem.serviceImpl;

import com.talent_tandem.enums.ParticipantRole;
import com.talent_tandem.enums.SessionStatus;
import com.talent_tandem.model.Session;
import com.talent_tandem.model.SessionParticipant;
import com.talent_tandem.repository.ISessionParticipantRepository;
import com.talent_tandem.responsedto.AnalyticsResponseDTO;
import com.talent_tandem.service.IAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements IAnalyticsService {

    private final ISessionParticipantRepository sessionParticipantRepository;

    @Override
    public AnalyticsResponseDTO getUserAnalytics(Long userId) {
        List<SessionParticipant> history = sessionParticipantRepository.findByUserIdOrderByJoinedAtDesc(userId);

        long learningMinutes = 0;
        long teachingMinutes = 0;
        long sessionsAttended = 0;
        long sessionsConducted = 0;

        for (SessionParticipant participant : history) {
            Session session = participant.getSession();

            // Only count completed sessions for analytics
            if (session != null && session.getStatus() == SessionStatus.COMPLETED) {
                if (participant.getRole() == ParticipantRole.LEARNER) {
                    // Learner
                    if (session.getDurationMinutes() != null) {
                        learningMinutes += session.getDurationMinutes();
                    }
                    sessionsAttended++;
                } else if (participant.getRole() == ParticipantRole.MENTOR) {
                    // Mentor
                    if (session.getDurationMinutes() != null) {
                        teachingMinutes += session.getDurationMinutes();
                    }
                    sessionsConducted++;
                }
            }
        }

        return AnalyticsResponseDTO.builder()
                .learningTotalMinutes(learningMinutes)
                .teachingTotalMinutes(teachingMinutes)
                .sessionsAttended(sessionsAttended)
                .sessionsConducted(sessionsConducted)
                .build();
    }
}
