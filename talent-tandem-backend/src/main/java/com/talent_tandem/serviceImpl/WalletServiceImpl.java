package com.talent_tandem.serviceImpl;

import com.talent_tandem.exception.InsufficientCoinsException;
import com.talent_tandem.exception.ResourceNotFoundException;
import com.talent_tandem.exception.UserNotFoundException;
import com.talent_tandem.model.User;
import com.talent_tandem.model.Wallet;
import com.talent_tandem.repository.IUserRepo;
import com.talent_tandem.repository.IWalletRepository;
import com.talent_tandem.responsedto.WalletResponse;
import com.talent_tandem.service.IWalletService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements IWalletService {

    private static final Logger logger = LoggerFactory.getLogger(WalletServiceImpl.class);
    
    private final IWalletRepository walletRepository;
    private final IUserRepo userRepository;

    @Override
    @Transactional
    public WalletResponse createWallet(Long userId, Integer initialCoins) {
        logger.info("Creating wallet for user ID: {} with {} coins", userId, initialCoins);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        if (walletRepository.existsByUserId(userId)) {
            logger.warn("Wallet already exists for user ID: {}", userId);
            throw new IllegalStateException("Wallet already exists for this user");
        }

        Wallet wallet = Wallet.builder()
                .user(user)
                .coins(initialCoins)
                .build();

        Wallet savedWallet = walletRepository.save(wallet);
        logger.info("Wallet created successfully for user ID: {} with {} coins", userId, initialCoins);

        return buildWalletResponse(savedWallet, "Wallet created successfully");
    }

    @Override
    public WalletResponse getWalletByUserId(Long userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user ID: " + userId));
        
        return buildWalletResponse(wallet, "Wallet retrieved successfully");
    }

    @Override
    @Transactional
    public WalletResponse creditCoins(Long userId, Integer coins) {
        if (coins <= 0) {
            throw new IllegalArgumentException("Coins to credit must be positive");
        }

        logger.info("Crediting {} coins to user ID: {}", coins, userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
        
        if (coins == 100 && !user.getHasLearnerProfile()) {
            user.setHasLearnerProfile(true);
            userRepository.save(user);
        }
        
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseGet(() -> {
                    logger.info("Wallet not found for user ID: {}. Creating new wallet.", userId);
                    Wallet newWallet = Wallet.builder()
                            .user(user)
                            .coins(0)
                            .build();
                    return walletRepository.save(newWallet);
                });

        wallet.setCoins(wallet.getCoins() + coins);
        Wallet updatedWallet = walletRepository.save(wallet);
        
        logger.info("Successfully credited {} coins to user ID: {}. New balance: {}", 
                    coins, userId, updatedWallet.getCoins());

        return buildWalletResponse(updatedWallet, coins + " coins credited successfully");
    }

    @Override
    @Transactional
    public WalletResponse debitCoins(Long userId, Integer coins) {
        if (coins <= 0) {
            throw new IllegalArgumentException("Coins to debit must be positive");
        }

        logger.info("Debiting {} coins from user ID: {}", coins, userId);
        
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user ID: " + userId));

        if (wallet.getCoins() < coins) {
            logger.error("Insufficient coins for user ID: {}. Required: {}, Available: {}", 
                        userId, coins, wallet.getCoins());
            throw new InsufficientCoinsException(
                "Insufficient coins. Required: " + coins + ", Available: " + wallet.getCoins()
            );
        }

        wallet.setCoins(wallet.getCoins() - coins);
        Wallet updatedWallet = walletRepository.save(wallet);
        
        logger.info("Successfully debited {} coins from user ID: {}. New balance: {}", 
                    coins, userId, updatedWallet.getCoins());

        return buildWalletResponse(updatedWallet, coins + " coins debited successfully");
    }

    @Override
    public boolean hasEnoughCoins(Long userId, Integer requiredCoins) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user ID: " + userId));
        
        return wallet.getCoins() >= requiredCoins;
    }

    private WalletResponse buildWalletResponse(Wallet wallet, String message) {
        return WalletResponse.builder()
                .id(wallet.getId())
                .userId(wallet.getUser().getId())
                .coins(wallet.getCoins())
                .message(message)
                .build();
    }
}
