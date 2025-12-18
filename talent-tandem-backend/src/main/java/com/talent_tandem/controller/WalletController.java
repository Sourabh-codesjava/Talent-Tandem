package com.talent_tandem.controller;

import com.talent_tandem.responsedto.WalletResponse;
import com.talent_tandem.security.JwtUtil;
import com.talent_tandem.service.IWalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final IWalletService walletService;
    private final JwtUtil jwtUtil;

    @GetMapping("")
    public ResponseEntity<WalletResponse> getCurrentUserWallet(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);
        WalletResponse response = walletService.getWalletByUserId(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<WalletResponse> getWallet(@PathVariable Long userId) {
        WalletResponse response = walletService.getWalletByUserId(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/credit/{userId}")
    public ResponseEntity<WalletResponse> creditCoins(
            @PathVariable Long userId,
            @RequestParam Integer coins) {
        WalletResponse response = walletService.creditCoins(userId, coins);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/debit/{userId}")
    public ResponseEntity<WalletResponse> debitCoins(
            @PathVariable Long userId,
            @RequestParam Integer coins) {
        WalletResponse response = walletService.debitCoins(userId, coins);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check/{userId}")
    public ResponseEntity<Boolean> checkCoins(
            @PathVariable Long userId,
            @RequestParam Integer requiredCoins) {
        boolean hasEnough = walletService.hasEnoughCoins(userId, requiredCoins);
        return ResponseEntity.ok(hasEnough);
    }

    @PostMapping("/complete-learner-setup")
    public ResponseEntity<WalletResponse> completeLearnerSetup(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);
        WalletResponse response = walletService.creditCoins(userId, 100);
        return ResponseEntity.ok(response);
    }
}
