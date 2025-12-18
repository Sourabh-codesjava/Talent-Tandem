package com.talent_tandem.serviceImpl;

import com.talent_tandem.dao.ISessionDao;
import com.talent_tandem.dao.ISkillDao;
import com.talent_tandem.dao.IUserDao;
import com.talent_tandem.enums.SessionStatus;
import com.talent_tandem.enums.ParticipantRole;
import com.talent_tandem.enums.ParticipantStatus;
import com.talent_tandem.exception.InsufficientCoinsException;
import com.talent_tandem.exception.ResourceNotFoundException;
import com.talent_tandem.exception.UnauthorizedAccessException;
import com.talent_tandem.model.*;
import com.talent_tandem.requestdto.SessionRequest;
import com.talent_tandem.responsedto.*;
import com.talent_tandem.repository.IAvailabilityRepository;
import com.talent_tandem.repository.IUserLearnSkillRepository;
import com.talent_tandem.repository.IUserTeachSkillRepository;
import com.talent_tandem.service.ISessionService;
import com.talent_tandem.service.IWalletService;
import com.talent_tandem.websocket.MatchNotificationDto;
import com.talent_tandem.websocket.SessionBookingDto;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SessionServiceImpl implements ISessionService {

    private static final Logger logger = LoggerFactory.getLogger(SessionServiceImpl.class);
    private static final int SESSION_COIN_COST = 10;

    private final ISessionDao sessionDao;
    private final IUserDao userDao;
    private final ISkillDao skillDao;
    private final SimpMessagingTemplate messagingTemplate;
    private final IWalletService walletService;
    private final IAvailabilityRepository availabilityRepository;
    private final IUserTeachSkillRepository userTeachSkillRepository;
    private final IUserLearnSkillRepository userLearnSkillRepository;

    @Override
    @Transactional
    public SessionResponse createSession(SessionRequest request) {

        User mentor = userDao.findById(request.getMentorId())
                .orElseThrow(() -> new RuntimeException("Mentor not found"));
        Skill skill = skillDao.findById(request.getSkillId())
                .orElseThrow(() -> new RuntimeException("Skill not found"));


        if (!walletService.hasEnoughCoins(request.getLearnerId(), SESSION_COIN_COST)) {
            logger.error("Learner {} has insufficient coins to book session", request.getLearnerId());
            throw new InsufficientCoinsException(
                "Insufficient coins. You need " + SESSION_COIN_COST + " coins to book a session."
            );
        }

        // Deduct coins from learner
        walletService.debitCoins(request.getLearnerId(), SESSION_COIN_COST);
        logger.info("Debited {} coins from learner {} for booking session", SESSION_COIN_COST, request.getLearnerId());

        Session session = Session.builder()
                .skill(skill)
                .agenda(request.getAgenda())
                .status(SessionStatus.REQUESTED)
                .scheduledTime(request.getScheduledTime())
                .durationMinutes(request.getDurationMinutes())
                .learningOutcomes(request.getLearningOutcomes())
                .build();

        Session savedSession = sessionDao.save(session);

        SessionParticipant mentorParticipant = SessionParticipant.builder()
                .session(savedSession)
                .user(mentor)
                .role(ParticipantRole.MENTOR)
                .status(ParticipantStatus.INVITED)
                .build();
        sessionDao.saveParticipant(mentorParticipant);

        if ("GROUP".equals(request.getSessionType()) && request.getLearnerIds() != null) {
            // Group session - add multiple learners
            for (Long learnerId : request.getLearnerIds()) {
                User groupLearner = userDao.findById(learnerId)
                        .orElseThrow(() -> new RuntimeException("Learner not found: " + learnerId));
                SessionParticipant learnerParticipant = SessionParticipant.builder()
                        .session(savedSession)
                        .user(groupLearner)
                        .role(ParticipantRole.LEARNER)
                        .status(ParticipantStatus.INVITED)
                        .build();
                sessionDao.saveParticipant(learnerParticipant);
            }
        } else if (request.getLearnerId() != null) {
            // One-to-one session - single learner
            User singleLearner = userDao.findById(request.getLearnerId())
                    .orElseThrow(() -> new RuntimeException("Learner not found"));
            SessionParticipant learnerParticipant = SessionParticipant.builder()
                    .session(savedSession)
                    .user(singleLearner)
                    .role(ParticipantRole.LEARNER)
                    .status(ParticipantStatus.INVITED)
                    .build();
            sessionDao.saveParticipant(learnerParticipant);
        }

        // Session ko participants ke saath reload karo
        Session reloadedSession = sessionDao.findById(savedSession.getSessionId()).orElse(savedSession);
        SessionResponse response = buildSessionResponse(reloadedSession);

        // Send notification only if mentor ID exists
        if (response.getMentorId() != null) {
            try {
                SessionBookingDto notification = new SessionBookingDto();
                notification.setSessionId(response.getSessionId());
                notification.setMentorId(response.getMentorId());
                notification.setLearnerId(response.getLearnerId());
                notification.setLearnerName(response.getLearnerName());
                notification.setMentorName(response.getMentorName());
                notification.setSkillName(response.getSkillName());
                notification.setScheduledTime(response.getScheduledTime());
                notification.setAgenda(response.getAgenda());
                notification.setDurationMinutes(response.getDurationMinutes());
                notification.setNotificationType("REQUEST");
                notification.setActionable(true);
                notification.setMessage(
                        "New session request from " + response.getLearnerName() + " for " + response.getSkillName());

                messagingTemplate.convertAndSend(
                        "/queue/user/" + response.getMentorId() + "/sessions",
                        notification);

                logger.info("Notification sent to mentor {} for new session request from learner {}",
                        response.getMentorId(), response.getLearnerId());
            } catch (Exception e) {
                logger.error("Failed to send WebSocket notification: {}", e.getMessage());
            }
        } else {
            logger.warn("Cannot send notification - mentor ID is null for session {}", savedSession.getSessionId());
        }

        return response;
    }

    @Override
    @Transactional
    public SessionResponse updateSessionStatus(Long sessionId, SessionStatus status) {

        Session updatedSession = sessionDao.updateStatus(sessionId, status);

        if (updatedSession == null) {
            throw new RuntimeException("Session not found with ID: " + sessionId);
        }

        SessionResponse response = buildSessionResponse(updatedSession);

        // ✅ Only notify learner when mentor accepts/rejects
        if (status == SessionStatus.ACCEPTED || status == SessionStatus.CANCELLED) {
            if (response.getLearnerId() != null) {
                try {
                    SessionBookingDto notification = new SessionBookingDto();
                    notification.setSessionId(response.getSessionId());
                    notification.setMentorId(response.getMentorId());
                    notification.setLearnerId(response.getLearnerId());
                    notification.setLearnerName(response.getLearnerName());
                    notification.setMentorName(response.getMentorName());
                    notification.setSkillName(response.getSkillName());
                    notification.setScheduledTime(response.getScheduledTime());
                    notification.setActionable(false);

                    if (status == SessionStatus.ACCEPTED) {
                        notification.setNotificationType("ACCEPTED");
                        notification.setMessage("Your session has been accepted by " + response.getMentorName() + "!");
                    } else {
                        notification.setNotificationType("DECLINED");
                        notification.setMessage("Your session request was declined by " + response.getMentorName());
                    }

                    messagingTemplate.convertAndSend(
                            "/queue/user/" + response.getLearnerId() + "/sessions",
                            notification);

                    logger.info("Notification sent to learner {} for session {} with status {}",
                            response.getLearnerId(), sessionId, status);
                } catch (Exception e) {
                    logger.error("Failed to send WebSocket notification: {}", e.getMessage());
                }
            } else {
                logger.warn("Cannot send notification - learner ID is null for session {}", sessionId);
            }
        }

        // ✅ Notify both participants when session starts
        if (status == SessionStatus.IN_PROGRESS) {
            // Notify learner
            if (response.getLearnerId() != null) {
                try {
                    SessionBookingDto learnerNotification = new SessionBookingDto();
                    learnerNotification.setSessionId(response.getSessionId());
                    learnerNotification.setMentorId(response.getMentorId());
                    learnerNotification.setLearnerId(response.getLearnerId());
                    learnerNotification.setLearnerName(response.getLearnerName());
                    learnerNotification.setMentorName(response.getMentorName());
                    learnerNotification.setSkillName(response.getSkillName());
                    learnerNotification.setScheduledTime(response.getScheduledTime());
                    learnerNotification.setDurationMinutes(response.getDurationMinutes());
                    learnerNotification.setNotificationType("STARTED");
                    learnerNotification.setActionable(true);
                    learnerNotification.setMessage("Your session with " + response.getMentorName() + " has started!");

                    messagingTemplate.convertAndSend(
                            "/queue/user/" + response.getLearnerId() + "/sessions",
                            learnerNotification);

                    logger.info("Session start notification sent to learner {} for session {}",
                            response.getLearnerId(), sessionId);
                } catch (Exception e) {
                    logger.error("Failed to send start notification to learner: {}", e.getMessage());
                }
            }

            // Notify mentor
            if (response.getMentorId() != null) {
                try {
                    SessionBookingDto mentorNotification = new SessionBookingDto();
                    mentorNotification.setSessionId(response.getSessionId());
                    mentorNotification.setMentorId(response.getMentorId());
                    mentorNotification.setLearnerId(response.getLearnerId());
                    mentorNotification.setLearnerName(response.getLearnerName());
                    mentorNotification.setMentorName(response.getMentorName());
                    mentorNotification.setSkillName(response.getSkillName());
                    mentorNotification.setScheduledTime(response.getScheduledTime());
                    mentorNotification.setDurationMinutes(response.getDurationMinutes());
                    mentorNotification.setNotificationType("STARTED");
                    mentorNotification.setActionable(true);
                    mentorNotification.setMessage("Your session with " + response.getLearnerName() + " has started!");

                    messagingTemplate.convertAndSend(
                            "/queue/user/" + response.getMentorId() + "/sessions",
                            mentorNotification);

                    logger.info("Session start notification sent to mentor {} for session {}",
                            response.getMentorId(), sessionId);
                } catch (Exception e) {
                    logger.error("Failed to send start notification to mentor: {}", e.getMessage());
                }
            }

            logger.info("Session start notifications sent to both participants for session {}", sessionId);
        }

        return response;
    }

    @Override
    public List<SessionResponse> getSessionsByUser(Long userId) {
        return sessionDao.findByUserId(userId)
                .stream()
                .map(this::buildSessionResponse)
                .collect(Collectors.toList());
    }

    @Override
    public SessionResponse getSessionById(Long sessionId) {
        Session session = sessionDao.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        return buildSessionResponse(session);
    }

    @Override
    public void sendMatchNotification(MatchNotificationDto matchDto) {
        messagingTemplate.convertAndSend(
                "/queue/user/" + matchDto.getLearnerId() + "/matches",
                matchDto);
    }

    @Override
    @Transactional
    public SessionJoinResponse joinSession(Long sessionId, Long learnerId) {
        logger.info("Learner {} attempting to join session {}", learnerId, sessionId);

        Session session = sessionDao.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + sessionId));

        List<SessionParticipant> participants = session.getParticipants();

        SessionParticipant learnerParticipant = participants.stream()
                .filter(p -> p.getRole() == ParticipantRole.LEARNER && p.getUser().getId().equals(learnerId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Learner not found in session participants"));

        if (learnerParticipant.getStatus() == ParticipantStatus.JOINED) {
            logger.warn("Learner {} already joined session {}", learnerId, sessionId);
            Integer learnerCoins = walletService.getWalletByUserId(learnerId).getCoins();
            return SessionJoinResponse.builder()
                    .sessionId(sessionId)
                    .learnerCoins(learnerCoins)
                    .mentorCoins(0)
                    .forceBecomeTeacher(false)
                    .message("Already joined this session")
                    .build();
        }

        // Coins already deducted at booking time, just mark as joined
        learnerParticipant.setStatus(ParticipantStatus.JOINED);
        sessionDao.saveParticipant(learnerParticipant);
        logger.info("Updated learner participant status to JOINED");

        Integer learnerCoins = walletService.getWalletByUserId(learnerId).getCoins();
        boolean forceBecomeTeacher = learnerCoins == 0;

        logger.info("Session join successful. Learner coins: {}, Force teacher: {}",
                    learnerCoins, forceBecomeTeacher);

        return SessionJoinResponse.builder()
                .sessionId(sessionId)
                .learnerCoins(learnerCoins)
                .mentorCoins(0)
                .forceBecomeTeacher(forceBecomeTeacher)
                .message("Session joined successfully.")
                .build();
    }

    @Override
    @Transactional
    public SessionStartResponse startSession(Long sessionId, Long mentorId) {
        logger.info("Mentor {} attempting to start session {}", mentorId, sessionId);

        Session session = sessionDao.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + sessionId));

        if (session.getStatus() != SessionStatus.ACCEPTED) {
            throw new IllegalStateException("Session must be ACCEPTED before starting. Current status: " + session.getStatus());
        }

        List<SessionParticipant> participants = session.getParticipants();

        User mentor = participants.stream()
                .filter(p -> p.getRole() == ParticipantRole.MENTOR)
                .map(SessionParticipant::getUser)
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Mentor not found for session"));

        logger.info("Session mentor ID: {}, Requesting user ID: {}", mentor.getId(), mentorId);
        
        if (!mentor.getId().equals(mentorId)) {
            logger.error("Authorization failed - Session mentor: {}, Requesting user: {}", mentor.getId(), mentorId);
            throw new UnauthorizedAccessException("Only the mentor can start this session");
        }

        session.setStatus(SessionStatus.LIVE);
        sessionDao.save(session);
        logger.info("Session {} marked as LIVE", sessionId);

        return SessionStartResponse.builder()
                .sessionId(sessionId)
                .status("LIVE")
                .message("Session started successfully. Pre-chat is now disabled.")
                .build();
    }

    @Override
    @Transactional
    public SessionCompleteResponse completeSession(Long sessionId, Long mentorId) {
        logger.info("User {} attempting to complete session {}", mentorId, sessionId);

        Session session = sessionDao.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + sessionId));

        if (session.getStatus() == SessionStatus.COMPLETED) {
            throw new IllegalStateException("Session already completed");
        }

        List<SessionParticipant> participants = session.getParticipants();

        User mentor = participants.stream()
                .filter(p -> p.getRole() == ParticipantRole.MENTOR)
                .map(SessionParticipant::getUser)
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Mentor not found for session"));

        if (!mentor.getId().equals(mentorId)) {
            logger.warn("User {} tried to complete session {} but only mentor {} can complete it", 
                mentorId, sessionId, mentor.getId());
            throw new UnauthorizedAccessException("Only the mentor can complete this session");
        }

        User learner = participants.stream()
                .filter(p -> p.getRole() == ParticipantRole.LEARNER)
                .map(SessionParticipant::getUser)
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Learner not found for session"));

        Long learnerId = learner.getId();

        // Credit coins to mentor (coins already deducted at booking time)
        walletService.creditCoins(mentorId, SESSION_COIN_COST);
        logger.info("Credited {} coins to mentor {} on session completion", SESSION_COIN_COST, mentorId);

        session.setStatus(SessionStatus.COMPLETED);
        sessionDao.save(session);
        logger.info("Session {} marked as COMPLETED", sessionId);

        // Send feedback notification to learner
        try {
            SessionBookingDto feedbackNotification = new SessionBookingDto();
            feedbackNotification.setSessionId(sessionId);
            feedbackNotification.setAction("OPEN_FEEDBACK_FORM");
            feedbackNotification.setMentorId(mentorId);
            feedbackNotification.setLearnerId(learnerId);
            feedbackNotification.setMessage("Session completed! Please provide feedback.");

            messagingTemplate.convertAndSend(
                    "/queue/user/" + learnerId + "/feedback",
                    feedbackNotification);

            logger.info("Feedback notification sent to learner {} for session {}", learnerId, sessionId);
        } catch (Exception e) {
            logger.error("Failed to send feedback notification: {}", e.getMessage());
        }

        Integer learnerCoins = walletService.getWalletByUserId(learnerId).getCoins();
        Integer mentorCoins = walletService.getWalletByUserId(mentorId).getCoins();
        boolean forceBecomeTeacher = learnerCoins == 0;

        logger.info("Session complete. Learner coins: {}, Mentor coins: {}, Force teacher: {}",
                learnerCoins, mentorCoins, forceBecomeTeacher);

        return SessionCompleteResponse.builder()
                .learnerCoins(learnerCoins)
                .mentorCoins(mentorCoins)
                .forceBecomeTeacher(forceBecomeTeacher)
                .message("Session completed successfully. " + SESSION_COIN_COST + " coins transferred to mentor.")
                .build();
    }

    private SessionResponse buildSessionResponse(Session session) {

        if (session == null) {
            throw new RuntimeException("Session is null while building response");
        }

        List<SessionParticipant> participants = session.getParticipants();
        if (participants == null) {
            participants = new ArrayList<>();
        }

        User mentor = participants.stream()
                .filter(p -> p.getRole() == ParticipantRole.MENTOR)
                .map(SessionParticipant::getUser)
                .findFirst()
                .orElse(null);

        User learner = participants.stream()
                .filter(p -> p.getRole() == ParticipantRole.LEARNER)
                .map(SessionParticipant::getUser)
                .findFirst()
                .orElse(null);

        // ✅ Skill null safety
        Long skillId = session.getSkill() != null ? session.getSkill().getId() : null;
        String skillName = session.getSkill() != null ? session.getSkill().getName() : "Unknown Skill";

        // ✅ Fetch mentor availability
        AvailabilityResponse mentorAvailability = null;
        if (mentor != null) {
            mentorAvailability = availabilityRepository.findByUserId(mentor.getId())
                    .map(availability -> {
                        AvailabilityResponse response = new AvailabilityResponse();
                        response.setId(availability.getId());
                        response.setUserId(mentor.getId());
                        response.setUserName(mentor.getUsername());
                        response.setDayOfWeek(availability.getDayOfWeek() != null ? availability.getDayOfWeek().name() : null);
                        response.setStartTime(availability.getStartTime());
                        response.setEndTime(availability.getEndTime());
                        return response;
                    })
                    .orElse(null);
        }

        return SessionResponse.builder()
                .sessionId(session.getSessionId())

                // ✅ Mentor Safe Mapping
                .mentorId(mentor != null ? mentor.getId() : null)
                .mentorName(mentor != null ? mentor.getUsername() : "Mentor")
                .mentorAvailability(mentorAvailability)

                // ✅ Learner Safe Mapping
                .learnerId(learner != null ? learner.getId() : null)
                .learnerName(learner != null ? learner.getUsername() : "Learner")

                // ✅ Skill Safe Mapping
                .skillId(skillId)
                .skillName(skillName)

                .agenda(session.getAgenda())
                .status(session.getStatus())
                .scheduledTime(session.getScheduledTime())
                .durationMinutes(session.getDurationMinutes())
                .learningOutcomes(session.getLearningOutcomes())
                .createdAt(session.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public SessionResponse cancelSessionByMentor(Long sessionId, Long mentorId) {
        logger.info("Mentor {} cancelling session {}", mentorId, sessionId);

        Session session = sessionDao.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + sessionId));

        if (session.getStatus() == SessionStatus.COMPLETED || session.getStatus() == SessionStatus.CANCELLED) {
            throw new IllegalStateException("Cannot cancel session with status: " + session.getStatus());
        }

        // Verify mentor authorization
        User mentor = session.getParticipants().stream()
                .filter(p -> p.getRole() == ParticipantRole.MENTOR)
                .map(SessionParticipant::getUser)
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Mentor not found for session"));

        if (!mentor.getId().equals(mentorId)) {
            throw new UnauthorizedAccessException("Only the assigned mentor can cancel this session");
        }

        // Find learner for refund
        User learner = session.getParticipants().stream()
                .filter(p -> p.getRole() == ParticipantRole.LEARNER)
                .map(SessionParticipant::getUser)
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Learner not found for session"));

        // REFUND learner since mentor cancelled
        walletService.creditCoins(learner.getId(), SESSION_COIN_COST);
        logger.info("Refunded {} coins to learner {} due to mentor cancellation", SESSION_COIN_COST, learner.getId());

        // Update session
        session.setStatus(SessionStatus.CANCELLED);
        session.setCancelledBy(mentorId);
        session.setCancellationReason("Cancelled by mentor");
        sessionDao.save(session);

        // Send notification to learner
        SessionResponse response = buildSessionResponse(session);
        try {
            SessionBookingDto notification = new SessionBookingDto();
            notification.setSessionId(sessionId);
            notification.setMentorId(mentorId);
            notification.setLearnerId(learner.getId());
            notification.setLearnerName(learner.getUsername());
            notification.setMentorName(mentor.getUsername());
            notification.setNotificationType("CANCELLED_BY_MENTOR");
            notification.setActionable(false);
            notification.setMessage("Session cancelled by mentor. " + SESSION_COIN_COST + " coins refunded to your wallet.");

            messagingTemplate.convertAndSend(
                    "/queue/user/" + learner.getId() + "/sessions",
                    notification);
        } catch (Exception e) {
            logger.error("Failed to send cancellation notification: {}", e.getMessage());
        }

        logger.info("Session {} cancelled by mentor {} with refund", sessionId, mentorId);
        return response;
    }

    @Override
    @Transactional
    public SessionResponse cancelSessionByLearner(Long sessionId, Long learnerId) {
        logger.info("Learner {} cancelling session {}", learnerId, sessionId);

        Session session = sessionDao.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + sessionId));

        if (session.getStatus() == SessionStatus.COMPLETED || session.getStatus() == SessionStatus.CANCELLED) {
            throw new IllegalStateException("Cannot cancel session with status: " + session.getStatus());
        }

        // Verify learner authorization
        User learner = session.getParticipants().stream()
                .filter(p -> p.getRole() == ParticipantRole.LEARNER)
                .map(SessionParticipant::getUser)
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Learner not found for session"));

        if (!learner.getId().equals(learnerId)) {
            throw new UnauthorizedAccessException("Only the enrolled learner can cancel this session");
        }

        // Find mentor for notification
        User mentor = session.getParticipants().stream()
                .filter(p -> p.getRole() == ParticipantRole.MENTOR)
                .map(SessionParticipant::getUser)
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Mentor not found for session"));

        // REFUND learner - no penalty policy
        walletService.creditCoins(learnerId, SESSION_COIN_COST);
        logger.info("Refunded {} coins to learner {} for session cancellation", SESSION_COIN_COST, learnerId);

        // Update session
        session.setStatus(SessionStatus.CANCELLED);
        session.setCancelledBy(learnerId);
        session.setCancellationReason("Cancelled by learner");
        sessionDao.save(session);

        // Send notification to mentor
        SessionResponse response = buildSessionResponse(session);
        try {
            SessionBookingDto notification = new SessionBookingDto();
            notification.setSessionId(sessionId);
            notification.setMentorId(mentor.getId());
            notification.setLearnerId(learnerId);
            notification.setLearnerName(learner.getUsername());
            notification.setMentorName(mentor.getUsername());
            notification.setNotificationType("CANCELLED_BY_LEARNER");
            notification.setActionable(false);
            notification.setMessage("Session cancelled by " + learner.getUsername() + ". " + SESSION_COIN_COST + " coins refunded.");

            messagingTemplate.convertAndSend(
                    "/queue/user/" + mentor.getId() + "/sessions",
                    notification);
        } catch (Exception e) {
            logger.error("Failed to send cancellation notification: {}", e.getMessage());
        }

        logger.info("Session {} cancelled by learner {} with refund", sessionId, learnerId);
        return response;
    }

    @Override
    public MentorDashboardStatsResponse getMentorDashboardStats(Long mentorId) {
        // Stats Cards Data
        Long teachingSkillsCount = userTeachSkillRepository.countByUserId(mentorId);
        Long pendingRequests = sessionDao.countPendingRequestsByMentor(mentorId);
        Long completedSessions = sessionDao.countCompletedSessionsByMentor(mentorId);
        Long totalMinutes = sessionDao.getTotalMinutesTaughtByMentor(mentorId);
        Integer hoursTaught = (int) (totalMinutes / 60);

        // Session Status Data
        List<Object[]> statusData = sessionDao.getSessionStatusCountByMentor(mentorId);
        List<MentorDashboardStatsResponse.SessionStatusCount> sessionStatusData = statusData.stream()
                .map(row -> MentorDashboardStatsResponse.SessionStatusCount.builder()
                        .status(row[0].toString())
                        .count((Long) row[1])
                        .build())
                .collect(Collectors.toList());

        // Skills Distribution Data
        List<Object[]> skillsData = sessionDao.getSkillDistributionByMentor(mentorId);
        String[] colors = {"#667eea", "#764ba2", "#f093fb", "#f5576c", "#10b981"};
        List<MentorDashboardStatsResponse.SkillDistribution> skillsDistribution = new ArrayList<>();
        for (int i = 0; i < Math.min(skillsData.size(), 5); i++) {
            Object[] row = skillsData.get(i);
            skillsDistribution.add(MentorDashboardStatsResponse.SkillDistribution.builder()
                    .name((String) row[0])
                    .value((Long) row[1])
                    .color(colors[i % colors.length])
                    .build());
        }

        // Duration Analysis Data
        List<Object[]> durationData = sessionDao.getDurationAnalysisByMentor(mentorId);
        List<MentorDashboardStatsResponse.DurationAnalysis> durationAnalysis = durationData.stream()
                .map(row -> MentorDashboardStatsResponse.DurationAnalysis.builder()
                        .duration(row[0] + " min")
                        .count((Long) row[1])
                        .build())
                .collect(Collectors.toList());

        // Recent Activity Data
        List<Session> recentSessions = sessionDao.getRecentSessionsByMentor(mentorId, 5);
        List<MentorDashboardStatsResponse.RecentActivity> recentActivity = recentSessions.stream()
                .limit(5)
                .map(session -> {
                    String learnerName = session.getParticipants().stream()
                            .filter(p -> p.getRole() == ParticipantRole.LEARNER)
                            .map(p -> p.getUser().getUsername())
                            .findFirst()
                            .orElse("Unknown");
                    return MentorDashboardStatsResponse.RecentActivity.builder()
                            .skillName(session.getSkill() != null ? session.getSkill().getName() : "Unknown")
                            .learnerName(learnerName)
                            .durationMinutes(session.getDurationMinutes())
                            .status(session.getStatus().toString())
                            .build();
                })
                .collect(Collectors.toList());

        return MentorDashboardStatsResponse.builder()
                .teachingSkillsCount(teachingSkillsCount.intValue())
                .pendingRequestsCount(pendingRequests.intValue())
                .sessionsTaughtCount(completedSessions.intValue())
                .hoursTaught(hoursTaught)
                .sessionStatusData(sessionStatusData)
                .skillsDistribution(skillsDistribution)
                .durationAnalysis(durationAnalysis)
                .recentActivity(recentActivity)
                .build();
    }

    @Override
    public LearnerDashboardStatsResponse getLearnerDashboardStats(Long learnerId) {
        Long learningSkillsCount = userLearnSkillRepository.countByUserId(learnerId);
        Long upcomingSessions = sessionDao.countUpcomingSessionsByLearner(learnerId);
        Long completedSessions = sessionDao.countCompletedSessionsByLearner(learnerId);
        Long totalMinutes = sessionDao.getTotalMinutesLearnedByLearner(learnerId);
        Double hoursLearned = totalMinutes / 60.0;

        List<Object[]> skillProgressData = sessionDao.getSkillProgressByLearner(learnerId);
        List<LearnerDashboardStatsResponse.SkillProgress> skillProgressList = skillProgressData.stream()
                .map(row -> LearnerDashboardStatsResponse.SkillProgress.builder()
                        .skill((String) row[0])
                        .sessions(((Long) row[1]).intValue())
                        .hours(((Long) row[2]) / 60.0)
                        .build())
                .collect(Collectors.toList());

        List<Object[]> statusData = sessionDao.getSessionStatusCountByLearner(learnerId);
        List<LearnerDashboardStatsResponse.SessionStatusCount> sessionStatusCounts = statusData.stream()
                .map(row -> LearnerDashboardStatsResponse.SessionStatusCount.builder()
                        .status(row[0].toString())
                        .count((Long) row[1])
                        .build())
                .collect(Collectors.toList());

        return LearnerDashboardStatsResponse.builder()
                .learningSkillsCount(learningSkillsCount.intValue())
                .upcomingSessionsCount(upcomingSessions.intValue())
                .completedSessionsCount(completedSessions.intValue())
                .hoursLearned(hoursLearned)
                .skillProgressList(skillProgressList)
                .sessionStatusCounts(sessionStatusCounts)
                .build();
    }

    @Override
    public List<SessionResponse> getAllSessions() {
        return sessionDao.findAll()
                .stream()
                .map(this::buildSessionResponse)
                .collect(Collectors.toList());
    }

}
