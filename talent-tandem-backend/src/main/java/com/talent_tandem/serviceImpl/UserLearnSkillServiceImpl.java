package com.talent_tandem.serviceImpl;

import com.talent_tandem.dao.IAvailabilityDao;
import com.talent_tandem.dao.ISkillDao;
import com.talent_tandem.dao.IUserDao;
import com.talent_tandem.dao.IUserLearnSkillDao;
import com.talent_tandem.exception.ResourceNotFoundException;
import com.talent_tandem.exception.UserNotFoundException;
import com.talent_tandem.exception.ValidationException;
import com.talent_tandem.model.Availability;
import com.talent_tandem.model.Skill;
import com.talent_tandem.model.User;
import com.talent_tandem.model.UserLearnSkill;
import com.talent_tandem.requestdto.UserLearnSkillRequest;
import com.talent_tandem.responsedto.UserLearnSkillResponse;
import com.talent_tandem.service.IUserLearnSkillService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserLearnSkillServiceImpl implements IUserLearnSkillService {

        private final IUserDao userDao;
        private final ISkillDao skillDao;
        private final IUserLearnSkillDao learnSkillDao;
        private final IAvailabilityDao availabilityDao;
        private final WalletServiceImpl walletService;

        @Override
        @Transactional
        public UserLearnSkillResponse createLearnSkill(UserLearnSkillRequest request) {

                if (learnSkillDao.existsByUserIdAndSkillId(request.getUserId(), request.getSkillId())) {
                        throw new ValidationException("Skill already exists for this learner");
                }

                User user = userDao.findById(request.getUserId())
                                .orElseThrow(() -> new UserNotFoundException(
                                                "User not found with id: " + request.getUserId()));

                Skill skill = skillDao.findById(request.getSkillId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Skill not found with id: " + request.getSkillId()));

                user.setHasLearnerProfile(true);
                userDao.save(user);

                user.setHasLearnerProfile(true);
                userDao.save(user);
                Availability availability = availabilityDao.findByUserId(user.getId())
                                .orElse(new Availability());
                availability.setUser(user);
                availability.setDayOfWeek(request.getDayOfWeek());
                availability.setStartTime(request.getStartTime());
                availability.setEndTime(request.getEndTime());

                Availability savedAvailability = availabilityDao.save(availability);
                UserLearnSkill learnSkill = UserLearnSkill.builder()
                                .user(user)
                                .skill(skill)
                                .priorityLevel(request.getPriorityLevel())
                                .preferredMode(request.getPreferredMode())
                                .availability(savedAvailability)
                                .build();

                UserLearnSkill saved = learnSkillDao.save(learnSkill);
                return buildResponse(saved);
        }

        @Override
        public UserLearnSkillResponse getLearnSkill(Long id) {

                UserLearnSkill learnSkill = learnSkillDao.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Learn skill not found with id: " + id));

                return buildResponse(learnSkill);
        }

        @Override
        public List<UserLearnSkillResponse> getLearnSkillsByUserId(Long userId) {
                List<UserLearnSkill> learnSkills = learnSkillDao.findByUserId(userId);
                return learnSkills.stream()
                                .map(this::buildResponse)
                                .collect(Collectors.toList());
        }

        private UserLearnSkillResponse buildResponse(UserLearnSkill learnSkill) {

                Optional<Availability> availabilityOpt = Optional.ofNullable(learnSkill.getAvailability());

                return UserLearnSkillResponse.builder()
                                .id(learnSkill.getId())
                                .userId(learnSkill.getUser().getId())
                                .skillId(learnSkill.getSkill().getId())
                                .skillName(learnSkill.getSkill().getName())
                                .priorityLevel(learnSkill.getPriorityLevel())
                                .preferredMode(learnSkill.getPreferredMode())
                                .dayOfWeek(availabilityOpt.map(a -> a.getDayOfWeek().name()).orElse(null))
                                .startTime(availabilityOpt.map(Availability::getStartTime).orElse(null))
                                .endTime(availabilityOpt.map(Availability::getEndTime).orElse(null))
                                .createdAt(learnSkill.getCreatedAt().toString())
                                .build();
        }

        @Override
        @Transactional
        public void deleteLearnSkill(Long id) {
                learnSkillDao.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Learn skill not found with id: " + id));
                learnSkillDao.deleteById(id);
        }
}
