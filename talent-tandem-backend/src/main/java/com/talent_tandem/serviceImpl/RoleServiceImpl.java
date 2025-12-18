package com.talent_tandem.serviceImpl;

import com.talent_tandem.enums.Role;
import com.talent_tandem.exception.RoleAlreadySelectedException;
import com.talent_tandem.exception.UserNotFoundException;
import com.talent_tandem.model.User;
import com.talent_tandem.repository.IUserRepo;
import com.talent_tandem.requestdto.RoleSelectionRequest;
import com.talent_tandem.responsedto.RoleSelectionResponse;
import com.talent_tandem.service.IRoleService;
import com.talent_tandem.service.IWalletService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements IRoleService {

    private static final Logger logger = LoggerFactory.getLogger(RoleServiceImpl.class);
    private static final int LEARNER_INITIAL_COINS = 100;
    private static final int TEACHER_INITIAL_COINS = 0;

    private final IUserRepo userRepository;
    private final IWalletService walletService;

    @Override
    @Transactional
    public RoleSelectionResponse becomeMentor(Long userId) {
        logger.info("User {} becoming mentor to earn coins", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        if (Boolean.TRUE.equals(user.getHasMentorProfile())) {
            logger.warn("User {} already has mentor profile", userId);
            return RoleSelectionResponse.builder()
                    .userId(user.getId())
                    .role(user.getRole())
                    .hasMentorProfile(true)
                    .hasLearnerProfile(user.getHasLearnerProfile())
                    .initialCoins(0)
                    .message("You are already a mentor")
                    .build();
        }

        user.setHasMentorProfile(true);
        user.setRole(Role.MENTOR);
        userRepository.save(user);

        walletService.creditCoins(userId, LEARNER_INITIAL_COINS);
        logger.info("Credited {} coins to user {} for becoming mentor", LEARNER_INITIAL_COINS, userId);

        return RoleSelectionResponse.builder()
                .userId(user.getId())
                .role(user.getRole())
                .hasMentorProfile(true)
                .hasLearnerProfile(user.getHasLearnerProfile())
                .initialCoins(LEARNER_INITIAL_COINS)
                .message("Congratulations! You are now a mentor. 100 coins added to your wallet.")
                .build();
    }

    @Override
    @Transactional
    public RoleSelectionResponse selectRole(RoleSelectionRequest request) {
        logger.info("Role selection initiated for user ID: {} with role: {}", 
                    request.getUserId(), request.getRole());

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + request.getUserId()));

        if (Boolean.TRUE.equals(user.getRoleSelected())) {
            logger.error("Role already selected for user ID: {}", request.getUserId());
            throw new RoleAlreadySelectedException("Role has already been selected for this user");
        }

        user.setRole(request.getRole());
        user.setRoleSelected(true);

        int initialCoins;
        
        if (request.getRole() == Role.LEARNER) {
            user.setHasLearnerProfile(true);
            user.setHasMentorProfile(false);
            initialCoins = LEARNER_INITIAL_COINS;
            logger.info("Setting user ID: {} as LEARNER with {} coins", request.getUserId(), initialCoins);
        } else {
            user.setHasMentorProfile(true);
            user.setHasLearnerProfile(false);
            initialCoins = TEACHER_INITIAL_COINS;
            logger.info("Setting user ID: {} as TEACHER with {} coins", request.getUserId(), initialCoins);
        }

        userRepository.save(user);
        walletService.createWallet(user.getId(), initialCoins);

        logger.info("Role selection completed successfully for user ID: {}", request.getUserId());

        return RoleSelectionResponse.builder()
                .userId(user.getId())
                .role(user.getRole())
                .hasMentorProfile(user.getHasMentorProfile())
                .hasLearnerProfile(user.getHasLearnerProfile())
                .initialCoins(initialCoins)
                .message("Role selected successfully and wallet created with " + initialCoins + " coins")
                .build();
    }
}
