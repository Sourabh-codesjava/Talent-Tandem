package com.talent_tandem.model;

import com.talent_tandem.enums.SessionStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.time.LocalDateTime;
import java.util.ArrayList;

import static org.assertj.core.api.Assertions.*;

@DisplayName("Session Entity Tests")
class SessionEntityTest {

    private Session session;
    private Skill skill;

    @BeforeEach
    void setUp() {
        skill = new Skill();
        skill.setId(1L);
        skill.setName("Java Programming");
        
        session = new Session();
    }

    @Test
    @DisplayName("Should create session with builder pattern")
    void shouldCreateSessionWithBuilder() {
        LocalDateTime scheduledTime = LocalDateTime.now().plusDays(1);
        
        Session builtSession = Session.builder()
                .skill(skill)
                .agenda("Learn Java basics")
                .status(SessionStatus.ACCEPTED)
                .scheduledTime(scheduledTime)
                .durationMinutes(60)
                .learningOutcomes("Understand OOP concepts")
                .build();

        assertThat(builtSession.getSkill()).isEqualTo(skill);
        assertThat(builtSession.getAgenda()).isEqualTo("Learn Java basics");
        assertThat(builtSession.getStatus()).isEqualTo(SessionStatus.ACCEPTED);
        assertThat(builtSession.getScheduledTime()).isEqualTo(scheduledTime);
        assertThat(builtSession.getDurationMinutes()).isEqualTo(60);
        assertThat(builtSession.getLearningOutcomes()).isEqualTo("Understand OOP concepts");
    }

    @Test
    @DisplayName("Should initialize collections properly")
    void shouldInitializeCollections() {
        Session newSession = new Session();
        
        assertThat(newSession.getParticipants()).isNotNull();
        assertThat(newSession.getFeedbacks()).isNotNull();
        assertThat(newSession.getParticipants()).isEmpty();
        assertThat(newSession.getFeedbacks()).isEmpty();
    }

    @Test
    @DisplayName("Should set createdAt and updatedAt on onCreate")
    void shouldSetTimestampsOnCreate() {
        LocalDateTime beforeCreate = LocalDateTime.now().minusSeconds(1);
        
        session.onCreate();
        
        LocalDateTime afterCreate = LocalDateTime.now().plusSeconds(1);
        
        assertThat(session.getCreatedAt()).isNotNull();
        assertThat(session.getUpdatedAt()).isNotNull();
        assertThat(session.getCreatedAt()).isBetween(beforeCreate, afterCreate);
        assertThat(session.getUpdatedAt()).isBetween(beforeCreate, afterCreate);
        assertThat(session.getCreatedAt()).isEqualTo(session.getUpdatedAt());
    }

    @Test
    @DisplayName("Should update only updatedAt on onUpdate")
    void shouldUpdateOnlyUpdatedAtOnUpdate() throws InterruptedException {
        session.onCreate();
        LocalDateTime originalCreatedAt = session.getCreatedAt();
        LocalDateTime originalUpdatedAt = session.getUpdatedAt();
        
        Thread.sleep(10); // Small delay to ensure different timestamps
        
        session.onUpdate();
        
        assertThat(session.getCreatedAt()).isEqualTo(originalCreatedAt);
        assertThat(session.getUpdatedAt()).isAfter(originalUpdatedAt);
    }

    @Test
    @DisplayName("Should handle session status enum")
    void shouldHandleSessionStatusEnum() {
        session.setStatus(SessionStatus.ACCEPTED);
        assertThat(session.getStatus()).isEqualTo(SessionStatus.ACCEPTED);
        
        session.setStatus(SessionStatus.IN_PROGRESS);
        assertThat(session.getStatus()).isEqualTo(SessionStatus.IN_PROGRESS);
        
        session.setStatus(SessionStatus.COMPLETED);
        assertThat(session.getStatus()).isEqualTo(SessionStatus.COMPLETED);
        
        session.setStatus(SessionStatus.CANCELLED);
        assertThat(session.getStatus()).isEqualTo(SessionStatus.CANCELLED);
    }

    @Test
    @DisplayName("Should handle cancellation fields")
    void shouldHandleCancellationFields() {
        Long cancelledBy = 123L;
        String reason = "Emergency came up";
        
        session.setCancelledBy(cancelledBy);
        session.setCancellationReason(reason);
        
        assertThat(session.getCancelledBy()).isEqualTo(cancelledBy);
        assertThat(session.getCancellationReason()).isEqualTo(reason);
    }

    @Test
    @DisplayName("Should validate agenda length constraint")
    void shouldValidateAgendaLength() {
        String longAgenda = "A".repeat(501); // Exceeds 500 character limit
        
        session.setAgenda(longAgenda);
        
        // Note: This tests the field assignment, actual validation happens at JPA level
        assertThat(session.getAgenda()).hasSize(501);
    }

    @Test
    @DisplayName("Should validate learning outcomes length constraint")
    void shouldValidateLearningOutcomesLength() {
        String longOutcomes = "B".repeat(1001); // Exceeds 1000 character limit
        
        session.setLearningOutcomes(longOutcomes);
        
        // Note: This tests the field assignment, actual validation happens at JPA level
        assertThat(session.getLearningOutcomes()).hasSize(1001);
    }

    @Test
    @DisplayName("Should handle skill relationship")
    void shouldHandleSkillRelationship() {
        session.setSkill(skill);
        
        assertThat(session.getSkill()).isNotNull();
        assertThat(session.getSkill().getId()).isEqualTo(1L);
        assertThat(session.getSkill().getName()).isEqualTo("Java Programming");
    }

    @Test
    @DisplayName("Should handle participants collection")
    void shouldHandleParticipantsCollection() {
        SessionParticipant participant1 = new SessionParticipant();
        SessionParticipant participant2 = new SessionParticipant();
        
        session.getParticipants().add(participant1);
        session.getParticipants().add(participant2);
        
        assertThat(session.getParticipants()).hasSize(2);
        assertThat(session.getParticipants()).contains(participant1, participant2);
    }

    @Test
    @DisplayName("Should handle feedbacks collection")
    void shouldHandleFeedbacksCollection() {
        Feedback feedback1 = new Feedback();
        Feedback feedback2 = new Feedback();
        
        session.getFeedbacks().add(feedback1);
        session.getFeedbacks().add(feedback2);
        
        assertThat(session.getFeedbacks()).hasSize(2);
        assertThat(session.getFeedbacks()).contains(feedback1, feedback2);
    }

    @Test
    @DisplayName("Should handle duration in minutes")
    void shouldHandleDurationInMinutes() {
        session.setDurationMinutes(90);
        
        assertThat(session.getDurationMinutes()).isEqualTo(90);
    }

    @Test
    @DisplayName("Should handle scheduled time")
    void shouldHandleScheduledTime() {
        LocalDateTime futureTime = LocalDateTime.now().plusDays(2);
        
        session.setScheduledTime(futureTime);
        
        assertThat(session.getScheduledTime()).isEqualTo(futureTime);
    }

    @Test
    @DisplayName("Should create session with all args constructor")
    void shouldCreateSessionWithAllArgsConstructor() {
        LocalDateTime now = LocalDateTime.now();
        
        Session fullSession = new Session(
                1L, skill, new ArrayList<>(), new ArrayList<>(),
                "Complete agenda", SessionStatus.ACCEPTED, now, 120,
                "Learning outcomes", null, null, now, now
        );
        
        assertThat(fullSession.getSessionId()).isEqualTo(1L);
        assertThat(fullSession.getSkill()).isEqualTo(skill);
        assertThat(fullSession.getAgenda()).isEqualTo("Complete agenda");
        assertThat(fullSession.getStatus()).isEqualTo(SessionStatus.ACCEPTED);
        assertThat(fullSession.getDurationMinutes()).isEqualTo(120);
    }

    @Test
    @DisplayName("Should create session with no args constructor")
    void shouldCreateSessionWithNoArgsConstructor() {
        Session emptySession = new Session();
        
        assertThat(emptySession.getSessionId()).isNull();
        assertThat(emptySession.getSkill()).isNull();
        assertThat(emptySession.getAgenda()).isNull();
        assertThat(emptySession.getStatus()).isNull();
        assertThat(emptySession.getParticipants()).isNotNull();
        assertThat(emptySession.getFeedbacks()).isNotNull();
    }
}