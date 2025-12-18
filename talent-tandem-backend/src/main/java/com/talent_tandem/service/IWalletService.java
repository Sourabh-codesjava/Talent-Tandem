package com.talent_tandem.service;

import com.talent_tandem.responsedto.WalletResponse;

public interface IWalletService {
    WalletResponse createWallet(Long userId, Integer initialCoins);
    WalletResponse getWalletByUserId(Long userId);
    WalletResponse creditCoins(Long userId, Integer coins);
    WalletResponse debitCoins(Long userId, Integer coins);
    boolean hasEnoughCoins(Long userId, Integer requiredCoins);
}
