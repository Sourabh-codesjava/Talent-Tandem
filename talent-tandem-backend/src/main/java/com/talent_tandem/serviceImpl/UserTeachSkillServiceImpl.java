package com.talent_tandem.serviceImpl;

import com.talent_tandem.dao.IAvailabilityDao;
import com.talent_tandem.dao.ISkillDao;
import com.talent_tandem.dao.IUserDao;
import com.talent_tandem.dao.IUserTeachSkillDao;
import com.talent_tandem.enums.PreferedMode;
import com.talent_tandem.exception.ResourceNotFoundException;
import com.talent_tandem.exception.UserNotFoundException;
import com.talent_tandem.exception.ValidationException;
import com.talent_tandem.model.Availability;
import com.talent_tandem.model.Skill;
import com.talent_tandem.model.User;
import com.talent_tandem.model.UserTeachSkill;
import com.talent_tandem.requestdto.MatchRequest;
import com.talent_tandem.requestdto.UserTeachSkillRequest;
import com.talent_tandem.responsedto.UserTeachSkillResponse;
import com.talent_tandem.responsedto.MentorMatchResponse;
import com.talent_tandem.service.IAIService;
import com.talent_tandem.service.IUserTeachSkillService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
import com.talent_tandem.enums.Level;

@Service
@RequiredArgsConstructor
public class UserTeachSkillServiceImpl implements IUserTeachSkillService {

    private final IUserDao userDao;
    private final ISkillDao skillDao;
    private final IUserTeachSkillDao teachSkillDao;
    private final IAvailabilityDao availabilityDao;
    private final IAIService aiService;

    @Override
    public List<UserTeachSkillResponse> addBulkTeachSkills(List<UserTeachSkillRequest> requests) {
        try {
            if (requests == null || requests.isEmpty()) {
                throw new ValidationException("Request list cannot be empty");
            }

            return requests.stream()
                    .map(this::addTeachSkill)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to add bulk teach skills: " + e.getMessage(), e);
        }
    }

    @Override
    public UserTeachSkillResponse addTeachSkill(UserTeachSkillRequest request) {
        try {
            validateTeachSkillRequest(request);

            if (teachSkillDao.existsByUserIdAndSkillId(request.getUserId(), request.getSkillId())) {
                throw new ValidationException("Skill already exists");
            }

            User user = userDao.findById(request.getUserId())
                    .orElseThrow(() -> new UserNotFoundException("User not found with id: " + request.getUserId()));

            Skill skill = skillDao.findById(request.getSkillId())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Skill not found with id: " + request.getSkillId()));

            user.setHasMentorProfile(true);
            userDao.save(user);

            Availability availability = availabilityDao.findByUserId(user.getId())
                    .orElse(new Availability());

            availability.setUser(user);
            availability.setDayOfWeek(request.getDayOfWeek());
            availability.setStartTime(request.getStartTime());
            availability.setEndTime(request.getEndTime());

            Availability savedAvailability = availabilityDao.save(availability);

            UserTeachSkill teachSkill = UserTeachSkill.builder()
                    .user(user)
                    .skill(skill)
                    .proficiencyLevel(request.getProficiencyLevel())
                    .preferredMode(request.getPreferredMode())
                    .confidenceScore(request.getConfidenceScore())
                    .availability(savedAvailability)
                    .build();

            UserTeachSkill saved = teachSkillDao.save(teachSkill);
            return buildTeachResponse(saved);
        } catch (ValidationException | UserNotFoundException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to add teach skill: " + e.getMessage(), e);
        }
    }

    @Override
    public List<UserTeachSkillResponse> getTeachSkillsByUser(Long userId) {
        try {
            if (userId == null || userId <= 0) {
                throw new ValidationException("Invalid user ID");
            }

            userDao.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

            return teachSkillDao.findByUserId(userId)
                    .stream()
                    .map(this::buildTeachResponse)
                    .collect(Collectors.toList());
        } catch (ValidationException | UserNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve teach skills for user: " + e.getMessage(), e);
        }
    }

    @Override
    public List<MentorMatchResponse> findMatches(MatchRequest request) {
        try {
            validateMatchRequest(request);

            if (request.getPreferredMode() == null) {
                throw new ValidationException("Preferred mode is required");
            }
            if (request.getPriorityLevel() == null) {
                throw new ValidationException("Priority level is required");
            }

            skillDao.findById(request.getSkillId())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Skill not found with id: " + request.getSkillId()));

            List<UserTeachSkill> teachers = teachSkillDao.findMatches(
                    request.getSkillId(),
                    request.getPreferredMode(),
                    request.getPriorityLevel());

            if (teachers.isEmpty()) {
                throw new ResourceNotFoundException("No mentors found for the specified criteria");
            }

            return teachers.stream()
                    .map(this::buildMatchResponse)
                    .collect(Collectors.toList());

        } catch (ValidationException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to find matches: " + e.getMessage(), e);
        }
    }

    private UserTeachSkillResponse buildTeachResponse(UserTeachSkill t) {
        try {
            if (t == null) {
                throw new IllegalArgumentException("UserTeachSkill cannot be null");
            }

            Availability a = t.getAvailability();

            return UserTeachSkillResponse.builder()
                    .teachId(t.getTeachId())
                    .userId(t.getUser() != null ? t.getUser().getId() : null)
                    .userName(t.getUser() != null ? t.getUser().getUsername() : "Unknown")
                    .skillId(t.getSkill() != null ? t.getSkill().getId() : null)
                    .skillName(t.getSkill() != null ? t.getSkill().getName() : "Unknown")
                    .proficiencyLevel(t.getProficiencyLevel())
                    .preferredMode(t.getPreferredMode())
                    .confidenceScore(t.getConfidenceScore())
                    .dayOfWeek(a != null && a.getDayOfWeek() != null ? a.getDayOfWeek().name() : "Not specified")
                    .startTime(a != null ? a.getStartTime() : null)
                    .endTime(a != null ? a.getEndTime() : null)
                    .createdAt(t.getCreatedAt() != null ? t.getCreatedAt().toString() : null)
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Failed to build teach skill response: " + e.getMessage(), e);
        }
    }

    private MentorMatchResponse buildMatchResponse(UserTeachSkill t) {
        try {
            User user = t.getUser();

            String explanation = String.format(
                    "%s is an experienced %s mentor with %s proficiency level and confidence score of %d/10. Available for %s sessions.",
                    user.getFirstName() != null ? user.getFirstName() : user.getUsername(),
                    t.getSkill() != null ? t.getSkill().getName() : "this skill",
                    t.getProficiencyLevel() != null ? t.getProficiencyLevel().name() : "INTERMEDIATE",
                    t.getConfidenceScore(),
                    t.getPreferredMode() != null ? t.getPreferredMode().name().replace("_", " ").toLowerCase()
                            : "flexible");

            return MentorMatchResponse.builder()
                    .mentorId(user.getId())
                    .mentorName(user.getUsername())
                    .profileImage(user.getProfilePhoto())
                    .skillId(t.getSkill() != null ? t.getSkill().getId() : null)
                    .proficiencyLevel(t.getProficiencyLevel())
                    .confidenceScore(t.getConfidenceScore())
                    .preferredMode(t.getPreferredMode())
                    .matchExplanation(explanation)
                    .city(user.getCity())
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Failed to build match response: " + e.getMessage(), e);
        }
    }

    private void validateTeachSkillRequest(UserTeachSkillRequest request) {
        if (request == null) {
            throw new ValidationException("Request cannot be null");
        }
        if (request.getUserId() == null || request.getUserId() <= 0) {
            throw new ValidationException("Invalid user ID");
        }
        if (request.getSkillId() == null || request.getSkillId() <= 0) {
            throw new ValidationException("Invalid skill ID");
        }
        if (request.getConfidenceScore() == null || request.getConfidenceScore() < 1
                || request.getConfidenceScore() > 10) {
            throw new ValidationException("Confidence score must be between 1-10");
        }
        if (request.getProficiencyLevel() == null) {
            throw new ValidationException("Proficiency level is required");
        }
        if (request.getPreferredMode() == null) {
            throw new ValidationException("Preferred mode is required");
        }
        if (request.getDayOfWeek() == null) {
            throw new ValidationException("Day of week is required");
        }
        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new ValidationException("Start time and end time are required");
        }
        if (request.getStartTime().compareTo(request.getEndTime()) >= 0) {
            throw new ValidationException("Start time must be before end time");
        }
    }

    @Override
    public List<UserTeachSkillResponse> getFilteredMentors(Long skillId, String mode, String level) {
        try {
            PreferedMode preferedMode = PreferedMode.valueOf(mode.toUpperCase());
            Level proficiencyLevel = Level.valueOf(level.toUpperCase());

            List<UserTeachSkill> mentors = teachSkillDao.findMatches(skillId, preferedMode, proficiencyLevel);

            return mentors.stream()
                    .map(this::buildTeachResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to get filtered mentors: " + e.getMessage(), e);
        }
    }

    private void validateMatchRequest(MatchRequest request) {
        if (request == null) {
            throw new ValidationException("Request cannot be null");
        }
        if (request.getSkillId() == null || request.getSkillId() <= 0) {
            throw new ValidationException("Invalid skill ID");
        }
        if (request.getStartTime() != null && request.getEndTime() != null &&
                request.getStartTime().compareTo(request.getEndTime()) >= 0) {
            throw new ValidationException("Start time must be before end time");
        }
    }

    @Override
    @jakarta.transaction.Transactional
    public void deleteTeachSkill(Long id) {
        teachSkillDao.findById(id);
        teachSkillDao.deleteById(id);
    }
}
